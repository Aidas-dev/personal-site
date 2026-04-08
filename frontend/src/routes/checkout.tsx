import { createFileRoute, Navigate } from '@tanstack/react-router';
import { CartProvider, useCart } from '@/context/cartContext';
import { CheckoutProvider } from '@/context/checkoutContext';
import { CheckoutPage } from '@/components/checkout/CheckoutPage';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Container } from '@/components/Container';
import { Spinner } from '@/components/Spinner';

export const Route = createFileRoute('/checkout')({
  component: CheckoutRoute,
});

function CheckoutContent() {
  const { items, isLoading } = useCart();

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  // Guard: if cart is empty, redirect to /cart
  if (items.length === 0) {
    return <Navigate to="/cart" />;
  }

  return <CheckoutPage />;
}

function CheckoutRoute() {
  return (
    <CartProvider>
      <CheckoutProvider>
        <Container className="py-4">
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'Cart', href: '/cart' },
              { label: 'Checkout', current: true },
            ]}
          />
          <CheckoutContent />
        </Container>
      </CheckoutProvider>
    </CartProvider>
  );
}
