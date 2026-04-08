import type { Cart, CartLineItem, Region } from '@/types';
import { mockProducts } from '@/data/mockData';

const USE_MOCK = import.meta.env.VITE_API_USE_MOCK !== 'false';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000';

// ============================================================================
// Mock Data
// ============================================================================

let mockCart: Cart | null = null;

function createMockCart(): Cart {
  mockCart = {
    id: 'mock-cart-' + Date.now(),
    items: [],
    subtotal: 0,
    taxTotal: 0,
    total: 0,
    itemCount: 0,
    shippingMethods: [],
    region: {
      id: 'region-eu',
      name: 'European Union',
      currencyCode: 'EUR',
    },
  };
  return mockCart;
}

function recalculateMockCart(): Cart {
  if (!mockCart) return createMockCart();

  const subtotal = mockCart.items.reduce((sum, item) => sum + item.total, 0);
  const taxRate = 0.21; // Lithuania VAT 21%
  const taxTotal = Math.round(subtotal * taxRate * 100) / 100;
  const total = subtotal + taxTotal;
  const itemCount = mockCart.items.reduce((sum, item) => sum + item.quantity, 0);

  mockCart = {
    ...mockCart,
    subtotal,
    taxTotal,
    total,
    itemCount,
  };
  return mockCart;
}

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
  region?: MedusaRegion;
  shipping_address?: MedusaAddress;
  billing_address?: MedusaAddress;
  email?: string;
  shipping_methods?: MedusaShippingMethod[];
  payment_collections?: MedusaPaymentCollection[];
}

interface MedusaLineItem {
  id: string;
  title: string;
  subtitle?: string;
  thumbnail?: string;
  quantity: number;
  unit_price: number;
  total: number;
  subtotal: number;
  tax_total: number;
  product_id?: string;
  variant_id?: string;
}

interface MedusaRegion {
  id: string;
  name: string;
  currency_code: string;
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
}

// ============================================================================
// Mapping Functions
// ============================================================================

function mapMedusaRegion(region?: MedusaRegion): Region {
  return {
    id: region?.id ?? 'default',
    name: region?.name ?? 'Default Region',
    currencyCode: region?.currency_code ?? 'EUR',
  };
}

function mapMedusaLineItem(item: MedusaLineItem): CartLineItem {
  return {
    id: item.id,
    productId: item.product_id ?? '',
    variantId: item.variant_id ?? '',
    title: item.title,
    thumbnail: item.thumbnail,
    quantity: item.quantity,
    unitPrice: item.unit_price,
    total: item.total,
  };
}

function mapMedusaCart(medusaCart: MedusaCart): Cart {
  return {
    id: medusaCart.id,
    items: medusaCart.items.map(mapMedusaLineItem),
    subtotal: medusaCart.subtotal ?? 0,
    taxTotal: medusaCart.tax_total ?? 0,
    total: medusaCart.total ?? 0,
    itemCount: medusaCart.item_total ?? 0,
    region: mapMedusaRegion(medusaCart.region),
    shippingMethods: (medusaCart.shipping_methods ?? []).map((sm) => ({
      id: sm.id,
      name: sm.name,
      price: sm.total,
    })),
    paymentSessions: medusaCart.payment_collections?.[0]?.payment_sessions?.map(
      (ps) => ({
        id: ps.id,
        providerId: ps.provider_id,
        status: ps.status,
      }),
    ),
    email: medusaCart.email,
  };
}

// ============================================================================
// Cart Service
// ============================================================================

export interface AddLineItemData {
  variantId: string;
  quantity: number;
  productId?: string;
  title?: string;
  thumbnail?: string;
  unitPrice?: number;
}

export interface UpdateLineItemData {
  quantity: number;
}

/**
 * CartService - handles cart operations against Medusa API.
 * Switches between mock and real API based on VITE_API_USE_MOCK env var.
 */
