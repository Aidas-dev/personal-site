import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as crypto from 'crypto';

// ──────────────────────────────────────────────────────────────
// Mocks — set up BEFORE any imports
// ──────────────────────────────────────────────────────────────

const mockCapturePayment = vi.fn().mockResolvedValue({ id: 'pay_captured', status: 'captured' });
const mockCancelPayment = vi.fn().mockResolvedValue({ id: 'pay_cancelled', status: 'canceled' });
const mockRefundPayment = vi.fn().mockResolvedValue({ id: 'pay_refunded', status: 'refunded' });

// Track which events have been "processed" for idempotency
const processedPaymentIds = new Set<string>();

vi.mock('@medusajs/framework/utils', () => ({
  Modules: {
    PAYMENT: '__payment__',
  },
  MedusaError: class MedusaError extends Error {
    static Types = {
      INVALID_DATA: 'invalid_data',
    };
    constructor(type: string, message: string) {
      super(message);
      this.name = 'MedusaError';
    }
  },
}));

vi.mock('../../../../modules/noda-payment/services/noda-webhook', () => {
  return {
    NodaWebhookService: class {
      private container: any;
      private webhookSecret: string;

      constructor(container: any, options: { webhookSecret: string }) {
        this.container = container;
        this.webhookSecret = options.webhookSecret;
      }

      verifySignature(rawBody: string, signature: string, secret: string): boolean {
        if (!secret || !rawBody || !signature) return false;
        const computed = crypto
          .createHmac('sha256', secret)
          .update(rawBody)
          .digest('hex');
        try {
          return crypto.timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(computed)
          );
        } catch {
          return false;
        }
      }

      async processEvent(payload: Record<string, unknown>): Promise<void> {
        const event = payload.event as string;
        const data = payload.data as Record<string, unknown>;
        const paymentId = data?.id as string;

        // Idempotency
        if (processedPaymentIds.has(paymentId)) {
          return;
        }

        switch (event) {
          case 'payment.completed':
            await mockCapturePayment({ payment_id: paymentId });
            break;
          case 'payment.failed':
            await mockCancelPayment(paymentId);
            break;
          case 'payment.pending':
            break;
          case 'payment.refunded':
            await mockRefundPayment({ payment_id: paymentId, amount: data.amount || 0 });
            break;
          default:
            throw new Error(`Unknown event: ${event}`);
        }

        processedPaymentIds.add(paymentId);
      }

      async isEventProcessed(eventId: string): Promise<boolean> {
        return processedPaymentIds.has(eventId);
      }

      async markEventProcessed(eventId: string): Promise<void> {
        processedPaymentIds.add(eventId);
      }
    },
  };
});

// Mock MedusaRequest/MedusaResponse
interface MockMedusaRequest {
  rawBody?: string | Buffer;
  headers: Record<string, string | undefined>;
  scope?: any;
}

interface MockMedusaResponse {
  statusCode: number;
  responseBody: unknown;
  status(code: number): this;
  json(body: unknown): this;
}

function createMockReq(overrides: Partial<MockMedusaRequest> = {}): MockMedusaRequest {
  return {
    rawBody: undefined,
    headers: {},
    scope: {
      resolve: () => ({
        capturePayment: mockCapturePayment,
        cancelPayment: mockCancelPayment,
        refundPayment: mockRefundPayment,
        retrievePayment: vi.fn().mockResolvedValue({ id: 'pay_123' }),
      }),
    },
    ...overrides,
  };
}

function createMockRes(): MockMedusaResponse {
  const res: MockMedusaResponse = {
    statusCode: 200,
    responseBody: null,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(body: unknown) {
      this.responseBody = body;
      return this;
    },
  };
  return res;
}

// ──────────────────────────────────────────────────────────────
// Test Helpers
// ──────────────────────────────────────────────────────────────

const WEBHOOK_SECRET = 'test_webhook_secret_key';

function generateSignature(rawBody: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');
}

// ──────────────────────────────────────────────────────────────
// Tests
// ──────────────────────────────────────────────────────────────

