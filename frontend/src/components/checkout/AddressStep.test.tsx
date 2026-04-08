import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { createElement } from 'react';
import { CheckoutProvider, useCheckout as useCheckoutContext } from '@/context/checkoutContext';
import { AddressStep } from '@/components/checkout/AddressStep';

function wrapper({ children }: { children: React.ReactNode }) {
  return createElement(CheckoutProvider, null, children);
}

describe('AddressStep', () => {
  beforeEach(() => {
    // Clean state each test
  });

  it('should render the shipping address form', () => {
    render(<AddressStep />, { wrapper });

    expect(screen.getByText('Shipping Address')).toBeInTheDocument();
    expect(screen.getByLabelText(/First name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Address$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/City/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Postal code/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Country/i)).toBeInTheDocument();
  });

  it('should show the billing address checkbox', () => {
    render(<AddressStep />, { wrapper });

    expect(
      screen.getByLabelText(/Billing address same as shipping/i),
    ).toBeInTheDocument();
    expect(
      (screen.getByLabelText(/Billing address same as shipping/i) as HTMLInputElement)
        .checked,
    ).toBe(true);
  });

  it('should show billing form when checkbox is unchecked', () => {
    render(<AddressStep />, { wrapper });

    // Billing form should not be visible initially
    const headings = screen.queryAllByText('Billing Address');
    expect(headings.length).toBe(0);

    // Uncheck the checkbox
    const checkbox = screen.getByLabelText(
      /Billing address same as shipping/i,
    ) as HTMLInputElement;
    fireEvent.click(checkbox);

    // Now billing form should be visible
    expect(screen.getByText('Billing Address')).toBeInTheDocument();
  });

  it('should show validation errors when submitting empty form', () => {
    render(<AddressStep />, { wrapper });

    const submitButton = screen.getByText('Continue to Shipping');
    fireEvent.click(submitButton);

    // Required field errors should appear
    expect(screen.getAllByText(/is required/i).length).toBeGreaterThan(0);
  });

  it('should show error for invalid email', () => {
    render(<AddressStep />, { wrapper });

    const emailInput = screen.getByLabelText(/Email/i);
    fireEvent.change(emailInput, { target: { value: 'not-an-email' } });
    fireEvent.blur(emailInput);

    const submitButton = screen.getByText('Continue to Shipping');
    fireEvent.click(submitButton);

    expect(screen.getByText(/valid email/i)).toBeInTheDocument();
  });

  it('should advance to next step when form is valid', () => {
    // Render a component that shows the current step
    const StepDisplay = () => {
      const ctx = useCheckoutContext();
      return <div data-testid="step">{ctx.currentStep}</div>;
    };

    render(
      <>
        <AddressStep />
        <StepDisplay />
      </>,
      { wrapper },
    );

    // Fill in required fields
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

    const submitButton = screen.getByText('Continue to Shipping');
    fireEvent.click(submitButton);

    // Should have advanced to step 1
    expect(screen.getByTestId('step').textContent).toBe('1');
  });

  it('should have default country value of LT', () => {
    render(<AddressStep />, { wrapper });

    const countryInput = screen.getByLabelText(/Country/i) as HTMLInputElement;
    expect(countryInput.value).toBe('LT');
  });
});
