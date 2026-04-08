import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { createElement } from 'react';
import { CheckoutProvider, useCheckout as useCheckoutContext } from '@/context/checkoutContext';
import { PaymentStep } from '@/components/checkout/PaymentStep';

// Mock StripeCardElement
vi.mock('@/components/checkout/StripeCardElement', () => ({
  StripeCardElement: ({
    onSuccess,
  }: {
    cartId: string;
    onSuccess: (id: string) => void;
    onError: (error: string) => void;
  }) => (
    <div data-testid="stripe-card-element">
      <button
        onClick={() => onSuccess('pi_mock_123')}
        data-testid="mock-stripe-success-button"
      >
        Simulate Success
      </button>
      <button
        onClick={() =>
          (
            document.querySelector(
              '[data-testid="mock-stripe-error-button"]',
            ) as HTMLButtonElement
          )?.click()
        }
        data-testid="mock-stripe-failure-button"
      >
        Simulate Failure
      </button>
    </div>
  ),
}));

// Mock BankRedirect
vi.mock('@/components/checkout/BankRedirect', () => ({
  BankRedirect: ({
    bankId,
    onConfirm,
    onCancel,
    amount,
  }: {
    bankId: string;
    onConfirm: () => void;
    onCancel: () => void;
    amount?: number;
  }) => (
    <div data-testid="bank-redirect" data-bank={bankId} data-amount={amount}>
      <button onClick={onConfirm} data-testid="bank-confirm">
        Confirm Bank Payment
      </button>
      <button onClick={onCancel} data-testid="bank-cancel">
        Cancel Bank Payment
      </button>
    </div>
  ),
  getBankName: (id: string) =>
    ({ swedbank: 'Swedbank', seb: 'SEB', luminor: 'Luminor' }[id] ?? id),
}));

// Mock useCart
vi.mock('@/context/cartContext', () => ({
  useCart: () => ({ cart: { id: 'cart_test_123' }, total: 5000 }),
}));

function wrapper({ children }: { children: React.ReactNode }) {
  return createElement(CheckoutProvider, null, children);
}

