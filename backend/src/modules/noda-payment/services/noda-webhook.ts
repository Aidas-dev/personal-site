import * as crypto from 'crypto';
import { MedusaError, Modules } from "@medusajs/framework/utils";
import type { IPaymentModuleService } from "@medusajs/framework/types";

interface ContainerLike {
  resolve<T>(key: string | symbol): T;
}

interface NodaWebhookOptions {
  webhookSecret?: string;
}

// In-memory idempotency store (in production, use Redis or DB)
const processedEvents = new Set<string>();

class NodaWebhookService {
  private paymentModuleService: IPaymentModuleService;
  private webhookSecret: string;

  constructor(container: ContainerLike, options: NodaWebhookOptions = {}) {
    this.paymentModuleService = container.resolve<IPaymentModuleService>(Modules.PAYMENT);
    this.webhookSecret = options.webhookSecret || '';
  }

  /**
   * Verify webhook signature using HMAC-SHA256
   */
  verifySignature(rawBody: string, signature: string, secret: string): boolean {
    if (!secret || !rawBody || !signature) {
      return false;
    }

    const computed = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    // Use timing-safe comparison to prevent timing attacks
    try {
      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(computed)
      );
    } catch {
      // Buffers of different lengths will throw
      return false;
    }
  }

  /**
   * Process incoming webhook event from Noda
   */
  async processEvent(payload: Record<string, unknown>): Promise<void> {
    const event = payload.event as string | undefined;
    const data = payload.data as Record<string, unknown> | undefined;

    if (!event || !data) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        'Invalid webhook payload: missing event or data'
      );
    }

    const paymentId = data.id as string | undefined;
    if (!paymentId) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        'Invalid webhook payload: missing payment id in data'
      );
    }

    // Idempotency check
    if (await this.isEventProcessed(paymentId)) {
      console.log(`[Noda Webhook] Event already processed for payment: ${paymentId}`);
      return;
    }

    // Resolve payment module service (already resolved in constructor)
    const paymentModuleService = this.paymentModuleService;

    switch (event) {
      case 'payment.completed':
        console.log(`[Noda Webhook] Processing payment.completed for: ${paymentId}`);
        await paymentModuleService.capturePayment({
          payment_id: paymentId,
        });
        break;

      case 'payment.failed':
        console.log(`[Noda Webhook] Processing payment.failed for: ${paymentId}`);
        await paymentModuleService.cancelPayment(paymentId);
        break;

      case 'payment.pending':
        console.log(`[Noda Webhook] Payment pending for: ${paymentId} — no state change needed`);
        break;

      case 'payment.refunded':
        console.log(`[Noda Webhook] Processing payment.refunded for: ${paymentId}`);
        const amount = data.amount as number | undefined;
        await paymentModuleService.refundPayment({
          payment_id: paymentId,
          amount: amount || 0,
        });
        break;

      default:
        console.warn(`[Noda Webhook] Unknown event type: ${event}`);
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Unsupported webhook event: ${event}`
        );
    }

    // Mark as processed
    await this.markEventProcessed(paymentId);
  }

  /**
   * Check if event was already processed (idempotency)
   */
  async isEventProcessed(eventId: string): Promise<boolean> {
    return processedEvents.has(eventId);
  }

  /**
   * Mark event as processed
   */
  async markEventProcessed(eventId: string): Promise<void> {
    processedEvents.add(eventId);
  }
}

export { NodaWebhookService };
