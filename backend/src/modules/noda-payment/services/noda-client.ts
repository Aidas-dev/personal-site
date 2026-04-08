interface NodaPaymentResponse {
  id: string;
  status: string;
  redirectUrl?: string;
  amount?: number;
  currency?: string;
}

interface CreatePaymentInput {
  amount: number;
  currency: string;
  email?: string;
}

export class NodaClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.apiKey = apiKey;
  }

  async createPayment(input: CreatePaymentInput): Promise<NodaPaymentResponse> {
    const response = await fetch(`${this.baseUrl}/payments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Noda API error: ${response.status} - ${errorText}`);
    }

    return response.json() as Promise<NodaPaymentResponse>;
  }

  async getPayment(paymentId: string): Promise<NodaPaymentResponse> {
    const response = await fetch(`${this.baseUrl}/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Noda API error: ${response.status} - ${errorText}`);
    }

    return response.json() as Promise<NodaPaymentResponse>;
  }

  async capturePayment(paymentId: string): Promise<NodaPaymentResponse> {
    const response = await fetch(`${this.baseUrl}/payments/${paymentId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Noda API error: ${response.status} - ${errorText}`);
    }

    return response.json() as Promise<NodaPaymentResponse>;
  }

  async cancelPayment(paymentId: string): Promise<NodaPaymentResponse> {
    const response = await fetch(`${this.baseUrl}/payments/${paymentId}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Noda API error: ${response.status} - ${errorText}`);
    }

    return response.json() as Promise<NodaPaymentResponse>;
  }

  async refundPayment(paymentId: string, amount: number): Promise<NodaPaymentResponse> {
    const response = await fetch(`${this.baseUrl}/payments/${paymentId}/refund`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Noda API error: ${response.status} - ${errorText}`);
    }

    return response.json() as Promise<NodaPaymentResponse>;
  }
}