describe('PaymentStep', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Payment Options', () => {
    it('should render all payment options', () => {
      render(<PaymentStep />, { wrapper });

      expect(screen.getByText('Payment Method')).toBeInTheDocument();
      expect(
        screen.getByLabelText(/Credit\/Debit Card/i),
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText(/Apple Pay \/ Google Pay/i),
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/Swedbank/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/SEB/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Luminor/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/B2B Invoice/i)).toBeInTheDocument();
    });

    it('should show descriptions for each option', () => {
      render(<PaymentStep />, { wrapper });

      expect(screen.getByText(/Visa, Mastercard/i)).toBeInTheDocument();
      expect(screen.getByText(/digital wallet/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Swedbank online banking/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/SEB online banking/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Luminor online banking/i),
      ).toBeInTheDocument();
      expect(screen.getByText(/business customers/i)).toBeInTheDocument();
    });

    it('should allow selecting a payment option', () => {
      render(<PaymentStep />, { wrapper });

      const cardRadio = screen.getByLabelText(
        /Credit\/Debit Card/i,
      ) as HTMLInputElement;
      fireEvent.click(cardRadio);

      expect(cardRadio.checked).toBe(true);
    });

    it('should show error when continuing without selection', () => {
      render(<PaymentStep />, { wrapper });

      const continueButton = screen.getByText('Continue to Review');
      fireEvent.click(continueButton);

      expect(
        screen.getByText(/select a payment method/i),
      ).toBeInTheDocument();
    });

    it('should advance to next step when non-expanded option is selected', () => {
      const StepDisplay = () => {
        const ctx = useCheckoutContext();
        return <div data-testid="step">{ctx.currentStep}</div>;
      };

      render(
        <>
          <PaymentStep />
          <StepDisplay />
        </>,
        { wrapper },
      );

      // Apple/Google Pay doesn't require expanded UI confirmation
      const applePayRadio = screen.getByLabelText(
        /Apple Pay \/ Google Pay/i,
      ) as HTMLInputElement;
      fireEvent.click(applePayRadio);

      const continueButton = screen.getByText('Continue to Review');
      fireEvent.click(continueButton);

      // Should have advanced to step 1 (from initial step 0)
      expect(screen.getByTestId('step').textContent).toBe('1');
    });

    it('should have a Back button', () => {
      render(<PaymentStep />, { wrapper });

      const backButton = screen.getByText('Back');
      expect(backButton).toBeInTheDocument();
    });
  });

  describe('Expanded Payment UI — Stripe Card', () => {
    it('should show StripeCardElement when Credit/Debit Card is selected', () => {
      render(<PaymentStep />, { wrapper });

      const cardRadio = screen.getByLabelText(
        /Credit\/Debit Card/i,
      ) as HTMLInputElement;
      fireEvent.click(cardRadio);

      expect(
        screen.getByTestId('stripe-card-element'),
      ).toBeInTheDocument();
    });
  });

  describe('Expanded Payment UI — Bank Redirect', () => {
    it('should show BankRedirect when Swedbank is selected', () => {
      render(<PaymentStep />, { wrapper });

      const swedbankRadio = screen.getByLabelText(
        /Swedbank/i,
      ) as HTMLInputElement;
      fireEvent.click(swedbankRadio);

      expect(screen.getByTestId('bank-redirect')).toBeInTheDocument();
      expect(
        screen.getByTestId('bank-redirect'),
      ).toHaveAttribute('data-bank', 'swedbank');
    });

    it('should show BankRedirect when SEB is selected', () => {
      render(<PaymentStep />, { wrapper });

      const sebRadio = screen.getByLabelText(/SEB/i) as HTMLInputElement;
      fireEvent.click(sebRadio);

      expect(screen.getByTestId('bank-redirect')).toBeInTheDocument();
      expect(
        screen.getByTestId('bank-redirect'),
      ).toHaveAttribute('data-bank', 'seb');
    });

    it('should pass cart total as amount to BankRedirect', () => {
      render(<PaymentStep />, { wrapper });

      const swedbankRadio = screen.getByLabelText(
        /Swedbank/i,
      ) as HTMLInputElement;
      fireEvent.click(swedbankRadio);

      expect(screen.getByTestId('bank-redirect')).toHaveAttribute(
        'data-amount',
        '5000',
      );
    });

    it('should require bank confirmation before continuing', () => {
      const StepDisplay = () => {
        const ctx = useCheckoutContext();
        return <div data-testid="step">{ctx.currentStep}</div>;
      };

      render(
        <>
          <PaymentStep />
          <StepDisplay />
        </>,
        { wrapper },
      );

      const swedbankRadio = screen.getByLabelText(
        /Swedbank/i,
      ) as HTMLInputElement;
      fireEvent.click(swedbankRadio);

      // The Continue button should be disabled until bank payment is confirmed
      const continueButton = screen.getByRole('button', {
        name: /Continue to Review/i,
      });
      expect(continueButton).toBeDisabled();
    });

    it('should allow continuing after bank confirmation', () => {
      const StepDisplay = () => {
        const ctx = useCheckoutContext();
        return <div data-testid="step">{ctx.currentStep}</div>;
      };

      render(
        <>
          <PaymentStep />
          <StepDisplay />
        </>,
        { wrapper },
      );

      const swedbankRadio = screen.getByLabelText(
        /Swedbank/i,
      ) as HTMLInputElement;
      fireEvent.click(swedbankRadio);

      // Confirm the bank payment
      const bankConfirmButton = screen.getByTestId('bank-confirm');
      fireEvent.click(bankConfirmButton);

      // Now continue should work
      const continueButton = screen.getByText('Continue to Review');
      fireEvent.click(continueButton);

      expect(screen.getByTestId('step').textContent).toBe('1');
    });

    it('should show error message when bank payment is cancelled', () => {
      render(<PaymentStep />, { wrapper });

      const swedbankRadio = screen.getByLabelText(
        /Swedbank/i,
      ) as HTMLInputElement;
      fireEvent.click(swedbankRadio);

      // Cancel the bank payment
      const bankCancelButton = screen.getByTestId('bank-cancel');
      fireEvent.click(bankCancelButton);

      expect(screen.getByText(/Payment cancelled by user/i)).toBeInTheDocument();
    });
  });

  describe('Expanded Payment UI — B2B Invoice', () => {
    it('should show invoice details panel when B2B Invoice is selected', () => {
      render(<PaymentStep />, { wrapper });

      const invoiceRadio = screen.getByLabelText(
        /B2B Invoice/i,
      ) as HTMLInputElement;
      fireEvent.click(invoiceRadio);

      expect(
        screen.getByText(/B2B Invoice Payment/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Invoice will be sent to your company email/i),
      ).toBeInTheDocument();
      expect(screen.getByText(/14 days from invoice date/i)).toBeInTheDocument();
    });

    it('should have a Continue button in the invoice panel', () => {
      render(<PaymentStep />, { wrapper });

      const invoiceRadio = screen.getByLabelText(
        /B2B Invoice/i,
      ) as HTMLInputElement;
      fireEvent.click(invoiceRadio);

      const continueInInvoice = screen.getByRole('button', {
        name: /^Continue$/i,
      });
      expect(continueInInvoice).toBeInTheDocument();
    });

    it('should allow continuing after confirming invoice payment', () => {
      const StepDisplay = () => {
        const ctx = useCheckoutContext();
        return <div data-testid="step">{ctx.currentStep}</div>;
      };

      render(
        <>
          <PaymentStep />
          <StepDisplay />
        </>,
        { wrapper },
      );

      const invoiceRadio = screen.getByLabelText(
        /B2B Invoice/i,
      ) as HTMLInputElement;
      fireEvent.click(invoiceRadio);

      // Click the Continue button inside the invoice panel
      const continueInInvoice = screen.getByRole('button', {
        name: /^Continue$/i,
      });
      fireEvent.click(continueInInvoice);

      // Now the main continue should work
      const mainContinueButton = screen.getByText('Continue to Review');
      fireEvent.click(mainContinueButton);

      expect(screen.getByTestId('step').textContent).toBe('1');
    });
  });

  describe('Payment Success Indicator', () => {
    it('should show success indicator after Stripe payment confirmed', () => {
      render(<PaymentStep />, { wrapper });

      const cardRadio = screen.getByLabelText(
        /Credit\/Debit Card/i,
      ) as HTMLInputElement;
      fireEvent.click(cardRadio);

      const successButton = screen.getByTestId('mock-stripe-success-button');
      fireEvent.click(successButton);

      expect(
        screen.getByText(/Payment confirmed successfully/i),
      ).toBeInTheDocument();
    });
  });
});
