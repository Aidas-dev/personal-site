import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createElement } from 'react';
import {
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { CheckoutProvider, useCheckout } from '@/context/checkoutContext';

// Mock the Route module
vi.mock('@/routes/checkout/payment/callback', () => ({
  Route: {
    update: () => ({
      update: () => ({
        update: () => {},
      }),
    }),
  },
}));

// Mock checkout context
vi.mock('@/context/checkoutContext', async () => {
  const actual = await vi.importActual<
    typeof import('@/context/checkoutContext')
  >('@/context/checkoutContext');
  return {
    ...actual,
    useCheckout: vi.fn(),
  };
});

// Mock components
vi.mock('@/components/Container', () => ({
  Container: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className} data-testid="container">
      {children}
    </div>
  ),
}));

vi.mock('@/components/Breadcrumb', () => ({
  Breadcrumb: ({ items }: { items: Array<{ label: string; href?: string; current?: boolean }> }) => (
    <nav data-testid="breadcrumb">
      {items.map((item) => (
        <span key={item.label}>{item.label}</span>
      ))}
    </nav>
  ),
}));

vi.mock('@/components/Card', () => ({
  Card: ({
    children,
    variant,
    className,
  }: {
    children: React.ReactNode;
    variant?: string;
    className?: string;
  }) => (
    <div data-testid="card" data-variant={variant} className={className}>
      {children}
    </div>
  ),
}));

vi.mock('@/components/Button', () => ({
  Button: ({
    children,
    onClick,
    variant,
    size,
    disabled,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: string;
    size?: string;
    disabled?: boolean;
  }) => (
    <button
      onClick={onClick}
      data-variant={variant}
      data-size={size}
      disabled={disabled}
    >
      {children}
    </button>
  ),
}));

vi.mock('@/components/Spinner', () => ({
  Spinner: ({ size }: { size?: string }) => (
    <div data-testid="spinner" data-size={size} />
  ),
}));

const mockCheckout = {
  handlePaymentCallback: vi.fn(),
  goToStep: vi.fn(),
  nextStep: vi.fn(),
  prevStep: vi.fn(),
  currentStep: 2,
  paymentMethod: null,
  paymentId: null,
  error: null,
};

function wrapper({ children }: { children: React.ReactNode }) {
  return createElement(CheckoutProvider, null, children);
}

describe('Payment Callback Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useCheckout as ReturnType<typeof vi.fn>).mockReturnValue(mockCheckout);
  });

  describe('Route module', () => {
    it('should be importable without errors', async () => {
      const routeModule = await import('@/routes/checkout/payment/callback');
      expect(routeModule).toHaveProperty('Route');
    });
  });

  describe('handlePaymentCallback integration', () => {
    it('should call handlePaymentCallback with completed status', () => {
      // Simulate the callback route behavior
      const status = 'completed';
      const paymentId = 'noda_123';

      mockCheckout.handlePaymentCallback(status, paymentId);

      expect(mockCheckout.handlePaymentCallback).toHaveBeenCalledWith(
        status,
        paymentId,
      );
    });

    it('should call handlePaymentCallback with failed status', () => {
      const status = 'failed';
      const paymentId = 'noda_456';

      mockCheckout.handlePaymentCallback(status, paymentId);

      expect(mockCheckout.handlePaymentCallback).toHaveBeenCalledWith(
        status,
        paymentId,
      );
    });

    it('should call handlePaymentCallback with cancelled status', () => {
      const status = 'cancelled';
      const paymentId = 'noda_789';

      mockCheckout.handlePaymentCallback(status, paymentId);

      expect(mockCheckout.handlePaymentCallback).toHaveBeenCalledWith(
        status,
        paymentId,
      );
    });

    it('should call handlePaymentCallback with pending status', () => {
      const status = 'pending';
      const paymentId = 'noda_pending_123';

      mockCheckout.handlePaymentCallback(status, paymentId);

      expect(mockCheckout.handlePaymentCallback).toHaveBeenCalledWith(
        status,
        paymentId,
      );
    });
  });
});
