const USE_MOCK = import.meta.env.VITE_API_USE_MOCK !== 'false';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000';

// ============================================================================
// Types
// ============================================================================

export interface NodaPaymentResult {
  redirectUrl: string;
  paymentId: string;
}

export interface NodaPaymentStatus {
  status: string;
  data: Record<string, unknown>;
}

// ============================================================================
// Mock Data
// ============================================================================

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// Noda Service
// ============================================================================

/**
 * NodaService — handles Noda payment initiation and status checking
 * via the Medusa backend store API.
 *
 * Flow:
 * 1. POST /store/carts/{cartId}/payment-sessions with provider 'noda'
 * 2. GET the payment session to retrieve redirect URL
 * 3. After redirect callback, GET payment status
 */
export const NodaService = {
  /**
   * Initiate a Noda payment through Medusa.
   * Creates a payment session for the 'noda' provider and returns the redirect URL.
   */
  async initiatePayment(
    cartId: string,
    amount: number,
    currency: string,
  ): Promise<NodaPaymentResult> {
    if (USE_MOCK) {
      await delay(500);
      return {
        redirectUrl: `https://mock.noda.io/pay?cart=${cartId}&amount=${amount}&currency=${currency}`,
        paymentId: `noda_mock_${cartId}_${Date.now()}`,
      };
    }

    // Step 1: Create payment sessions for the cart (includes 'noda')
    const sessionsResponse = await fetch(
      `${API_URL}/store/carts/${cartId}/payment-sessions`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
    );

    if (!sessionsResponse.ok) {
      throw new Error(
        `Failed to create payment sessions: ${sessionsResponse.statusText}`,
      );
    }

    // Step 2: Select the noda payment session
    const sessionsData: {
      cart?: {
        payment_collection?: {
          payment_sessions?: Array<{
            id: string;
            provider_id: string;
            status: string;
            data?: Record<string, unknown>;
          }>;
        };
      };
    } = await sessionsResponse.json();

    const nodaSession = sessionsData.cart?.payment_collection?.payment_sessions?.find(
      (ps) => ps.provider_id === 'noda' || ps.provider_id === 'pp_noda',
    );

    if (!nodaSession) {
      throw new Error('Noda payment session not found');
    }

    // Step 3: Select the payment session to get the redirect URL
    const selectResponse = await fetch(
      `${API_URL}/store/carts/${cartId}/payment-sessions/${nodaSession.id}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
    );

    if (!selectResponse.ok) {
      throw new Error(
        `Failed to select Noda payment session: ${selectResponse.statusText}`,
      );
    }

    const selectData: {
      payment_session?: {
        id: string;
        status: string;
        data?: Record<string, unknown> & { redirect_url?: string };
      };
    } = await selectResponse.json();

    const session = selectData.payment_session;
    if (!session) {
      throw new Error('No payment session returned');
    }

    const redirectUrl = session.data?.redirect_url ?? '';
    if (!redirectUrl) {
      throw new Error('No redirect URL returned from Noda payment session');
    }

    return {
      redirectUrl,
      paymentId: session.id,
    };
  },

  /**
   * Check payment status after redirect callback.
   * Returns the status and full data for the payment session.
   */
  async getPaymentStatus(paymentId: string): Promise<NodaPaymentStatus> {
    if (USE_MOCK) {
      await delay(300);
      return {
        status: 'authorized',
        data: { id: paymentId, provider: 'noda' },
      };
    }

    const response = await fetch(
      `${API_URL}/store/payment-sessions/${paymentId}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      },
    );

    if (!response.ok) {
      throw new Error(
        `Failed to get payment status: ${response.statusText}`,
      );
    }

    const data: {
      payment_session?: {
        id: string;
        status: string;
        data?: Record<string, unknown>;
      };
    } = await response.json();

    const session = data.payment_session;
    if (!session) {
      throw new Error('Payment session not found');
    }

    return {
      status: session.status,
      data: session.data ?? {},
    };
  },

  /** Reset mock state (for testing) */
  __resetMock(): void {
    // No persistent mock state to reset currently
  },
};
