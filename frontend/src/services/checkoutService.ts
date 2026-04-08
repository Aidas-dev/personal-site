import type { Address, Order, ShippingMethod, PaymentSession } from '@/types';

const USE_MOCK = import.meta.env.VITE_API_USE_MOCK !== 'false';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000';

// ============================================================================
// Medusa API Response Types
// ============================================================================

interface MedusaCartResponse {
  cart: MedusaCart;
}

interface MedusaCart {
  id: string;
  items: MedusaLineItem[];
  subtotal: number;
  tax_total: number;
  total: number;
  item_total: number;
  shipping_methods: MedusaShippingMethod[];
  payment_collection?: MedusaPaymentCollection;
  shipping_address?: MedusaAddress;
  billing_address?: MedusaAddress;
  email?: string;
}

interface MedusaLineItem {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface MedusaShippingMethod {
  id: string;
  name: string;
  total: number;
}

interface MedusaPaymentCollection {
  id: string;
  payment_sessions: MedusaPaymentSession[];
}

interface MedusaPaymentSession {
  id: string;
  provider_id: string;
  status: string;
  amount: number;
}

interface MedusaOrderResponse {
  order: MedusaOrder;
}

interface MedusaOrder {
  id: string;
  display_id: number;
  email: string;
  items: MedusaLineItem[];
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
}

interface MedusaAddress {
  first_name: string;
  last_name: string;
  address_1: string;
  address_2?: string;
  city: string;
  postal_code: string;
  country_code: string;
  phone?: string;
  company?: string;
}

// ============================================================================
// Mapping Functions
// ============================================================================

function mapMedusaAddress(addr?: MedusaAddress): Address {
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
    email: '',
    phone: addr.phone,
    company: addr.company,
    address1: addr.address_1 ?? '',
    address2: addr.address_2,
    city: addr.city ?? '',
    postalCode: addr.postal_code ?? '',
    country: addr.country_code ?? '',
  };
}

// ============================================================================
// Mock Data Helpers
// ============================================================================

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let mockPaymentSessions: PaymentSession[] = [];
let mockOrder: Order | null = null;

function createMockPaymentSessions(cartId: string): PaymentSession[] {
  mockPaymentSessions = [
    {
      id: `ps-${cartId}-stripe`,
      providerId: 'pp_stripe_stripe',
      status: 'pending',
    },
    {
      id: `ps-${cartId}-apple-pay`,
      providerId: 'pp_stripe-apple-pay_stripe',
      status: 'pending',
    },
    {
      id: `ps-${cartId}-swedbank`,
      providerId: 'pp_swedbank',
      status: 'pending',
    },
    {
      id: `ps-${cartId}-seb`,
      providerId: 'pp_seb',
      status: 'pending',
    },
    {
      id: `ps-${cartId}-luminor`,
      providerId: 'pp_luminor',
      status: 'pending',
    },
    {
      id: `ps-${cartId}-invoice`,
      providerId: 'pp_invoice',
      status: 'pending',
    },
  ];
  return mockPaymentSessions;
}

function createMockOrder(cartData: {
  email: string;
  shippingAddress: Address;
  billingAddress: Address;
  shippingMethod: ShippingMethod | null;
  paymentMethod: string;
  subtotal: number;
  taxTotal: number;
  itemCount: number;
}): Order {
  const shippingCost = cartData.shippingMethod?.price ?? 0;
  const taxRate = 0.21;
  const taxOnShipping = shippingCost * taxRate;
  const taxTotal = cartData.taxTotal + taxOnShipping;
  const total = cartData.subtotal + shippingCost + taxTotal;

  mockOrder = {
    id: `order_${Date.now()}`,
    displayId: Math.floor(1000 + Math.random() * 9000),
    email: cartData.email,
    items: [],
    shippingAddress: cartData.shippingAddress,
    billingAddress: cartData.billingAddress,
    shippingMethods: cartData.shippingMethod
      ? [cartData.shippingMethod]
      : [],
    paymentMethod: cartData.paymentMethod,
    subtotal: cartData.subtotal,
    taxTotal: Math.round(taxTotal * 100) / 100,
    shippingTotal: shippingCost,
    total: Math.round(total * 100) / 100,
    status: 'completed',
    createdAt: new Date().toISOString(),
  };
  return mockOrder;
}

// ============================================================================
// Checkout Service
// ============================================================================

/**
 * CheckoutService — handles checkout API calls against Medusa.
 * Switches between mock and real API based on VITE_API_USE_MOCK env var.
 */
