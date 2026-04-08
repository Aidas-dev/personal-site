import { Link } from '@tanstack/react-router';
import { useCart } from '@/context/cartContext';
import { Container } from '@/components/Container';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Spinner } from '@/components/Spinner';
import { CartItemRow } from './CartItemRow';
import { formatPrice } from '@/utils/formatPrice';

export function CartPage() {
  const { items, subtotal, taxTotal, total, isLoading, region } = useCart();
  const currency = region?.currencyCode ?? 'EUR';

  if (isLoading) {
    return (
      <Container className="py-8">
        <div className="animate-pulse space-y-6" role="status">
          <div className="h-8 bg-neutral-200 rounded w-1/3" />
          <div className="h-32 bg-neutral-200 rounded" />
          <div className="h-32 bg-neutral-200 rounded" />
          <span className="sr-only">Loading cart...</span>
        </div>
      </Container>
    );
  }

  // Empty Cart State
  if (items.length === 0) {
    return (
      <Container className="py-8">
        <div className="max-w-2xl mx-auto text-center py-16">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-24 w-24 text-neutral-300 mx-auto mb-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
            />
          </svg>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">
            Your cart is empty
          </h1>
          <p className="text-neutral-500 mb-8">
            Looks like you haven't added anything to your cart yet.
          </p>
          <Link to="/products">
            <Button variant="primary" size="lg">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </Container>
    );
  }

  // Cart with Items
  return (
    <Container className="py-8">
      <h1 className="text-2xl font-bold text-neutral-900 mb-8">
        Shopping Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <Card variant="info" className="p-6">
            <ul role="list" className="divide-y divide-neutral-100">
              {items.map((item) => (
                <li key={item.id}>
                  <CartItemRow item={item} currency={currency} />
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card variant="info" className="p-6 sticky top-4">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">
              Order Summary
            </h2>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-neutral-600">Subtotal</dt>
                <dd className="font-medium text-neutral-900">
                  {formatPrice(subtotal, currency)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-600">Estimated Tax</dt>
                <dd className="font-medium text-neutral-900">
                  {formatPrice(taxTotal, currency)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-600">Shipping</dt>
                <dd className="font-medium text-neutral-500">Calculated at checkout</dd>
              </div>
              <div className="border-t border-neutral-200 pt-3">
                <div className="flex justify-between">
                  <dt className="text-lg font-semibold text-neutral-900">Total</dt>
                  <dd className="text-lg font-bold text-primary-500">
                    {formatPrice(total, currency)}
                  </dd>
                </div>
              </div>
            </dl>

            <div className="mt-6">
              <Link to="/checkout">
                <Button variant="primary" size="lg" className="w-full">
                  Proceed to Checkout
                </Button>
              </Link>
            </div>

            <div className="mt-4">
              <Link to="/products" className="text-sm text-primary-500 hover:underline">
                ← Continue Shopping
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </Container>
  );
}
