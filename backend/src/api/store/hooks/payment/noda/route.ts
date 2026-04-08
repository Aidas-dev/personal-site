import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { NodaWebhookService } from "../../../../../modules/noda-payment/services/noda-webhook";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const webhookSecret = process.env.NODA_WEBHOOK_SECRET || '';

  // 1. Check for signature header
  const signature = req.headers['x-noda-signature'] as string | undefined;
  if (!signature) {
    return res.status(401).json({
      error: 'Missing X-Noda-Signature header',
    });
  }

  // 2. Get raw body for signature verification
  const rawBody = typeof req.rawBody === 'string'
    ? req.rawBody
    : (req.rawBody as Buffer)?.toString('utf-8') || '';

  if (!rawBody) {
    return res.status(400).json({
      error: 'Empty request body',
    });
  }

  // 3. Verify signature
  const webhookService = new NodaWebhookService(
    req.scope,
    { webhookSecret }
  );

  const isValid = webhookService.verifySignature(rawBody, signature, webhookSecret);
  if (!isValid) {
    return res.status(401).json({
      error: 'Invalid signature',
    });
  }

  // 4. Parse JSON payload
  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return res.status(400).json({
      error: 'Malformed JSON payload',
    });
  }

  // 5. Log the event for auditability
  const eventType = payload.event as string | undefined;
  const eventData = payload.data as Record<string, unknown> | undefined;
  console.log(
    `[Noda Webhook] Received event: ${eventType}`,
    eventData ? `for payment: ${eventData.id}` : ''
  );

  // 6. Process the event
  try {
    await webhookService.processEvent(payload);
  } catch (error) {
    console.error('[Noda Webhook] Error processing event:', error);
    // Still return 200 to prevent Noda from retrying indefinitely
    // The error is logged for investigation
    return res.status(200).json({
      status: 'error_logged',
      message: 'Event processing failed — see logs',
    });
  }

  // 7. Return 200 OK (Noda expects 2xx)
  return res.status(200).json({
    status: 'ok',
    event: eventType,
  });
}