export const CheckoutService = {
  /** Create payment sessions for a cart */
  async createPaymentSession(cartId: string): Promise<PaymentSession[]> {
    if (USE_MOCK) {
      await delay(400);
      return createMockPaymentSessions(cartId);
    }

    const response = await fetch(
      `${API_URL}/store/carts/${cartId}/payment-sessions`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
    );
    if (!response.ok) {
      throw new Error(
        `Failed to create payment sessions: ${response.statusText}`,
      );
    }
    const data: MedusaCartResponse = await response.json();
    return data.cart.payment_collection?.payment_sessions.map((ps) => ({
      id: ps.id,
      providerId: ps.provider_id,
      status: ps.status,
    })) ?? [];
  },

  /** Select a specific payment session */
  async selectPaymentSession(
    cartId: string,
    sessionId: string,
  ): Promise<PaymentSession> {
    if (USE_MOCK) {
      await delay(300);
      const selected = mockPaymentSessions.find((ps) => ps.id === sessionId);
      if (!selected) {
        throw new Error('Payment session not found');
      }
      return { ...selected, status: 'authorized' };
    }

    const response = await fetch(
      `${API_URL}/store/carts/${cartId}/payment-sessions/${sessionId}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
    );
    if (!response.ok) {
      throw new Error(
        `Failed to select payment session: ${response.statusText}`,
      );
    }
    const data: { payment_session: MedusaPaymentSession } =
      await response.json();
    return {
      id: data.payment_session.id,
      providerId: data.payment_session.provider_id,
      status: data.payment_session.status,
    };
  },

  /** Add a shipping method to the cart */
  async addShippingMethod(
    cartId: string,
    optionId: string,
  ): Promise<ShippingMethod> {
    if (USE_MOCK) {
      await delay(350);
      const shippingMethods: Record<string, ShippingMethod> = {
        standard: {
          id: 'standard',
          name: 'Standard Shipping',
          price: 4.99,
          estimatedDelivery: '3-5 business days',
        },
        express: {
          id: 'express',
          name: 'Express Shipping',
          price: 9.99,
          estimatedDelivery: '1-2 business days',
        },
        pickup: {
          id: 'pickup',
          name: 'Free Pickup',
          price: 0,
          estimatedDelivery: 'Same day',
        },
      };
      const method = shippingMethods[optionId];
      if (!method) {
        throw new Error(`Shipping option not found: ${optionId}`);
      }
      return method;
    }

    const response = await fetch(
      `${API_URL}/store/carts/${cartId}/shipping-methods`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ option_id: optionId }),
      },
    );
    if (!response.ok) {
      throw new Error(
        `Failed to add shipping method: ${response.statusText}`,
      );
    }
    const data: MedusaCartResponse = await response.json();
    const sm = data.cart.shipping_methods[data.cart.shipping_methods.length - 1];
    return {
      id: sm.id,
      name: sm.name,
      price: sm.total,
    };
  },

  /** Update cart with address and email data */
  async updateCart(
    cartId: string,
    data: {
      email?: string;
      shippingAddress?: Partial<Address>;
      billingAddress?: Partial<Address>;
    },
  ): Promise<void> {
    if (USE_MOCK) {
      await delay(300);
      return;
    }

    const body: Record<string, unknown> = {};
    if (data.email) body.email = data.email;
    if (data.shippingAddress) {
      body.shipping_address = {
        first_name: data.shippingAddress.firstName,
        last_name: data.shippingAddress.lastName,
        address_1: data.shippingAddress.address1,
        address_2: data.shippingAddress.address2,
        city: data.shippingAddress.city,
        postal_code: data.shippingAddress.postalCode,
        country_code: data.shippingAddress.country,
        phone: data.shippingAddress.phone,
        company: data.shippingAddress.company,
      };
    }
    if (data.billingAddress) {
      body.billing_address = {
        first_name: data.billingAddress.firstName,
        last_name: data.billingAddress.lastName,
        address_1: data.billingAddress.address1,
        address_2: data.billingAddress.address2,
        city: data.billingAddress.city,
        postal_code: data.billingAddress.postalCode,
        country_code: data.billingAddress.country,
        phone: data.billingAddress.phone,
        company: data.billingAddress.company,
      };
    }

    const response = await fetch(`${API_URL}/store/carts/${cartId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error(`Failed to update cart: ${response.statusText}`);
    }
  },

  /** Complete the cart checkout — returns the order */
  async completeCart(
    cartId: string,
    orderData: {
      email: string;
      shippingAddress: Address;
      billingAddress: Address;
      shippingMethod: ShippingMethod | null;
      paymentMethod: string;
      subtotal: number;
      taxTotal: number;
      itemCount: number;
    },
  ): Promise<Order> {
    if (USE_MOCK) {
      await delay(800);
      return createMockOrder(orderData);
    }

    const response = await fetch(
      `${API_URL}/store/carts/${cartId}/complete`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
    );
    if (!response.ok) {
      throw new Error(`Failed to complete cart: ${response.statusText}`);
    }
    const data: MedusaOrderResponse = await response.json();
    const order = data.order;
    return {
      id: order.id,
      displayId: order.display_id,
      email: order.email,
      items: order.items.map((item) => ({
        id: item.id,
        productId: '',
        variantId: '',
        title: item.title,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        total: item.total,
      })),
      shippingAddress: mapMedusaAddress(order.shipping_address),
      billingAddress: mapMedusaAddress(order.billing_address),
      shippingMethods: order.shipping_methods.map((sm) => ({
        id: sm.id,
        name: sm.name,
        price: sm.total,
      })),
      paymentMethod:
        order.payment_collections?.[0]?.payment_sessions?.[0]?.provider_id ?? '',
      subtotal: order.subtotal,
      taxTotal: order.tax_total,
      shippingTotal: order.shipping_total,
      total: order.total,
      status: order.status,
      createdAt: order.created_at,
    };
  },

  /** Reset mock state (for testing) */
  __resetMock(): void {
    mockPaymentSessions = [];
    mockOrder = null;
  },

  /** Get mock order (for testing) */
  __getMockOrder(): Order | null {
    return mockOrder;
  },
};
