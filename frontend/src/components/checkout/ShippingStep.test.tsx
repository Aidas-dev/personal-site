import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { createElement } from 'react';
import { CheckoutProvider, useCheckout as useCheckoutContext } from '@/context/checkoutContext';
import { ShippingStep } from '@/components/checkout/ShippingStep';

function wrapper({ children }: { children: React.ReactNode }) {
  return createElement(CheckoutProvider, null, children);
}

describe('ShippingStep', () => {
  it('should render all shipping options', () => {
    render(<ShippingStep />, { wrapper });

    expect(screen.getByText('Shipping Method')).toBeInTheDocument();
    expect(screen.getByLabelText(/Standard Shipping/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Express Shipping/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Free Pickup/i)).toBeInTheDocument();
  });

  it('should show prices for each option', () => {
    render(<ShippingStep />, { wrapper });

    expect(screen.getByText('€4.99')).toBeInTheDocument();
    expect(screen.getByText('€9.99')).toBeInTheDocument();
    expect(screen.getByText('Free')).toBeInTheDocument();
  });

  it('should show delivery estimates', () => {
    render(<ShippingStep />, { wrapper });

    expect(screen.getByText('3-5 business days')).toBeInTheDocument();
    expect(screen.getByText('1-2 business days')).toBeInTheDocument();
    expect(screen.getByText('Same day')).toBeInTheDocument();
  });

  it('should allow selecting a shipping option', () => {
    render(<ShippingStep />, { wrapper });

    const expressRadio = screen.getByLabelText(
      /Express Shipping/i,
    ) as HTMLInputElement;
    fireEvent.click(expressRadio);

    expect(expressRadio.checked).toBe(true);
  });

  it('should show error when continuing without selection', () => {
    render(<ShippingStep />, { wrapper });

    const continueButton = screen.getByText('Continue to Payment');
    fireEvent.click(continueButton);

    expect(screen.getByText(/select a shipping method/i)).toBeInTheDocument();
  });

  it('should advance to next step when option is selected', () => {
    const StepDisplay = () => {
      const ctx = useCheckoutContext();
      return <div data-testid="step">{ctx.currentStep}</div>;
    };

    render(
      <>
        <ShippingStep />
        <StepDisplay />
      </>,
      { wrapper },
    );

    const standardRadio = screen.getByLabelText(
      /Standard Shipping/i,
    ) as HTMLInputElement;
    fireEvent.click(standardRadio);

    const continueButton = screen.getByText('Continue to Payment');
    fireEvent.click(continueButton);

    // Should have advanced to step 1 (from initial step 0)
    expect(screen.getByTestId('step').textContent).toBe('1');
  });

  it('should have a Back button', () => {
    render(<ShippingStep />, { wrapper });

    const backButton = screen.getByText('Back');
    expect(backButton).toBeInTheDocument();
  });
});
