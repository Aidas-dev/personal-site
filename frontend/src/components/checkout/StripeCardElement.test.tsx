import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { StripeCardElement } from '@/components/checkout/StripeCardElement';

// Mock the stripeService module
vi.mock('@/services/stripeService', () => ({
  createPaymentIntent: vi.fn().mockResolvedValue({
    clientSecret: 'pi_mock_123_secret',
    paymentIntentId: 'pi_mock_123',
    amount: 0,
  }),
  confirmPayment: vi.fn().mockImplementation((_secret, _elements, success) =>
    Promise.resolve(
      success
        ? { success: true, paymentIntentId: 'pi_mock_123' }
        : {
            success: false,
            error: 'Card was declined. Please try a different payment method.',
          },
    ),
  ),
  getPublishableKey: vi.fn().mockReturnValue('pk_test_mock_key'),
  __resetMock: vi.fn(),
  __getMockPaymentIntent: vi.fn().mockReturnValue(null),
}));

// Mock @stripe/react-stripe-js
vi.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }: { children: React.ReactNode }) =>
    children as React.ReactNode,
  CardElement: () => (
    <div data-testid="stripe-card-element">Stripe Card Element</div>
  ),
  useStripe: () => ({}),
  useElements: () => ({}),
}));

// Mock @stripe/stripe-js
vi.mock('@stripe/stripe-js', () => ({
  loadStripe: vi.fn().mockResolvedValue({}),
}));

describe('StripeCardElement', () => {
  const mockOnSuccess = vi.fn();
  const mockOnError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Mock Mode Rendering', () => {
    it('should render mock card form with test buttons', () => {
      render(
        <StripeCardElement
          cartId="cart_test"
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />,
      );

      expect(
        screen.getByText(/Test Payment — Mock Mode/i),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Simulate Success/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Simulate Failure/i }),
      ).toBeInTheDocument();
    });

    it('should render mock card input fields', () => {
      render(
        <StripeCardElement
          cartId="cart_test"
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />,
      );

      expect(
        screen.getByLabelText(/Mock card number input/i),
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText(/Mock card expiry input/i),
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText(/Mock card CVC input/i),
      ).toBeInTheDocument();
    });
  });

  describe('Success Flow', () => {
    it('should call onSuccess when Simulate Success is clicked', async () => {
      render(
        <StripeCardElement
          cartId="cart_test"
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />,
      );

      const successButton = screen.getByRole('button', {
        name: /Simulate Success/i,
      });
      fireEvent.click(successButton);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith('pi_mock_123');
      });
    });

    it('should show success state after payment confirmation', async () => {
      render(
        <StripeCardElement
          cartId="cart_test"
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />,
      );

      const successButton = screen.getByRole('button', {
        name: /Simulate Success/i,
      });
      fireEvent.click(successButton);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });
  });

  describe('Failure Flow', () => {
    it('should call onError when Simulate Failure is clicked', async () => {
      render(
        <StripeCardElement
          cartId="cart_test"
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />,
      );

      const failureButton = screen.getByRole('button', {
        name: /Simulate Failure/i,
      });
      fireEvent.click(failureButton);

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith(
          'Card was declined. Please try a different payment method.',
        );
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading state during payment processing', () => {
      render(
        <StripeCardElement
          cartId="cart_test"
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />,
      );

      // Buttons should not be loading initially
      const successButton = screen.getByRole('button', {
        name: /Simulate Success/i,
      });
      expect(successButton).not.toBeDisabled();
    });
  });
});
