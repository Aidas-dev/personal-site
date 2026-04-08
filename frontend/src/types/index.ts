/**
 * Riedu E-Shop - Type Definitions
 * Product catalog types aligned with Medusa v2 data model.
 */

/** Represents a price with optional sale and B2B pricing. */
export interface Price {
  amount: number;
  currency: string;
  saleAmount?: number;
  b2bAmount?: number;
}

/** Represents a product specification key-value pair. */
export interface ProductSpec {
  key: string;
  value: string;
}

/** Represents a product image. */
export interface ProductImage {
  url: string;
  alt: string;
}

/** Availability status for a product. */
export type Availability = 'in_stock' | 'low_stock' | 'out_of_stock';

/** Represents a product in the catalog. */
export interface Product {
  id: string;
  name: string;
  description: string;
  slug: string;
  categoryId: string;
  price: Price;
  images: ProductImage[];
  availability: Availability;
  createdAt: string;
  updatedAt: string;
  sku?: string;
  specs?: ProductSpec[];
  tags?: string[];
}

/** Represents a product category with optional hierarchical parent. */
export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  description?: string;
  productCount?: number;
}

/** Sort options for product listings. */
export type ProductSortOption =
  | 'name_asc'
  | 'name_desc'
  | 'price_asc'
  | 'price_desc'
  | 'newest'
  | 'oldest';

/** Filter options for product queries. */
export interface ProductFilter {
  minPrice?: number;
  maxPrice?: number;
  categoryIds?: string[];
  availability?: Availability;
  searchQuery?: string;
  sortBy?: ProductSortOption;
}

// ============================================================================
// Cart, Checkout, and Order Types
// ============================================================================

/** A line item in the cart. */
export interface CartLineItem {
  id: string;
  productId: string;
  variantId: string;
  title: string;
  thumbnail?: string;
  quantity: number;
  unitPrice: number;
  total: number;
  sku?: string;
}

/** A shipping address or billing address. */
export interface Address {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  vatId?: string;
  address1: string;
  address2?: string;
  city: string;
  postalCode: string;
  country: string;
}

/** A shipping method selected for the cart. */
export interface ShippingMethod {
  id: string;
  name: string;
  price: number;
  estimatedDelivery?: string;
}

/** A payment session for the cart. */
export interface PaymentSession {
  id: string;
  providerId: string;
  status: string;
}

/** A pricing region for the cart. */
export interface Region {
  id: string;
  name: string;
  currencyCode: string;
}

/** The shopping cart. */
export interface Cart {
  id: string;
  items: CartLineItem[];
  subtotal: number;
  taxTotal: number;
  total: number;
  itemCount: number;
  shippingAddress?: Address;
  billingAddress?: Address;
  email?: string;
  shippingMethods: ShippingMethod[];
  paymentSessions?: PaymentSession[];
  region: Region;
}

/** A completed order. */
export interface Order {
  id: string;
  displayId: number;
  email: string;
  items: CartLineItem[];
  shippingAddress: Address;
  billingAddress: Address;
  shippingMethods: ShippingMethod[];
  paymentMethod: string;
  subtotal: number;
  taxTotal: number;
  shippingTotal: number;
  total: number;
  status: string;
  createdAt: string;
  fulfillmentStatus?: string;
  paymentStatus?: string;
}
