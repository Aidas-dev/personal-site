import { AbstractPaymentProvider, MedusaError, BigNumber } from "@medusajs/framework/utils";
import type {
  InitiatePaymentInput,
  InitiatePaymentOutput,
  GetPaymentStatusInput,
  GetPaymentStatusOutput,
  RetrievePaymentInput,
  RetrievePaymentOutput,
  CapturePaymentInput,
  CapturePaymentOutput,
  CancelPaymentInput,
  CancelPaymentOutput,
  RefundPaymentInput,
  RefundPaymentOutput,
  UpdatePaymentInput,
  UpdatePaymentOutput,
  DeletePaymentInput,
  DeletePaymentOutput,
  AuthorizePaymentInput,
  AuthorizePaymentOutput,
  WebhookActionResult,
  ProviderWebhookPayload,
  PaymentSessionStatus,
} from "@medusajs/framework/types";
import { NodaClient } from "./noda-client";

interface NodaOptions {
  apiKey: string;
  baseUrl: string;
  webhookSecret?: string;
}

const NODA_STATUS_TO_MEDUSA: Record<string, PaymentSessionStatus> = {
  AUTHORIZED: "authorized",
  CAPTURED: "captured",
  CANCELLED: "canceled",
  PENDING: "pending",
  FAILED: "error",
  REFUNDED: "captured",
};

class NodaPaymentProviderService extends AbstractPaymentProvider<NodaOptions> {
  private client: NodaClient;

  constructor(
    _container: Record<string, unknown>,
    options: NodaOptions
  ) {
    // @ts-ignore - AbstractPaymentProvider constructor signature
    super(_container, options);

    this.client = new NodaClient(options.baseUrl, options.apiKey);
  }

  async initiatePayment(
    input: InitiatePaymentInput
  ): Promise<InitiatePaymentOutput> {
    const {
      amount,
      currency_code,
      context,
    } = input;

    const response = await this.client.createPayment({
      amount: new BigNumber(amount).numeric as number,
      currency: currency_code.toUpperCase(),
      email: context.customer?.email,
    });

    return {
      id: response.id,
      data: response as unknown as Record<string, unknown>,
    };
  }

  async getPaymentStatus(
    input: GetPaymentStatusInput
  ): Promise<GetPaymentStatusOutput> {
    const externalId = input.data?.id as string | undefined;

    if (!externalId) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Payment ID is required to get payment status"
      );
    }

    const payment = await this.client.getPayment(externalId);

    const status = NODA_STATUS_TO_MEDUSA[payment.status] || "pending";

    return { status };
  }

  async retrievePayment(
    input: RetrievePaymentInput
  ): Promise<RetrievePaymentOutput> {
    const externalId = input.data?.id as string | undefined;

    if (!externalId) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Payment ID is required to retrieve payment"
      );
    }

    const payment = await this.client.getPayment(externalId);

    return payment as unknown as RetrievePaymentOutput;
  }

  async capturePayment(
    input: CapturePaymentInput
  ): Promise<CapturePaymentOutput> {
    const externalId = input.data?.id as string | undefined;

    if (!externalId) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Payment ID is required to capture payment"
      );
    }

    const response = await this.client.capturePayment(externalId);

    return {
      data: {
        ...response,
        id: externalId,
      } as unknown as Record<string, unknown>,
    };
  }

  async cancelPayment(
    input: CancelPaymentInput
  ): Promise<CancelPaymentOutput> {
    const externalId = input.data?.id as string | undefined;

    if (!externalId) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Payment ID is required to cancel payment"
      );
    }

    const response = await this.client.cancelPayment(externalId);

    return { data: response as unknown as Record<string, unknown> };
  }

  async refundPayment(
    input: RefundPaymentInput
  ): Promise<RefundPaymentOutput> {
    const externalId = input.data?.id as string | undefined;

    if (!externalId) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Payment ID is required to refund payment"
      );
    }

    const response = await this.client.refundPayment(
      externalId,
      new BigNumber(input.amount).numeric as number
    );

    return {
      data: {
        ...input.data,
        ...response,
      } as unknown as Record<string, unknown>,
    };
  }

  async updatePayment(
    input: UpdatePaymentInput
  ): Promise<UpdatePaymentOutput> {
    // For redirect-based flow, no-op since amount/currency can't be updated
    // after payment initiation with Noda
    return { data: input.data };
  }

  async authorizePayment(
    input: AuthorizePaymentInput
  ): Promise<AuthorizePaymentOutput> {
    // For redirect-based flow, authorization happens when user returns from Noda
    // Return the payment data as authorized
    return {
      data: input.data,
      status: "authorized",
    };
  }

  async deletePayment(
    input: DeletePaymentInput
  ): Promise<DeletePaymentOutput> {
    // No-op for Noda since it's redirect-based with no stored card data
    // Attempt to cancel the payment session if it exists
    const externalId = input.data?.id as string | undefined;

    if (externalId) {
      try {
        await this.client.cancelPayment(externalId);
      } catch {
        // Ignore errors during deletion since payment may not exist yet
      }
    }

    return { data: input.data };
  }

  async getWebhookActionAndData(
    payload: ProviderWebhookPayload["payload"]
  ): Promise<WebhookActionResult> {
    const { data } = payload;

    // TODO: Implement webhook signature verification using webhookSecret
    // const isValid = this.verifyWebhookSignature(payload);

    const eventType = (data as Record<string, unknown>).event_type as string | undefined;

    if (!eventType) {
      return {
        action: "not_supported",
        data: {
          session_id: "",
          amount: new BigNumber(0),
        },
      };
    }

    const sessionId = (data as Record<string, unknown>).id as string | undefined;
    const amountValue = (data as Record<string, unknown>).amount as number | undefined;

    switch (eventType) {
      case "AUTHORIZED":
        return {
          action: "authorized",
          data: {
            session_id: sessionId || "",
            amount: new BigNumber(amountValue || 0),
          },
        };
      case "CAPTURED":
        return {
          action: "captured",
          data: {
            session_id: sessionId || "",
            amount: new BigNumber(amountValue || 0),
          },
        };
      case "FAILED":
        return {
          action: "failed",
          data: {
            session_id: sessionId || "",
            amount: new BigNumber(amountValue || 0),
          },
        };
      case "CANCELLED":
        return {
          action: "canceled",
          data: {
            session_id: sessionId || "",
            amount: new BigNumber(amountValue || 0),
          },
        };
      default:
        return {
          action: "not_supported",
          data: {
            session_id: "",
            amount: new BigNumber(0),
          },
        };
    }
  }
}

export { NodaPaymentProviderService };
