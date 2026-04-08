import { loadStripe, type Stripe, type StripeElements } from '@stripe/stripe-js';

const USE_MOCK = import.meta.env.VITE_API_USE_MOCK !== 'false';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000';
const STRIPE_PUBLISHABLE_KEY =
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

let stripePromise: Promise<Stripe | null> | null = null;

function getStripeInstance(): Promise<Stripe | null> {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// Mock State
// ============================================================================

interface MockPaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;
  status: 'pending' | 'succeeded' | 'failed';
}

let mockPaymentIntent: MockPaymentIntent | null = null;

// ============================================================================
// Types
// ============================================================================

export interface PaymentIntentResult {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
}

export interface ConfirmPaymentResult {
  success: boolean;
  error?: string;
  paymentIntentId?: string;
}

// ============================================================================
// Public API
// ============================================================================

/** Get the Stripe publishable key from environment */
export function getPublishableKey(): string {
  return STRIPE_PUBLISHABLE_KEY;
}

/**
 * Create a payment intent via the Medusa API.
 * In mock mode, returns a simulated payment intent.
 */
export async function createPaymentIntent(
  cartId: string,
): Promise<PaymentIntentResult> {
  if (USE_MOCK) {
    await delay(500);
    const intentId = `pi_mock_${Date.now()}`;
    const secret = `${intentId}_secret_mock`;
    mockPaymentIntent = {
      id: intentId,
      clientSecret: secret,
      amount: 0, // Would be populated from cart total
      status: 'pending',
    };
    return {
      clientSecret: secret,
      paymentIntentId: intentId,
      amount: 0,
    };
  }

  // Real API: Create payment session with Stripe provider
  const response = await fetch(
    `${API_URL}/store/carts/${cartId}/payment-sessions`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider_id: 'pp_stripe_stripe' }),
    },
  );

  if (!response.ok) {
    throw new Error(
      `Failed to create payment intent: ${response.statusText}`,
    );
  }

  const data = await response.json();
  const session = data.cart?.payment_collection?.payment_sessions?.find(
    (ps: { provider_id: string }) => ps.provider_id === 'pp_stripe_stripe',
  );

  if (!session) {
    throw new Error('Stripe payment session not found');
  }

  return {
    clientSecret: session.client_secret,
    paymentIntentId: session.id,
    amount: session.amount,
  };
}

/**
 * Confirm a payment using Stripe Elements.
 * In mock mode, simulates payment success after 1-2 second delay.
 */
export async function confirmPayment(
  clientSecret: string,
  elements: StripeElements,
  simulateSuccess: boolean = true,
): Promise<ConfirmPaymentResult> {
  if (USE_MOCK) {
    await delay(1000 + Math.random() * 1000);

    if (simulateSuccess) {
      if (mockPaymentIntent) {
        mockPaymentIntent.status = 'succeeded';
      }
      return {
        success: true,
        paymentIntentId: mockPaymentIntent?.id,
      };
    }

    return {
      success: false,
      error: 'Card was declined. Please try a different payment method.',
    };
  }

  // Real Stripe: use Stripe.confirmCardPayment
  const stripe = await getStripeInstance();
  if (!stripe) {
    return {
      success: false,
      error: 'Failed to load Stripe. Please refresh and try again.',
    };
  }

  const result = await stripe.confirmCardPayment(clientSecret, {
    payment_method: {
      card: elements.getElement('card') ?? undefined,
    },
  });

  if (result.error) {
    return {
      success: false,
      error: result.error.message ?? 'Payment failed. Please try again.',
    };
  }

  return {
    success: true,
    paymentIntentId: result.paymentIntent?.id,
  };
}

/** Reset mock state (for testing) */
export function __resetMock(): void {
  mockPaymentIntent = null;
  stripePromise = null;
}

/** Get mock payment intent (for testing) */
export function __getMockPaymentIntent(): MockPaymentIntent | null {
  return mockPaymentIntent;
}
