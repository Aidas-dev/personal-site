import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NodaPaymentProviderService } from '../services/noda-payment';
import { NodaClient } from '../services/noda-client';

// Mock the NodaClient
vi.mock('../services/noda-client', () => {
  return {
    NodaClient: vi.fn().mockImplementation(() => ({
      createPayment: vi.fn(),
      getPayment: vi.fn(),
      capturePayment: vi.fn(),
      cancelPayment: vi.fn(),
      refundPayment: vi.fn(),
    })),
  };
});

describe('NodaPaymentProviderService', () => {
  let service: NodaPaymentProviderService;
  let mockClient: jest.Mocked<NodaClient>;

  const validOptions = {
    apiKey: 'test_api_key_123',
    baseUrl: 'https://api-sandbox.noda.live',
    webhookSecret: 'test_webhook_secret',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    service = new NodaPaymentProviderService({} as any, validOptions as any, {} as any);
    // Access the mocked client instance
    mockClient = (NodaClient as jest.Mock).mock.results[0].value;
  });

  describe('initiatePayment', () => {
    it('returns session with payment id and redirect URL', async () => {
      const nodaResponse = {
        id: 'noda_pay_123',
        redirectUrl: 'https://checkout-sandbox.noda.live/pay/noda_pay_123',
        status: 'PENDING',
      };
      mockClient.createPayment.mockResolvedValue(nodaResponse);

      const input = {
        amount: 5000,
        currency_code: 'eur',
        context: {
          customer: {
            email: 'customer@example.com',
          },
        },
      };

      const result = await service.initiatePayment(input);

      expect(result.id).toBe('noda_pay_123');
      expect(result.data).toEqual(nodaResponse);
      expect(mockClient.createPayment).toHaveBeenCalledWith({
        amount: 5000,
        currency: 'EUR',
        email: 'customer@example.com',
      });
    });

    it('throws error when Noda API call fails', async () => {
      mockClient.createPayment.mockRejectedValue(new Error('API Error'));

      const input = {
        amount: 5000,
        currency_code: 'eur',
        context: {
          customer: {
            email: 'customer@example.com',
          },
        },
      };

      await expect(service.initiatePayment(input)).rejects.toThrow();
    });
  });

  describe('getPaymentStatus', () => {
    const baseInput = {
      data: {
        id: 'noda_pay_123',
      },
    };

    it('maps AUTHORIZED status to authorized', async () => {
      mockClient.getPayment.mockResolvedValue({ id: 'noda_pay_123', status: 'AUTHORIZED' });

      const result = await service.getPaymentStatus(baseInput);

      expect(result.status).toBe('authorized');
    });

    it('maps CAPTURED status to captured', async () => {
      mockClient.getPayment.mockResolvedValue({ id: 'noda_pay_123', status: 'CAPTURED' });

      const result = await service.getPaymentStatus(baseInput);

      expect(result.status).toBe('captured');
    });

    it('maps CANCELLED status to canceled', async () => {
      mockClient.getPayment.mockResolvedValue({ id: 'noda_pay_123', status: 'CANCELLED' });

      const result = await service.getPaymentStatus(baseInput);

      expect(result.status).toBe('canceled');
    });

    it('maps PENDING status to pending', async () => {
      mockClient.getPayment.mockResolvedValue({ id: 'noda_pay_123', status: 'PENDING' });

      const result = await service.getPaymentStatus(baseInput);

      expect(result.status).toBe('pending');
    });

    it('maps FAILED status to error', async () => {
      mockClient.getPayment.mockResolvedValue({ id: 'noda_pay_123', status: 'FAILED' });

      const result = await service.getPaymentStatus(baseInput);

      expect(result.status).toBe('error');
    });

    it('maps REFUNDED status to captured', async () => {
      mockClient.getPayment.mockResolvedValue({ id: 'noda_pay_123', status: 'REFUNDED' });

      const result = await service.getPaymentStatus(baseInput);

      expect(result.status).toBe('captured');
    });
  });

  describe('retrievePayment', () => {
    it('returns payment data from Noda', async () => {
      const nodaPayment = {
        id: 'noda_pay_123',
        status: 'AUTHORIZED',
        amount: 5000,
        currency: 'EUR',
      };
      mockClient.getPayment.mockResolvedValue(nodaPayment);

      const input = {
        data: { id: 'noda_pay_123' },
      };

      const result = await service.retrievePayment(input);

      expect(result).toEqual(nodaPayment);
      expect(mockClient.getPayment).toHaveBeenCalledWith('noda_pay_123');
    });
  });

  describe('capturePayment', () => {
    it('calls capture endpoint and returns updated data', async () => {
      const captureResponse = { id: 'noda_pay_123', status: 'CAPTURED' };
      mockClient.capturePayment.mockResolvedValue(captureResponse);

      const input = {
        data: { id: 'noda_pay_123' },
      };

      const result = await service.capturePayment(input);

      expect(result.data).toEqual({
        ...captureResponse,
        id: 'noda_pay_123',
      });
      expect(mockClient.capturePayment).toHaveBeenCalledWith('noda_pay_123');
    });
  });

  describe('cancelPayment', () => {
    it('calls cancel endpoint and returns updated data', async () => {
      const cancelResponse = { id: 'noda_pay_123', status: 'CANCELLED' };
      mockClient.cancelPayment.mockResolvedValue(cancelResponse);

      const input = {
        data: { id: 'noda_pay_123' },
      };

      const result = await service.cancelPayment(input);

      expect(result.data).toEqual(cancelResponse);
      expect(mockClient.cancelPayment).toHaveBeenCalledWith('noda_pay_123');
    });
  });

  describe('refundPayment', () => {
    it('calls refund endpoint with amount and returns updated data', async () => {
      const refundResponse = { id: 'noda_pay_123', status: 'REFUNDED' };
      mockClient.refundPayment.mockResolvedValue(refundResponse);

      const input = {
        data: { id: 'noda_pay_123' },
        amount: 2500,
      };

      const result = await service.refundPayment(input);

      expect(result.data).toEqual({
        ...input.data,
        ...refundResponse,
      });
      expect(mockClient.refundPayment).toHaveBeenCalledWith('noda_pay_123', 2500);
    });
  });
});
