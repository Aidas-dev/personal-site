import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { createElement } from 'react';
import { CheckoutProvider } from '@/context/checkoutContext';
import { CartProvider } from '@/context/cartContext';
import { ReviewStep } from '@/components/checkout/ReviewStep';
import { CartService } from '@/services/cartService';

function wrapper({ children }: { children: React.ReactNode }) {
  return createElement(
    CartProvider,
    null,
    createElement(CheckoutProvider, null, children),
  );
}

function setupCheckoutState(renderFn: typeof render) {
  // We need to render within both providers and then set checkout state
  // Since we can't easily call context methods outside a component,
  // we'll test the component as-is with empty cart
  return renderFn(<ReviewStep />, { wrapper });
}

describe('ReviewStep', () => {
  beforeEach(() => {
    CartService.__resetMock();
    try {
      localStorage.clear();
    } catch {
      // Ignore
    }
  });

  it('should render the review heading', () => {
    render(<ReviewStep />, { wrapper });

    expect(screen.getByText('Review Your Order')).toBeInTheDocument();
  });

  it('should render the terms and conditions checkbox', () => {
    render(<ReviewStep />, { wrapper });

    expect(screen.getByLabelText(/terms and conditions/i)).toBeInTheDocument();
  });

  it('should show error when placing order without accepting terms', () => {
    render(<ReviewStep />, { wrapper });

    // The Place Order button should be disabled when terms aren't accepted
    const placeOrderButton = screen.getByRole('button', { name: /Place Order/i });
    expect(placeOrderButton).toBeDisabled();
  });

  it('should have Back button', () => {
    render(<ReviewStep />, { wrapper });

    expect(screen.getByText('Back')).toBeInTheDocument();
  });

  it('should show order total section', () => {
    render(<ReviewStep />, { wrapper });

    expect(screen.getByText('Order Total')).toBeInTheDocument();
    expect(screen.getByText('Subtotal')).toBeInTheDocument();
    expect(screen.getByText('Shipping')).toBeInTheDocument();
    expect(screen.getByText(/Tax \(21% VAT\)/i)).toBeInTheDocument();
  });

  it('should show shipping address section', () => {
    render(<ReviewStep />, { wrapper });

    expect(screen.getByText('Shipping Address')).toBeInTheDocument();
  });

  it('should show billing address section', () => {
    render(<ReviewStep />, { wrapper });

    expect(screen.getByText('Billing Address')).toBeInTheDocument();
  });

  it('should have Place Order button', () => {
    render(<ReviewStep />, { wrapper });

    expect(screen.getByText('Place Order')).toBeInTheDocument();
  });

  it('should show items count section', () => {
    render(<ReviewStep />, { wrapper });

    // The items heading shows count
    expect(screen.getByText('Items (0)')).toBeInTheDocument();
  });
});
