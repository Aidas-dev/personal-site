import { createFileRoute, useParams } from '@tanstack/react-router';
import { CartProvider } from '@/context/cartContext';
import { OrderDetail } from '@/components/order/OrderDetail';
import { Container } from '@/components/Container';

export const Route = createFileRoute('/account/orders/$id')({
  component: OrderDetailRoute,
});

function OrderDetailRoute() {
  const { id } = useParams({ from: '/account/orders/$id' });

  return (
    <CartProvider>
      <Container className="py-4">
        <OrderDetail orderId={id} />
      </Container>
    </CartProvider>
  );
}
