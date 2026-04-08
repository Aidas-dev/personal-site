import { useState, useEffect, useCallback } from 'react';
import { Link } from '@tanstack/react-router';
import type { Order } from '@/types';
import { OrderService } from '@/services/orderService';
import { useCart } from '@/context/cartContext';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Spinner } from '@/components/Spinner';
import { formatPrice } from '@/utils/formatPrice';

// ============================================================================
// Status Helpers
// ============================================================================

function getStatusBadge(status: string): { label: string; className: string } {
  const config: Record<string, { label: string; className: string }> = {
    completed: { label: 'Processing', className: 'bg-green-100 text-green-800 border-green-200' },
    pending: { label: 'Pending Payment', className: 'bg-amber-100 text-amber-800 border-amber-200' },
    canceled: { label: 'Cancelled', className: 'bg-red-100 text-red-800 border-red-200' },
    requires_action: { label: 'Action Required', className: 'bg-amber-100 text-amber-800 border-amber-200' },
    fulfilled: { label: 'Shipped', className: 'bg-blue-100 text-blue-800 border-blue-200' },
    partially_fulfilled: { label: 'Partially Shipped', className: 'bg-blue-100 text-blue-800 border-blue-200' },
    not_fulfilled: { label: 'Processing', className: 'bg-green-100 text-green-800 border-green-200' },
    shipped: { label: 'Shipped', className: 'bg-blue-100 text-blue-800 border-blue-200' },
    delivered: { label: 'Delivered', className: 'bg-gray-100 text-gray-800 border-gray-200' },
    returned: { label: 'Returned', className: 'bg-gray-100 text-gray-800 border-gray-200' },
  };

  return config[status] ?? { label: 'Processing', className: 'bg-green-100 text-green-800 border-green-200' };
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
// OrderDetail Component
// ============================================================================

interface OrderDetailProps {
  orderId: string;
}

export function OrderDetail({ orderId }: OrderDetailProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [reorderSuccess, setReorderSuccess] = useState(false);
  const { addItem } = useCart();

  const fetchOrder = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedOrder = await OrderService.getOrder(orderId);
      if (fetchedOrder) {
        setOrder(fetchedOrder);
      } else {
        setError('Order not found');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load order';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleReorder = useCallback(async () => {
    if (!order) return;
    setIsReordering(true);
    setReorderSuccess(false);

    try {
      for (const item of order.items) {
        await addItem({
          productId: item.productId,
          variantId: item.variantId,
          productName: item.title,
          price: item.unitPrice,
          quantity: item.quantity,
          thumbnail: item.thumbnail,
        });
      }
      setReorderSuccess(true);
    } catch {
      setError('Failed to add items to cart. Please try again.');
    } finally {
      setIsReordering(false);
    }
  }, [order, addItem]);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'My Orders', href: '/account/orders' },
            { label: 'Loading...', current: true },
          ]}
        />
        <div className="animate-pulse space-y-4" role="status">
          <div className="h-8 bg-neutral-200 rounded w-1/3" />
          <div className="h-32 bg-neutral-200 rounded" />
          <div className="h-32 bg-neutral-200 rounded" />
          <span className="sr-only">Loading order details...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !order) {
    return (
      <div className="space-y-6">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'My Orders', href: '/account/orders' },
            { label: 'Order Not Found', current: true },
          ]}
        />
        <Card variant="info" className="p-8 text-center">
          <h1 className="text-xl font-semibold text-neutral-900 mb-2">
            Order Not Found
          </h1>
          <p className="text-neutral-500 mb-6">{error}</p>
          <Link to="/account/orders">
            <Button variant="primary" size="lg">
              Back to Orders
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (!order) return null;

  const currency = 'EUR';
  const statusBadge = getStatusBadge(order.status);
  const orderDate = new Date(order.createdAt);

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'My Orders', href: '/account/orders' },
          { label: `Order #${order.displayId}`, current: true },
        ]}
      />

      {/* Order Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            Order #{order.displayId}
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Placed on{' '}
            {orderDate.toLocaleDateString('en-GB', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusBadge.className}`}
            role="status"
          >
            {statusBadge.label}
          </span>
          <Link to="/account/orders">
            <Button variant="outline" size="sm">
              ← Back to Orders
            </Button>
          </Link>
        </div>
      </div>

      {/* Reorder Success Message */}
      {reorderSuccess && (
        <div
          className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm"
          role="status"
        >
          All items have been added to your cart!{' '}
          <Link to="/cart" className="font-medium underline hover:no-underline">
            View cart
          </Link>
        </div>
      )}

      {/* Items Table */}
      <Card variant="info" className="p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">
          Items ({order.items.length})
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" role="table">
            <thead className="bg-neutral-100 border-b border-neutral-200">
              <tr>
                <th scope="col" className="text-left px-4 py-3 font-medium text-neutral-600">
                  Product
                </th>
                <th scope="col" className="text-left px-4 py-3 font-medium text-neutral-600">
                  SKU
                </th>
                <th scope="col" className="text-center px-4 py-3 font-medium text-neutral-600">
                  Qty
                </th>
                <th scope="col" className="text-right px-4 py-3 font-medium text-neutral-600">
                  Unit Price
                </th>
                <th scope="col" className="text-right px-4 py-3 font-medium text-neutral-600">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="w-12 h-12 rounded-lg object-cover bg-neutral-100 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-neutral-200 flex-shrink-0" />
                      )}
                      <span className="font-medium text-neutral-900">
                        {item.title}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-neutral-500 font-mono text-xs">
                    {item.sku ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-center text-neutral-600">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-3 text-right text-neutral-600">
                    {formatPrice(item.unitPrice, currency)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-neutral-900">
                    {formatPrice(item.total, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Shipping & Billing */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card variant="info" className="p-6">
          <h3 className="text-sm font-medium text-neutral-500 mb-2">
            Shipping Information
          </h3>
          <address className="not-italic text-neutral-900 text-sm leading-relaxed mb-3">
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
          {order.shippingMethods.length > 0 && (
            <div className="border-t border-neutral-200 pt-3 mt-3">
              <p className="text-xs text-neutral-500 mb-1">Shipping Method</p>
              <p className="text-sm font-medium text-neutral-900">
                {order.shippingMethods[0].name}
              </p>
              {order.shippingMethods[0].estimatedDelivery && (
                <p className="text-xs text-neutral-500 mt-1">
                  Est. delivery: {order.shippingMethods[0].estimatedDelivery}
                </p>
              )}
            </div>
          )}
        </Card>

        <Card variant="info" className="p-6">
          <h3 className="text-sm font-medium text-neutral-500 mb-2">
            Billing Information
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

      {/* Payment & Cost Breakdown */}
      <Card variant="info" className="p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">
          Payment & Summary
        </h2>

        <div className="mb-4 pb-4 border-b border-neutral-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-neutral-500 mb-1">Payment Method</p>
              <p className="text-sm font-medium text-neutral-900">
                {getPaymentLabel(order.paymentMethod)}
              </p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 mb-1">Amount Charged</p>
              <p className="text-sm font-medium text-neutral-900">
                {formatPrice(order.total, currency)}
              </p>
            </div>
          </div>
        </div>

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

      {/* Reorder Button */}
      <div className="text-center pt-4">
        <Button
          variant="primary"
          size="lg"
          onClick={handleReorder}
          isLoading={isReordering}
        >
          Reorder All Items
        </Button>
      </div>
    </div>
  );
}
