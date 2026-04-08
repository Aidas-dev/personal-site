import { useEffect, useState } from 'react';
import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router';
import { useCheckout } from '@/context/checkoutContext';
import { Container } from '@/components/Container';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Spinner } from '@/components/Spinner';

// ============================================================================
// Search Param Validation
// ============================================================================

interface PaymentCallbackSearch {
  payment_status?: string;
  payment_id?: string;
}

export const Route = createFileRoute('/checkout/payment/callback')({
  validateSearch: (search: Record<string, unknown>): PaymentCallbackSearch => {
    return {
      payment_status: (search.payment_status as string) ?? undefined,
      payment_id: (search.payment_id as string) ?? undefined,
    };
  },
  component: PaymentCallbackRoute,
});

// ============================================================================
// Route Component
// ============================================================================

function PaymentCallbackRoute() {
  const { payment_status, payment_id } = useSearch({
    from: '/checkout/payment/callback',
  });
  const checkout = useCheckout();
  const navigate = useNavigate();
  const [processed, setProcessed] = useState(false);

  useEffect(() => {
    if (processed) return;
    if (!payment_status) return;

    const pid = payment_id ?? 'unknown';
    checkout.handlePaymentCallback(payment_status, pid);
    setProcessed(true);
  }, [payment_status, payment_id, processed, checkout]);

  const status = (payment_status ?? '').toLowerCase();

  // Success: completed or authorized
  if (status === 'completed' || status === 'authorized') {
    return (
      <Container className="py-4">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Cart', href: '/cart' },
            { label: 'Checkout', href: '/checkout' },
            { label: 'Payment', current: true },
          ]}
        />

        <Card variant="success" className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-600"
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
          </div>
          <h1 className="text-xl font-semibold text-neutral-900 mb-2">
            Payment Successful
          </h1>
          <p className="text-neutral-500 mb-6">
            Your payment has been processed successfully. You can now review
            your order and complete the checkout.
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate({ to: '/checkout' })}
            >
              Continue to Review
            </Button>
          </div>
        </Card>
      </Container>
    );
  }

  // Failed or cancelled
  if (status === 'failed' || status === 'cancelled') {
    return (
      <Container className="py-4">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Cart', href: '/cart' },
            { label: 'Checkout', href: '/checkout' },
            { label: 'Payment', current: true },
          ]}
        />

        <Card variant="error" className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-xl font-semibold text-neutral-900 mb-2">
            Payment {status === 'cancelled' ? 'Cancelled' : 'Failed'}
          </h1>
          <p className="text-neutral-500 mb-6">
            {status === 'cancelled'
              ? 'You cancelled the payment. You can try again or choose a different payment method.'
              : 'There was an issue processing your payment. Please try again or choose a different payment method.'}
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate({ to: '/checkout' })}
            >
              Try Again
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={() =>
                navigate({ to: '/checkout' }).then(() => {
                  checkout.goToStep(2); // Go back to Payment step
                })
              }
            >
              Choose Different Method
            </Button>
          </div>
        </Card>
      </Container>
    );
  }

  // Pending
  if (status === 'pending') {
    return (
      <Container className="py-4">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Cart', href: '/cart' },
            { label: 'Checkout', href: '/checkout' },
            { label: 'Payment', current: true },
          ]}
        />

        <Card variant="info" className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <Spinner size="lg" />
          </div>
          <h1 className="text-xl font-semibold text-neutral-900 mb-2">
            Payment Pending
          </h1>
          <p className="text-neutral-500 mb-6">
            Your payment is being processed. This may take a few moments.
            Please wait or check back shortly.
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate({ to: '/checkout' })}
            >
              Back to Checkout
            </Button>
          </div>
        </Card>
      </Container>
    );
  }

  // Unknown status or missing params — show loading then fallback
  if (!processed) {
    return (
      <Container className="py-4">
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      </Container>
    );
  }

  // Processed but no recognized status
  return (
    <Container className="py-4">
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Cart', href: '/cart' },
          { label: 'Checkout', href: '/checkout' },
          { label: 'Payment', current: true },
        ]}
      />

      <Card variant="info" className="p-8 text-center">
        <h1 className="text-xl font-semibold text-neutral-900 mb-2">
          Processing Payment
        </h1>
        <p className="text-neutral-500 mb-6">
          We are processing your payment result. Please wait a moment.
        </p>
        <div className="flex gap-3 justify-center">
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate({ to: '/checkout' })}
          >
            Back to Checkout
          </Button>
        </div>
      </Card>
    </Container>
  );
}
