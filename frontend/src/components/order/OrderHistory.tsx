import { useState, useEffect, useCallback } from 'react';
import { Link } from '@tanstack/react-router';
import type { Order } from '@/types';
import { OrderService } from '@/services/orderService';
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

const PAGE_SIZE = 10;

// ============================================================================
// OrderHistory Component
// ============================================================================

interface OrderHistoryProps {
  email?: string;
}

export function OrderHistory({ email }: OrderHistoryProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);

  const fetchOrders = useCallback(async (currentOffset: number, userEmail?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await OrderService.listOrders({
        email: userEmail,
        offset: currentOffset,
        limit: PAGE_SIZE,
      });
      setOrders(result.orders);
      setTotalCount(result.count);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load orders';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders(0, email);
  }, [fetchOrders, email]);

  const handleLoadMore = () => {
    const nextOffset = offset + PAGE_SIZE;
    setOffset(nextOffset);
    fetchOrders(nextOffset, email);
  };

  const hasMore = offset + PAGE_SIZE < totalCount;

  // Loading state
  if (isLoading && orders.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-neutral-900">My Orders</h1>
        <div className="animate-pulse space-y-4" role="status">
          <div className="h-16 bg-neutral-200 rounded-lg" />
          <div className="h-16 bg-neutral-200 rounded-lg" />
          <div className="h-16 bg-neutral-200 rounded-lg" />
          <span className="sr-only">Loading orders...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error && orders.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-neutral-900">My Orders</h1>
        <Card variant="info" className="p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button variant="outline" size="md" onClick={() => fetchOrders(0, email)}>
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  // Empty state
  if (orders.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-neutral-900">My Orders</h1>
        <Card variant="info" className="p-8 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-neutral-300 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20 13V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7m16 0v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5m16 0h-2.586a1 1 0 0 0-.707.293l-2.414 2.414a1 1 0 0 1-.707.293h-3.172a1 1 0 0 1-.707-.293l-2.414-2.414A1 1 0 0 0 6.586 13H4"
            />
          </svg>
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">
            No orders yet
          </h2>
          <p className="text-neutral-500 mb-6">
            You haven't placed any orders yet. Start shopping to make your first order!
          </p>
          <Link to="/products">
            <Button variant="primary" size="lg">
              Start Shopping
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900">My Orders</h1>

      {/* Desktop Table */}
      <div className="hidden md:block">
        <Card variant="info" className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" role="table">
              <thead className="bg-neutral-100 border-b border-neutral-200">
                <tr>
                  <th scope="col" className="text-left px-6 py-3 font-medium text-neutral-600">
                    Order #
                  </th>
                  <th scope="col" className="text-left px-6 py-3 font-medium text-neutral-600">
                    Date
                  </th>
                  <th scope="col" className="text-left px-6 py-3 font-medium text-neutral-600">
                    Items
                  </th>
                  <th scope="col" className="text-left px-6 py-3 font-medium text-neutral-600">
                    Total
                  </th>
                  <th scope="col" className="text-left px-6 py-3 font-medium text-neutral-600">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {orders.map((order) => {
                  const statusBadge = getStatusBadge(order.status);
                  const orderDate = new Date(order.createdAt);
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-white cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4">
                        <Link
                          to="/account/orders/$id"
                          params={{ id: order.id }}
                          className="font-mono font-medium text-primary-500 hover:underline"
                        >
                          #{order.displayId}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-neutral-600">
                        {orderDate.toLocaleDateString('en-GB', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 text-neutral-600">
                        {order.items.length}
                      </td>
                      <td className="px-6 py-4 font-medium text-neutral-900">
                        {formatPrice(order.total, 'EUR')}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusBadge.className}`}
                          role="status"
                        >
                          {statusBadge.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {orders.map((order) => {
          const statusBadge = getStatusBadge(order.status);
          const orderDate = new Date(order.createdAt);
          return (
            <Link to="/account/orders/$id" params={{ id: order.id }} key={order.id}>
              <Card variant="info" className="p-4 hover:bg-white transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-mono font-semibold text-neutral-900">
                      #{order.displayId}
                    </p>
                    <p className="text-sm text-neutral-500">
                      {orderDate.toLocaleDateString('en-GB', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusBadge.className}`}
                    role="status"
                  >
                    {statusBadge.label}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-500">
                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                  </span>
                  <span className="font-semibold text-neutral-900">
                    {formatPrice(order.total, 'EUR')}
                  </span>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="text-center">
          <Button variant="outline" size="md" onClick={handleLoadMore} isLoading={isLoading}>
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
