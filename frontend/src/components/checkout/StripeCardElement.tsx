import { useState, useCallback } from 'react';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
  type StripeElementsOptions,
} from '@stripe/react-stripe-js';
import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import {
  confirmPayment,
  createPaymentIntent,
  getPublishableKey,
} from '@/services/stripeService';

const USE_MOCK = import.meta.env.VITE_API_USE_MOCK !== 'false';

// ============================================================================
// Mock Mode Card Form
// ============================================================================

interface MockCardFormProps {
  cartId: string;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
}

function MockCardForm({ cartId, onSuccess, onError }: MockCardFormProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  const handleSimulateSuccess = useCallback(async () => {
    setIsProcessing(true);
    try {
      const intent = await createPaymentIntent(cartId);
      // Create a mock elements-like object for the service
      const mockElements = {} as ReturnType<
        typeof useElements
      > extends null
        ? never
        : NonNullable<ReturnType<typeof useElements>>;
      const result = await confirmPayment(intent.clientSecret, mockElements, true);
      if (result.success && result.paymentIntentId) {
        onSuccess(result.paymentIntentId);
      } else {
        onError(result.error ?? 'Payment failed');
      }
    } catch {
      onError('Failed to process payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [cartId, onSuccess, onError]);

  const handleSimulateFailure = useCallback(async () => {
    setIsProcessing(true);
    try {
      const intent = await createPaymentIntent(cartId);
      const mockElements = {} as ReturnType<
        typeof useElements
      > extends null
        ? never
        : NonNullable<ReturnType<typeof useElements>>;
      const result = await confirmPayment(intent.clientSecret, mockElements, false);
      if (result.success && result.paymentIntentId) {
        onSuccess(result.paymentIntentId);
      } else {
        onError(result.error ?? 'Payment failed');
      }
    } catch {
      onError('Failed to process payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [cartId, onSuccess, onError]);

  return (
    <Card variant="info" className="mt-4">
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-neutral-700 mb-3">
            Test Payment — Mock Mode
          </h4>
          <p className="text-xs text-neutral-500 mb-4">
            Stripe is in mock mode. Use the buttons below to simulate payment
            success or failure.
          </p>
        </div>

        {/* Fake card input fields for visual realism */}
        <div className="space-y-3">
          <div>
            <label
              htmlFor="mock-card-number"
              className="block text-xs font-medium text-neutral-600 mb-1"
            >
              Card Number
            </label>
            <input
              id="mock-card-number"
              type="text"
              inputMode="numeric"
              placeholder="4242 4242 4242 4242"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              aria-label="Mock card number input"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="mock-expiry"
                className="block text-xs font-medium text-neutral-600 mb-1"
              >
                Expiry
              </label>
              <input
                id="mock-expiry"
                type="text"
                placeholder="MM/YY"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                aria-label="Mock card expiry input"
              />
            </div>
            <div>
              <label
                htmlFor="mock-cvc"
                className="block text-xs font-medium text-neutral-600 mb-1"
              >
                CVC
              </label>
              <input
                id="mock-cvc"
                type="text"
                inputMode="numeric"
                placeholder="123"
                value={cvc}
                onChange={(e) => setCvc(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                aria-label="Mock card CVC input"
              />
            </div>
          </div>
        </div>

        {/* Test buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="primary"
            size="md"
            onClick={handleSimulateSuccess}
            isLoading={isProcessing}
            className="flex-1"
          >
            Simulate Success
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={handleSimulateFailure}
            isLoading={isProcessing}
            className="flex-1"
          >
            Simulate Failure
          </Button>
        </div>
      </div>
    </Card>
  );
}

// ============================================================================
// Real Stripe Card Form (wrapped in Elements)
// ============================================================================

interface StripeCardFormWrapperProps {
  clientSecret: string;
  stripeKey: string;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
}

function StripeCardFormWrapper({
  clientSecret,
  stripeKey,
  onSuccess,
  onError,
}: StripeCardFormWrapperProps) {
  const stripeOptions: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#2d5a3d',
      },
    },
  };

  return (
    <Elements stripe={loadStripe(stripeKey)} options={stripeOptions}>
      <StripeCardForm onSuccess={onSuccess} onError={onError} />
    </Elements>
  );
}

interface StripeCardFormProps {
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
}

function StripeCardForm({ onSuccess, onError }: StripeCardFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = useCallback(async () => {
    if (!stripe || !elements) {
      onError('Stripe is not available. Please refresh and try again.');
      return;
    }

    setIsProcessing(true);
    try {
      const clientSecret = (
        elements as ReturnType<typeof useElements> & { clientSecret?: string }
      ).clientSecret;

      if (!clientSecret) {
        onError('Payment session not found');
        return;
      }

      const result = await confirmPayment(clientSecret, elements);
      if (result.success && result.paymentIntentId) {
        onSuccess(result.paymentIntentId);
      } else {
        onError(result.error ?? 'Payment failed');
      }
    } catch {
      onError('Failed to process payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [stripe, elements, onSuccess, onError]);

  return (
    <Card variant="info" className="mt-4">
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-neutral-700 mb-3">
            Card Details
          </h4>
        </div>

        <div className="px-3 py-3 border border-neutral-300 rounded-lg bg-white">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#111827',
                  '::placeholder': {
                    color: '#9ca3af',
                  },
                },
                invalid: {
                  color: '#ef4444',
                  iconColor: '#ef4444',
                },
              },
            }}
          />
        </div>

        <Button
          variant="primary"
          size="lg"
          onClick={handleConfirm}
          isLoading={isProcessing}
          disabled={!stripe || !elements}
          className="w-full"
        >
          Pay Now
        </Button>
      </div>
    </Card>
  );
}

// ============================================================================
// Main Component — chooses mock or real based on env
// ============================================================================

interface StripeCardElementProps {
  cartId: string;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
}

export function StripeCardElement({
  cartId,
  onSuccess,
  onError,
}: StripeCardElementProps) {
  if (USE_MOCK) {
    return <MockCardForm cartId={cartId} onSuccess={onSuccess} onError={onError} />;
  }

  // For real mode, we need to first create a payment intent
  return <RealModeCard cartId={cartId} onSuccess={onSuccess} onError={onError} />;
}

function RealModeCard({
  cartId,
  onSuccess,
  onError,
}: {
  cartId: string;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
}) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const stripeKey = getPublishableKey();

  if (!stripeKey) {
    return (
      <Card variant="info" className="mt-4">
        <p className="text-sm text-red-600">
          Stripe publishable key is not configured. Please set
          VITE_STRIPE_PUBLISHABLE_KEY in your environment.
        </p>
      </Card>
    );
  }

  // We need to fetch the client secret on mount — use a simple inline effect
  // Since we can't use useEffect in a conditional, we handle it differently
  if (!clientSecret && !isLoading) {
    // This branch shouldn't normally happen since we set isLoading
  }

  // Use a wrapper component to handle the async fetch
  return (
    <RealModeCardInner
      cartId={cartId}
      stripeKey={stripeKey}
      onSuccess={onSuccess}
      onError={onError}
    />
  );
}

function RealModeCardInner({
  cartId,
  stripeKey,
  onSuccess,
  onError,
}: {
  cartId: string;
  stripeKey: string;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
}) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Use a custom hook-like pattern with a mounted flag
  const fetchIntent = useCallback(async () => {
    try {
      const intent = await createPaymentIntent(cartId);
      setClientSecret(intent.clientSecret);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to initialize payment';
      setError(message);
      onError(message);
    } finally {
      setIsLoading(false);
    }
  }, [cartId, onError]);

  // Use a simple effect via a one-shot render check
  if (!clientSecret && isLoading && !error) {
    // Trigger the async fetch — using a microtask to avoid synchronous state updates
    Promise.resolve().then(() => {
      fetchIntent();
    });
  }

  if (isLoading) {
    return (
      <Card variant="info" className="mt-4">
        <div className="flex items-center gap-3 py-4">
          <svg
            className="animate-spin h-5 w-5 text-primary-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-sm text-neutral-600">
            Initializing payment...
          </span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card variant="info" className="mt-4">
        <p className="text-sm text-red-600">{error}</p>
      </Card>
    );
  }

  if (clientSecret) {
    return (
      <StripeCardFormWrapper
        clientSecret={clientSecret}
        stripeKey={stripeKey}
        onSuccess={onSuccess}
        onError={onError}
      />
    );
  }

  return null;
}
