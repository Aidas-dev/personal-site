import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { createElement } from 'react';
import { CheckoutProvider } from '@/context/checkoutContext';
import { CartProvider } from '@/context/cartContext';
import { CheckoutPage } from '@/components/checkout/CheckoutPage';
import { CartService } from '@/services/cartService';

// Mock StripeCardElement to provide a simple success button
vi.mock('@/components/checkout/StripeCardElement', () => ({
  StripeCardElement: ({
    onSuccess,
  }: {
    cartId: string;
    onSuccess: (id: string) => void;
    onError: (error: string) => void;
  }) => (
    <div data-testid="stripe-card-element">
      <button onClick={() => onSuccess('pi_mock_123')}>Simulate Success</button>
    </div>
  ),
}));

// Mock BankRedirect
vi.mock('@/components/checkout/BankRedirect', () => ({
  BankRedirect: ({
    onConfirm,
  }: {
    bankId: string;
    onConfirm: () => void;
    onCancel: () => void;
  }) => (
    <div data-testid="bank-redirect">
      <button onClick={onConfirm}>Confirm Bank Payment</button>
    </div>
  ),
  getBankName: (id: string) =>
    ({ swedbank: 'Swedbank', seb: 'SEB', luminor: 'Luminor' }[id] ?? id),
}));

function wrapper({ children }: { children: React.ReactNode }) {
  return createElement(
    CartProvider,
    null,
    createElement(CheckoutPage, null, children),
  );
}

function wrapperWithCheckout({ children }: { children: React.ReactNode }) {
  return createElement(
    CartProvider,
    null,
    createElement(CheckoutProvider, null, children),
  );
}

describe('CheckoutPage', () => {
  beforeEach(() => {
    CartService.__resetMock();
    try {
      localStorage.clear();
    } catch {
      // Ignore
    }
  });

  it('should render the step indicator', async () => {
    render(<CheckoutPage />, { wrapper: wrapperWithCheckout });

    // Step indicator should show step labels
    expect(screen.getAllByText('Address').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Shipping').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Payment').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Review').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Confirm').length).toBeGreaterThan(0);
  });

  it('should render the AddressStep initially', () => {
    render(<CheckoutPage />, { wrapper: wrapperWithCheckout });

    expect(screen.getByText('Shipping Address')).toBeInTheDocument();
  });

  it('should navigate through steps', async () => {
    render(<CheckoutPage />, { wrapper: wrapperWithCheckout });

    // Step 0: Address - fill in form
    fireEvent.change(screen.getByLabelText(/First name/i), {
      target: { value: 'John' },
    });
    fireEvent.change(screen.getByLabelText(/Last name/i), {
      target: { value: 'Doe' },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'john@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^Address$/i), {
      target: { value: '123 Main St' },
    });
    fireEvent.change(screen.getByLabelText(/City/i), {
      target: { value: 'Vilnius' },
    });
    fireEvent.change(screen.getByLabelText(/Postal code/i), {
      target: { value: '01101' },
    });

    // Submit address form
    fireEvent.click(screen.getByText('Continue to Shipping'));

    // Should now show shipping step
    await waitFor(() => {
      expect(screen.getByText('Shipping Method')).toBeInTheDocument();
    });

    // Select shipping
    fireEvent.click(screen.getByLabelText(/Standard Shipping/i));
    fireEvent.click(screen.getByText('Continue to Payment'));

    // Should now show payment step
    await waitFor(() => {
      expect(screen.getByText('Payment Method')).toBeInTheDocument();
    });

    // Select payment and confirm payment
    fireEvent.click(screen.getByLabelText(/Credit\/Debit Card/i));

    // Wait for StripeCardElement mock to appear and confirm payment
    await waitFor(() => {
      expect(screen.getByTestId('stripe-card-element')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Simulate Success'));

    // Now continue to review should work
    fireEvent.click(screen.getByText('Continue to Review'));

    // Should now show review step
    await waitFor(() => {
      expect(screen.getByText('Review Your Order')).toBeInTheDocument();
    });
  });

  it('should show back navigation on steps after address', async () => {
    render(<CheckoutPage />, { wrapper: wrapperWithCheckout });

    // Navigate to shipping step first
    fireEvent.change(screen.getByLabelText(/First name/i), {
      target: { value: 'John' },
    });
    fireEvent.change(screen.getByLabelText(/Last name/i), {
      target: { value: 'Doe' },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'john@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^Address$/i), {
      target: { value: '123 Main St' },
    });
    fireEvent.change(screen.getByLabelText(/City/i), {
      target: { value: 'Vilnius' },
    });
    fireEvent.change(screen.getByLabelText(/Postal code/i), {
      target: { value: '01101' },
    });
    fireEvent.click(screen.getByText('Continue to Shipping'));

    await waitFor(() => {
      expect(screen.getByText('Back')).toBeInTheDocument();
    });
  });
});
