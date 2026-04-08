import { createFileRoute } from '@tanstack/react-router';
import { CartProvider } from '@/context/cartContext';
import { OrderHistory } from '@/components/order/OrderHistory';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Container } from '@/components/Container';

export const Route = createFileRoute('/account/orders')({
  component: OrderHistoryRoute,
});

function OrderHistoryRoute() {
  return (
    <CartProvider>
      <Container className="py-4">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'My Orders', current: true },
          ]}
        />
        <OrderHistory />
      </Container>
    </CartProvider>
  );
}