export const CartService = {
  /** Create a new cart */
  async createCart(): Promise<Cart> {
    if (USE_MOCK) {
      return createMockCart();
    }

    const response = await fetch(`${API_URL}/store/carts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    if (!response.ok) {
      throw new Error(`Failed to create cart: ${response.statusText}`);
    }
    const data: MedusaCartResponse = await response.json();
    return mapMedusaCart(data.cart);
  },

  /** Get an existing cart by ID */
  async getCart(id: string): Promise<Cart | null> {
    if (USE_MOCK) {
      if (!mockCart || mockCart.id !== id) return null;
      return { ...mockCart, items: [...mockCart.items] };
    }

    const response = await fetch(`${API_URL}/store/carts/${id}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Failed to fetch cart: ${response.statusText}`);
    }
    const data: MedusaCartResponse = await response.json();
    return mapMedusaCart(data.cart);
  },

  /** Add a line item to the cart */
  async addLineItem(
    cartId: string,
    data: AddLineItemData,
  ): Promise<Cart> {
    if (USE_MOCK) {
      if (!mockCart || mockCart.id !== cartId) {
        throw new Error('Cart not found');
      }

      // Check if variant already exists in cart (by variantId)
      const existingIndex = mockCart.items.findIndex(
        (item) => item.variantId === data.variantId,
      );

      if (existingIndex >= 0) {
        // Update quantity
        const existing = mockCart.items[existingIndex];
        const newQuantity = existing.quantity + data.quantity;
        mockCart.items[existingIndex] = {
          ...existing,
          quantity: newQuantity,
          total: existing.unitPrice * newQuantity,
        };
      } else {
        // Find product from mock data
        const product = mockProducts.find((p) => p.id === data.productId);
        const price = data.unitPrice ?? product?.price.amount ?? 0;

        const newItem: CartLineItem = {
          id: 'line-' + Date.now(),
          productId: data.productId ?? '',
          variantId: data.variantId,
          title: data.title ?? product?.name ?? 'Product',
          thumbnail: data.thumbnail ?? product?.images?.[0]?.url,
          quantity: data.quantity,
          unitPrice: price,
          total: price * data.quantity,
        };
        mockCart.items.push(newItem);
      }

      return recalculateMockCart();
    }

    const response = await fetch(
      `${API_URL}/store/carts/${cartId}/line-items`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variant_id: data.variantId,
          quantity: data.quantity,
        }),
      },
    );
    if (!response.ok) {
      throw new Error(`Failed to add line item: ${response.statusText}`);
    }
    const data2: MedusaCartResponse = await response.json();
    return mapMedusaCart(data2.cart);
  },

  /** Update a line item quantity */
  async updateLineItem(
    cartId: string,
    lineId: string,
    data: UpdateLineItemData,
  ): Promise<Cart> {
    if (USE_MOCK) {
      if (!mockCart || mockCart.id !== cartId) {
        throw new Error('Cart not found');
      }

      const itemIndex = mockCart.items.findIndex((item) => item.id === lineId);
      if (itemIndex === -1) {
        throw new Error('Line item not found');
      }

      if (data.quantity <= 0) {
        mockCart.items.splice(itemIndex, 1);
      } else {
        mockCart.items[itemIndex] = {
          ...mockCart.items[itemIndex],
          quantity: data.quantity,
          total: mockCart.items[itemIndex].unitPrice * data.quantity,
        };
      }

      return recalculateMockCart();
    }

    const response = await fetch(
      `${API_URL}/store/carts/${cartId}/line-items/${lineId}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: data.quantity }),
      },
    );
    if (!response.ok) {
      throw new Error(`Failed to update line item: ${response.statusText}`);
    }
    const data2: MedusaCartResponse = await response.json();
    return mapMedusaCart(data2.cart);
  },

  /** Delete a line item from the cart */
  async deleteLineItem(cartId: string, lineId: string): Promise<Cart> {
    if (USE_MOCK) {
      if (!mockCart || mockCart.id !== cartId) {
        throw new Error('Cart not found');
      }

      mockCart.items = mockCart.items.filter((item) => item.id !== lineId);
      return recalculateMockCart();
    }

    const response = await fetch(
      `${API_URL}/store/carts/${cartId}/line-items/${lineId}`,
      {
        method: 'DELETE',
      },
    );
    if (!response.ok) {
      throw new Error(`Failed to delete line item: ${response.statusText}`);
    }
    const data: MedusaCartResponse = await response.json();
    return mapMedusaCart(data.cart);
  },

  /** Clear all items from the cart */
  async clearCart(cartId: string): Promise<Cart> {
    if (USE_MOCK) {
      if (!mockCart || mockCart.id !== cartId) {
        throw new Error('Cart not found');
      }

      mockCart.items = [];
      return recalculateMockCart();
    }

    // For real API, delete each line item
    const cart = await this.getCart(cartId);
    if (!cart) throw new Error('Cart not found');

    let currentCart = cart;
    for (const item of cart.items) {
      currentCart = await this.deleteLineItem(cartId, item.id);
    }
    return currentCart;
  },

  /** Reset mock cart state (for testing) */
  __resetMock(): void {
    mockCart = null;
  },

  /** Get mock cart directly for testing */
  __getMockCart(): Cart | null {
    return mockCart;
  },
};
