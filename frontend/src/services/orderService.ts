import type { Order, Address, CartLineItem } from '@/types';

const USE_MOCK = import.meta.env.VITE_API_USE_MOCK !== 'false';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000';
const ORDERS_STORAGE_KEY = 'medusa_orders';

// ============================================================================
// Medusa API Response Types
// ============================================================================

interface MedusaOrderResponse {
  order: MedusaOrder;
}

interface MedusaOrdersResponse {
  orders: MedusaOrder[];
  count: number;
  offset: number;
  limit: number;
}

interface MedusaOrder {
  id: string;
  display_id: number;
  email: string;
  items: MedusaOrderItem[];
  shipping_address: MedusaAddress;
  billing_address: MedusaAddress;
  shipping_methods: MedusaShippingMethod[];
  subtotal: number;
  tax_total: number;
  shipping_total: number;
  total: number;
  status: string;
  created_at: string;
  payment_collections: MedusaPaymentCollection[];
  fulfillment_status?: string;
  payment_status?: string;
}

interface MedusaOrderItem {
  id: string;
  title: string;
  subtitle?: string;
  thumbnail?: string;
  quantity: number;
  unit_price: number;
  total: number;
  product_id?: string;
  variant_id?: string;
  sku?: string;
}

interface MedusaAddress {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  company?: string;
  address_1: string;
  address_2?: string;
  city: string;
  postal_code: string;
  country_code: string;
}

interface MedusaShippingMethod {
  id: string;
  name: string;
  total: number;
}

interface MedusaPaymentCollection {
  id: string;
  payment_sessions?: MedusaPaymentSession[];
}

interface MedusaPaymentSession {
  id: string;
  provider_id: string;
  status: string;
  amount: number;
}

// ============================================================================
// Mapping Functions
// ============================================================================

function mapMedusaAddress(addr?: MedusaAddress | null): Address {
  if (!addr) {
    return {
      firstName: '',
      lastName: '',
      email: '',
      address1: '',
      city: '',
      postalCode: '',
      country: '',
    };
  }
  return {
    firstName: addr.first_name ?? '',
    lastName: addr.last_name ?? '',
    email: addr.email ?? '',
    phone: addr.phone,
    company: addr.company,
    address1: addr.address_1 ?? '',
    address2: addr.address_2,
    city: addr.city ?? '',
    postalCode: addr.postal_code ?? '',
    country: addr.country_code ?? '',
  };
}

function mapMedusaOrderItem(item: MedusaOrderItem): CartLineItem {
  return {
    id: item.id,
    productId: item.product_id ?? '',
    variantId: item.variant_id ?? '',
    title: item.title,
    thumbnail: item.thumbnail,
    quantity: item.quantity,
    unitPrice: item.unit_price,
    total: item.total,
    sku: item.sku,
  };
}

function mapMedusaOrder(medusaOrder: MedusaOrder): Order {
  const paymentProvider =
    medusaOrder.payment_collections?.[0]?.payment_sessions?.[0]?.provider_id ?? '';

  return {
    id: medusaOrder.id,
    displayId: medusaOrder.display_id,
    email: medusaOrder.email,
    items: medusaOrder.items.map(mapMedusaOrderItem),
    shippingAddress: mapMedusaAddress(medusaOrder.shipping_address),
    billingAddress: mapMedusaAddress(medusaOrder.billing_address),
    shippingMethods: (medusaOrder.shipping_methods ?? []).map((sm) => ({
      id: sm.id,
      name: sm.name,
      price: sm.total,
    })),
    paymentMethod: paymentProvider,
    subtotal: medusaOrder.subtotal ?? 0,
    taxTotal: medusaOrder.tax_total ?? 0,
    shippingTotal: medusaOrder.shipping_total ?? 0,
    total: medusaOrder.total ?? 0,
    status: medusaOrder.status ?? 'pending',
    createdAt: medusaOrder.created_at,
    fulfillmentStatus: medusaOrder.fulfillment_status,
    paymentStatus: medusaOrder.payment_status,
  };
}

