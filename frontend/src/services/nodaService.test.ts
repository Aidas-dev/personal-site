import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NodaService } from '@/services/nodaService';

describe('NodaService', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_USE_MOCK', 'true');
    vi.useFakeTimers();
    NodaService.__resetMock();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.useRealTimers();
  });

  describe('initiatePayment', () => {
    it('should return redirect URL and payment ID in mock mode', async () => {
      const promise = NodaService.initiatePayment('cart-123', 5000, 'EUR');

      // Advance the fake timer for the delay
      await vi.advanceTimersByTimeAsync(600);

      const result = await promise;

      expect(result).toHaveProperty('redirectUrl');
      expect(result).toHaveProperty('paymentId');
      expect(result.redirectUrl).toContain('cart-123');
      expect(result.redirectUrl).toContain('5000');
      expect(result.redirectUrl).toContain('EUR');
      expect(result.paymentId).toContain('noda_mock_cart-123');
    });

    it('should include cart ID in the redirect URL', async () => {
      const promise = NodaService.initiatePayment('test-cart-456', 100, 'EUR');
      await vi.advanceTimersByTimeAsync(600);
      const result = await promise;

      expect(result.redirectUrl).toContain('test-cart-456');
    });

    it('should generate unique payment IDs per call', async () => {
      const promise1 = NodaService.initiatePayment('cart-1', 100, 'EUR');
      await vi.advanceTimersByTimeAsync(600);
      const result1 = await promise1;

      // Advance time to ensure different timestamps
      await vi.advanceTimersByTimeAsync(1000);

      const promise2 = NodaService.initiatePayment('cart-1', 100, 'EUR');
      await vi.advanceTimersByTimeAsync(600);
      const result2 = await promise2;

      expect(result1.paymentId).not.toBe(result2.paymentId);
    });
  });

  describe('getPaymentStatus', () => {
    it('should return authorized status in mock mode', async () => {
      const promise = NodaService.getPaymentStatus('noda_mock_123');
      await vi.advanceTimersByTimeAsync(400);
      const result = await promise;

      expect(result.status).toBe('authorized');
      expect(result.data).toHaveProperty('id', 'noda_mock_123');
      expect(result.data).toHaveProperty('provider', 'noda');
    });

    it('should return data with payment ID', async () => {
      const promise = NodaService.getPaymentStatus('payment-abc');
      await vi.advanceTimersByTimeAsync(400);
      const result = await promise;

      expect(result.data.id).toBe('payment-abc');
    });
  });
});
