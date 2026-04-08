import { useEffect, useState } from 'react';
import { createFileRoute, useSearch } from '@tanstack/react-router';
import { CartProvider } from '@/context/cartContext';
import { OrderConfirmation } from '@/components/order/OrderConfirmation';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Container } from '@/components/Container';
import { Spinner } from '@/components/Spinner';
import { Card } from '@/components/Card';
import { OrderService } from '@/services/orderService';
import type { Order } from '@/types';

interface OrderConfirmationSearch {
  order_id: string;
}

export const Route = createFileRoute('/order/confirmation')({
  validateSearch: (search: Record<string, unknown>): OrderConfirmationSearch => {
    return {
      order_id: (search.order_id as string) ?? '',
    };
  },
  component: OrderConfirmationRoute,
});

function OrderConfirmationRoute() {
  const { order_id } = useSearch({ from: '/order/confirmation' });
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!order_id) {
      setError('No order ID provided');
      setIsLoading(false);
      return;
    }

    let mounted = true;

    async function fetchOrder() {
      try {
        const fetchedOrder = await OrderService.getOrder(order_id);
        if (mounted) {
          if (fetchedOrder) {
            setOrder(fetchedOrder);
          } else {
            setError('Order not found');
          }
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to load order';
        if (mounted) {
          setError(message);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    fetchOrder();
    return () => {
      mounted = false;
    };
  }, [order_id]);

  return (
    <CartProvider>
      <Container className="py-4">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Order Confirmation', current: true },
          ]}
        />

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <Card variant="info" className="p-8 text-center">
            <h1 className="text-xl font-semibold text-neutral-900 mb-2">
              Unable to Load Order
            </h1>
            <p className="text-neutral-500 mb-4">{error}</p>
            <a
              href="/products"
              className="text-primary-500 hover:underline font-medium"
            >
              Continue Shopping
            </a>
          </Card>
        ) : order ? (
          <OrderConfirmation order={order} />
        ) : null}
      </Container>
    </CartProvider>
  );
}