// ============================================================================
// Mock Data Storage
// ============================================================================

function getStoredOrders(): Order[] {
  try {
    const stored = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as Order[];
    }
  } catch {
    // Ignore parse errors
  }
  return [];
}

function storeOrders(orders: Order[]): void {
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  } catch {
    // Silently fail — localStorage may be unavailable
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// Order Service
// ============================================================================

/**
 * OrderService — handles order API calls against Medusa.
 * Switches between mock and real API based on VITE_API_USE_MOCK env var.
 */
export const OrderService = {
  /** Get a single order by ID */
  async getOrder(orderId: string): Promise<Order | null> {
    if (USE_MOCK) {
      await delay(300);
      const orders = getStoredOrders();
      const order = orders.find((o) => o.id === orderId);
      return order ?? null;
    }

    const response = await fetch(`${API_URL}/store/orders/${orderId}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Failed to fetch order: ${response.statusText}`);
    }
    const data: MedusaOrderResponse = await response.json();
    return mapMedusaOrder(data.order);
  },

  /** List orders for the authenticated customer or by email */
  async listOrders(
    options?: {
      email?: string;
      offset?: number;
      limit?: number;
    },
  ): Promise<{ orders: Order[]; count: number }> {
    if (USE_MOCK) {
      await delay(400);
      let orders = getStoredOrders();

      // Filter by email if provided
      if (options?.email) {
        orders = orders.filter((o) => o.email === options.email);
      }

      // Sort by createdAt descending (newest first)
      orders.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      const count = orders.length;
      const offset = options?.offset ?? 0;
      const limit = options?.limit ?? 10;
      const paginated = orders.slice(offset, offset + limit);

      return { orders: paginated, count };
    }

    const params = new URLSearchParams();
    if (options?.email) params.set('email', options.email);
    if (options?.offset !== undefined)
      params.set('offset', String(options.offset));
    if (options?.limit !== undefined) params.set('limit', String(options.limit));

    // Try authenticated endpoint first, fall back to email-based lookup
    const url = `${API_URL}/store/customers/me/orders?${params.toString()}`;
    const response = await fetch(url, {
      headers: {
        // Medusa auth token would be included here in production
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Fall back to email-based lookup for guest users
      if (options?.email) {
        const fallbackUrl = `${API_URL}/store/orders?email=${encodeURIComponent(options.email)}&${params.toString()}`;
        const fallbackResponse = await fetch(fallbackUrl);
        if (!fallbackResponse.ok) {
          throw new Error(
            `Failed to fetch orders: ${fallbackResponse.statusText}`,
          );
        }
        const fallbackData: MedusaOrdersResponse =
          await fallbackResponse.json();
        return {
          orders: fallbackData.orders.map(mapMedusaOrder),
          count: fallbackData.count,
        };
      }
      throw new Error(`Failed to fetch orders: ${response.statusText}`);
    }

    const data: MedusaOrdersResponse = await response.json();
    return {
      orders: data.orders.map(mapMedusaOrder),
      count: data.count,
    };
  },

  /** Store an order in mock localStorage (called after checkout completion) */
  storeOrderInMock(order: Order): void {
    const orders = getStoredOrders();
    // Check if order already exists, update it if so
    const existingIndex = orders.findIndex((o) => o.id === order.id);
    if (existingIndex >= 0) {
      orders[existingIndex] = order;
    } else {
      orders.push(order);
    }
    storeOrders(orders);
  },

  /** Remove an order from mock localStorage */
  removeOrderFromMock(orderId: string): void {
    const orders = getStoredOrders();
    const filtered = orders.filter((o) => o.id !== orderId);
    storeOrders(filtered);
  },

  /** Reset mock order storage (for testing) */
  __resetMock(): void {
    try {
      localStorage.removeItem(ORDERS_STORAGE_KEY);
    } catch {
      // Silently fail
    }
  },

  /** Get all stored orders directly (for testing) */
  __getMockOrders(): Order[] {
    return getStoredOrders();
  },
};