describe('Noda Webhook Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    processedPaymentIds.clear();
    process.env.NODA_WEBHOOK_SECRET = WEBHOOK_SECRET;
  });

  afterEach(() => {
    delete process.env.NODA_WEBHOOK_SECRET;
  });

  describe('Signature verification', () => {
    it('should return 200 when signature is valid', async () => {
      const payload = JSON.stringify({
        event: 'payment.completed',
        data: { id: 'pay_valid_sig', amount: 1000, currency: 'EUR', status: 'CAPTURED' },
      });
      const signature = generateSignature(payload, WEBHOOK_SECRET);

      const { POST } = await import('../route');

      const req = createMockReq({
        rawBody: payload,
        headers: { 'x-noda-signature': signature },
      });
      const res = createMockRes();

      await POST(req as any, res as any);

      expect(res.statusCode).toBe(200);
    });

    it('should return 401 when signature is invalid', async () => {
      const payload = JSON.stringify({
        event: 'payment.completed',
        data: { id: 'pay_invalid_sig', amount: 1000, currency: 'EUR' },
      });

      const { POST } = await import('../route');

      const req = createMockReq({
        rawBody: payload,
        headers: { 'x-noda-signature': 'invalid_signature_value' },
      });
      const res = createMockRes();

      await POST(req as any, res as any);

      expect(res.statusCode).toBe(401);
    });

    it('should return 401 when signature header is missing', async () => {
      const payload = JSON.stringify({
        event: 'payment.completed',
        data: { id: 'pay_no_sig', amount: 1000, currency: 'EUR' },
      });

      const { POST } = await import('../route');

      const req = createMockReq({
        rawBody: payload,
        headers: {},
      });
      const res = createMockRes();

      await POST(req as any, res as any);

      expect(res.statusCode).toBe(401);
    });
  });

  describe('Event processing', () => {
    it('should process payment.completed event and capture payment', async () => {
      const payload = JSON.stringify({
        event: 'payment.completed',
        data: { id: 'pay_capture_me', amount: 5000, currency: 'EUR', status: 'CAPTURED' },
      });
      const signature = generateSignature(payload, WEBHOOK_SECRET);

      const { POST } = await import('../route');

      const req = createMockReq({
        rawBody: payload,
        headers: { 'x-noda-signature': signature },
      });
      const res = createMockRes();

      await POST(req as any, res as any);

      expect(res.statusCode).toBe(200);
      expect(mockCapturePayment).toHaveBeenCalledWith(
        expect.objectContaining({ payment_id: 'pay_capture_me' })
      );
    });

    it('should process payment.failed event and cancel payment', async () => {
      const payload = JSON.stringify({
        event: 'payment.failed',
        data: { id: 'pay_fail_me', amount: 2000, currency: 'EUR', status: 'FAILED' },
      });
      const signature = generateSignature(payload, WEBHOOK_SECRET);

      const { POST } = await import('../route');

      const req = createMockReq({
        rawBody: payload,
        headers: { 'x-noda-signature': signature },
      });
      const res = createMockRes();

      await POST(req as any, res as any);

      expect(res.statusCode).toBe(200);
      expect(mockCancelPayment).toHaveBeenCalledWith('pay_fail_me');
    });
  });

  describe('Idempotency', () => {
    it('should return 200 for duplicate event without re-processing', async () => {
      const payload = JSON.stringify({
        event: 'payment.completed',
        data: { id: 'pay_dup_me', amount: 3000, currency: 'EUR', status: 'CAPTURED' },
      });
      const signature = generateSignature(payload, WEBHOOK_SECRET);

      const { POST } = await import('../route');

      const req = createMockReq({
        rawBody: payload,
        headers: { 'x-noda-signature': signature },
      });

      // First call
      const res1 = createMockRes();
      await POST(req as any, res1 as any);
      expect(res1.statusCode).toBe(200);

      // Second call with same payload
      const res2 = createMockRes();
      await POST(req as any, res2 as any);
      expect(res2.statusCode).toBe(200);

      // Should have been called only once
      expect(mockCapturePayment).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error handling', () => {
    it('should return 400 for malformed JSON', async () => {
      const malformedBody = '{invalid json!!!';
      const signature = generateSignature(malformedBody, WEBHOOK_SECRET);

      const { POST } = await import('../route');

      const req = createMockReq({
        rawBody: malformedBody,
        headers: { 'x-noda-signature': signature },
      });
      const res = createMockRes();

      await POST(req as any, res as any);

      expect(res.statusCode).toBe(400);
    });
  });
});
