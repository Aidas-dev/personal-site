import { Link } from '@tanstack/react-router';
import type { Order } from '@/types';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { formatPrice } from '@/utils/formatPrice';

// ============================================================================
// Status Helpers
// ============================================================================

const ORDER_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  completed: { label: 'Processing', color: 'bg-green-100 text-green-800 border-green-200' },
  pending: { label: 'Pending Payment', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  canceled: { label: 'Cancelled', color: 'bg-red-100 text-red-800 border-red-200' },
  requires_action: { label: 'Action Required', color: 'bg-amber-100 text-amber-800 border-amber-200' },
};

const FULFILLMENT_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  fulfilled: { label: 'Shipped', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  partially_fulfilled: { label: 'Partially Shipped', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  not_fulfilled: { label: 'Processing', color: 'bg-green-100 text-green-800 border-green-200' },
  shipped: { label: 'Shipped', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  delivered: { label: 'Delivered', color: 'bg-gray-100 text-gray-800 border-gray-200' },
  returned: { label: 'Returned', color: 'bg-gray-100 text-gray-800 border-gray-200' },
  canceled: { label: 'Cancelled', color: 'bg-red-100 text-red-800 border-red-200' },
};

function getStatusBadge(order: Order): { label: string; className: string } {
  // Check fulfillment status first for more specific status
  if (order.fulfillmentStatus && FULFILLMENT_STATUS_CONFIG[order.fulfillmentStatus]) {
    const config = FULFILLMENT_STATUS_CONFIG[order.fulfillmentStatus];
    return { label: config.label, className: config.color };
  }

  // Fall back to order status
  if (ORDER_STATUS_CONFIG[order.status]) {
    const config = ORDER_STATUS_CONFIG[order.status];
    return { label: config.label, className: config.color };
  }

  // Default
  return { label: 'Processing', className: 'bg-green-100 text-green-800 border-green-200' };
}

function getPaymentLabel(providerId: string): string {
  const labels: Record<string, string> = {
    pp_stripe_stripe: 'Credit/Debit Card (Stripe)',
    'pp_stripe-apple-pay_stripe': 'Apple Pay / Google Pay',
    pp_swedbank: 'Swedbank',
    pp_seb: 'SEB Bank',
    pp_luminor: 'Luminor',
    pp_invoice: 'B2B Invoice',
  };
  return labels[providerId] ?? providerId;
}

// ============================================================================
// OrderConfirmation Component
// ============================================================================

interface OrderConfirmationProps {
  order: Order;
}

export function OrderConfirmation({ order }: OrderConfirmationProps) {
  const currency = 'EUR';
  const statusBadge = getStatusBadge(order);
  const orderDate = new Date(order.createdAt);

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="text-center py-4">
        <div className="mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <svg
            className="w-10 h-10 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
          Order Confirmed!
        </h1>
        <p className="text-neutral-600">
          Thank you for your order. We've sent a confirmation to{' '}
          <span className="font-medium">{order.email}</span>.
        </p>
      </div>

      {/* Order Header Info */}
      <Card variant="info" className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm text-neutral-500">Order Number</p>
            <p className="text-xl font-mono font-semibold text-neutral-900">
              #{order.displayId}
            </p>
          </div>
          <div>
            <p className="text-sm text-neutral-500">Order Date</p>
            <p className="text-lg font-medium text-neutral-900">
              {orderDate.toLocaleDateString('en-GB', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <div>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusBadge.className}`}
              role="status"
            >
              {statusBadge.label}
            </span>
          </div>
        </div>
      </Card>

      {/* Items List */}
      <Card variant="info" className="p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">
          Items ({order.items.length})
        </h2>
        <ul className="divide-y divide-neutral-100" role="list">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center gap-4 py-3">
              {item.thumbnail ? (
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-16 h-16 rounded-lg object-cover bg-neutral-100 flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-neutral-200 flex items-center justify-center flex-shrink-0" aria-hidden="true">
                  <svg className="w-8 h-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                  </svg>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-neutral-900 truncate">
                  {item.title}
                </p>
                <p className="text-sm text-neutral-500">
                  Qty: {item.quantity} × {formatPrice(item.unitPrice, currency)}
                </p>
              </div>
              <span className="font-semibold text-neutral-900 whitespace-nowrap">
                {formatPrice(item.total, currency)}
              </span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Shipping & Billing Addresses */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card variant="info" className="p-6">
          <h3 className="text-sm font-medium text-neutral-500 mb-2">
            Shipping Address
          </h3>
          <address className="not-italic text-neutral-900 text-sm leading-relaxed">
            <p>
              {order.shippingAddress.firstName} {order.shippingAddress.lastName}
            </p>
            <p>{order.shippingAddress.address1}</p>
            {order.shippingAddress.address2 && (
              <p>{order.shippingAddress.address2}</p>
            )}
            <p>
              {order.shippingAddress.city} {order.shippingAddress.postalCode}
            </p>
            <p>{order.shippingAddress.country}</p>
          </address>
        </Card>

        <Card variant="info" className="p-6">
          <h3 className="text-sm font-medium text-neutral-500 mb-2">
            Billing Address
          </h3>
          <address className="not-italic text-neutral-900 text-sm leading-relaxed">
            <p>
              {order.billingAddress.firstName} {order.billingAddress.lastName}
            </p>
            <p>{order.billingAddress.address1}</p>
            {order.billingAddress.address2 && (
              <p>{order.billingAddress.address2}</p>
            )}
            <p>
              {order.billingAddress.city} {order.billingAddress.postalCode}
            </p>
            <p>{order.billingAddress.country}</p>
          </address>
        </Card>
      </div>

      {/* Shipping Method & Payment */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card variant="info" className="p-6">
          <h3 className="text-sm font-medium text-neutral-500 mb-2">
            Shipping Method
          </h3>
          {order.shippingMethods.length > 0 ? (
            <div>
              <p className="text-neutral-900 font-medium">
                {order.shippingMethods[0].name}
              </p>
              <p className="text-sm text-neutral-500">
                {formatPrice(order.shippingMethods[0].price, currency)}
              </p>
            </div>
          ) : (
            <p className="text-neutral-500 text-sm">No shipping method selected</p>
          )}
        </Card>

        <Card variant="info" className="p-6">
          <h3 className="text-sm font-medium text-neutral-500 mb-2">
            Payment
          </h3>
          <p className="text-neutral-900 font-medium">
            {getPaymentLabel(order.paymentMethod)}
          </p>
          <p className="text-sm text-neutral-500">
            {formatPrice(order.total, currency)} charged
          </p>
        </Card>
      </div>

      {/* Cost Breakdown */}
      <Card variant="info" className="p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">
          Order Summary
        </h2>
        <dl className="space-y-3">
          <div className="flex justify-between text-neutral-600">
            <dt>Subtotal</dt>
            <dd>{formatPrice(order.subtotal, currency)}</dd>
          </div>
          <div className="flex justify-between text-neutral-600">
            <dt>Shipping</dt>
            <dd>
              {order.shippingTotal === 0
                ? 'Free'
                : formatPrice(order.shippingTotal, currency)}
            </dd>
          </div>
          <div className="flex justify-between text-neutral-600">
            <dt>Tax (21% VAT)</dt>
            <dd>{formatPrice(order.taxTotal, currency)}</dd>
          </div>
          <div className="border-t border-neutral-200 pt-3">
            <div className="flex justify-between">
              <dt className="text-lg font-semibold text-neutral-900">Total</dt>
              <dd className="text-lg font-bold text-primary-500">
                {formatPrice(order.total, currency)}
              </dd>
            </div>
          </div>
        </dl>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
        <Link to="/products">
          <Button variant="primary" size="lg">
            Continue Shopping
          </Button>
        </Link>
        <Link to="/account/orders/$id" params={{ id: order.id }}>
          <Button variant="outline" size="lg">
            View Order Details
          </Button>
        </Link>
      </div>
    </div>
  );
}
