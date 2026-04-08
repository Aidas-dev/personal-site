import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getPublishableKey,
  createPaymentIntent,
  confirmPayment,
  __resetMock,
  __getMockPaymentIntent,
} from '@/services/stripeService';

// Mock Stripe loadStripe
vi.mock('@stripe/stripe-js', () => ({
  loadStripe: vi.fn().mockResolvedValue({
    confirmCardPayment: vi.fn().mockResolvedValue({
      paymentIntent: { id: 'pi_real_123' },
    }),
  }),
}));

describe('stripeService', () => {
  beforeEach(() => {
    __resetMock();
  });

  describe('getPublishableKey', () => {
    it('should return the Stripe publishable key from env', () => {
      const key = getPublishableKey();
      // In test env, this will be whatever is set in VITE_STRIPE_PUBLISHABLE_KEY
      expect(typeof key).toBe('string');
    });
  });

  describe('createPaymentIntent (mock mode)', () => {
    it('should create a mock payment intent with correct structure', async () => {
      const result = await createPaymentIntent('cart_test_123');

      expect(result).toBeDefined();
      expect(result.clientSecret).toContain('secret');
      expect(result.paymentIntentId).toContain('pi_mock_');
      expect(result.amount).toBe(0);
    });

    it('should create unique payment intents for different cart IDs', async () => {
      const result1 = await createPaymentIntent('cart_1');
      const result2 = await createPaymentIntent('cart_2');

      expect(result1.paymentIntentId).not.toBe(result2.paymentIntentId);
    });

    it('should store the mock payment intent internally', async () => {
      await createPaymentIntent('cart_test');

      const mockIntent = __getMockPaymentIntent();
      expect(mockIntent).not.toBeNull();
      expect(mockIntent?.status).toBe('pending');
    });
  });

  describe('confirmPayment (mock mode)', () => {
    it('should confirm payment successfully when simulateSuccess is true', async () => {
      const intent = await createPaymentIntent('cart_test');
      // Create a minimal mock elements object
      const mockElements = {} as Parameters<typeof confirmPayment>[1];

      const result = await confirmPayment(intent.clientSecret, mockElements, true);

      expect(result.success).toBe(true);
      expect(result.paymentIntentId).toBeDefined();
    });

    it('should return error when simulateSuccess is false', async () => {
      const intent = await createPaymentIntent('cart_test');
      const mockElements = {} as Parameters<typeof confirmPayment>[1];

      const result = await confirmPayment(intent.clientSecret, mockElements, false);

      expect(result.success).toBe(false);
      expect(result.error).toContain('declined');
    });

    it('should update mock payment intent status on success', async () => {
      const intent = await createPaymentIntent('cart_test');
      const mockElements = {} as Parameters<typeof confirmPayment>[1];

      await confirmPayment(intent.clientSecret, mockElements, true);

      const mockIntent = __getMockPaymentIntent();
      expect(mockIntent?.status).toBe('succeeded');
    });

    it('should introduce a delay (at least 1 second)', async () => {
      const start = Date.now();
      const intent = await createPaymentIntent('cart_test');
      const mockElements = {} as Parameters<typeof confirmPayment>[1];

      await confirmPayment(intent.clientSecret, mockElements, true);

      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThanOrEqual(900); // Allow 100ms tolerance
    });
  });

  describe('__resetMock', () => {
    it('should clear mock payment intent', async () => {
      await createPaymentIntent('cart_test');
      expect(__getMockPaymentIntent()).not.toBeNull();

      __resetMock();
      expect(__getMockPaymentIntent()).toBeNull();
    });
  });
});
