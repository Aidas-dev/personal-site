import { createFileRoute } from '@tanstack/react-router';
import { CartProvider } from '@/context/cartContext';
import { CartPage } from '@/components/cart/CartPage';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Container } from '@/components/Container';

export const Route = createFileRoute('/cart')({
  component: CartRoute,
});

function CartRoute() {
  return (
    <CartProvider>
      <Container className="py-4">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Products', href: '/products' },
            { label: 'Cart', current: true },
          ]}
        />
      </Container>
      <CartPage />
    </CartProvider>
  );
}
