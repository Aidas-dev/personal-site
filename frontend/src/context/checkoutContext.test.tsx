import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { createElement } from 'react';
import {
  CheckoutProvider,
  useCheckout,
  type AddressFormData,
} from './checkoutContext';
import type { ShippingMethod, Order } from '@/types';

function wrapper({ children }: { children: React.ReactNode }) {
  return createElement(CheckoutProvider, null, children);
}

function createTestAddress(): AddressFormData {
  return {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+37060000000',
    address1: '123 Main St',
    address2: '',
    city: 'Vilnius',
    postalCode: '01101',
    country: 'LT',
  };
}

describe('Checkout Context', () => {
  beforeEach(() => {
    // Reset is handled by re-creating the wrapper each time
  });

  describe('initial state', () => {
    it('should start at step 0', () => {
      const { result } = renderHook(() => useCheckout(), { wrapper });
      expect(result.current.currentStep).toBe(0);
    });

    it('should have null addresses initially', () => {
      const { result } = renderHook(() => useCheckout(), { wrapper });
      expect(result.current.shippingAddress).toBeNull();
      expect(result.current.billingAddress).toBeNull();
    });

    it('should have null shipping and payment methods initially', () => {
      const { result } = renderHook(() => useCheckout(), { wrapper });
      expect(result.current.shippingMethod).toBeNull();
      expect(result.current.paymentMethod).toBeNull();
    });

    it('should have no order and no error initially', () => {
      const { result } = renderHook(() => useCheckout(), { wrapper });
      expect(result.current.order).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('should default sameAsShipping to true', () => {
      const { result } = renderHook(() => useCheckout(), { wrapper });
      expect(result.current.sameAsShipping).toBe(true);
    });
  });

  describe('step navigation', () => {
    it('should advance to next step', () => {
      const { result } = renderHook(() => useCheckout(), { wrapper });

      act(() => {
        result.current.nextStep();
      });

      expect(result.current.currentStep).toBe(1);
    });

    it('should go back to previous step', () => {
      const { result } = renderHook(() => useCheckout(), { wrapper });

      act(() => {
        result.current.nextStep();
        result.current.nextStep();
      });

      expect(result.current.currentStep).toBe(2);

      act(() => {
        result.current.prevStep();
      });

      expect(result.current.currentStep).toBe(1);
    });

    it('should not exceed step 4', () => {
      const { result } = renderHook(() => useCheckout(), { wrapper });

      act(() => {
        for (let i = 0; i < 10; i++) {
          result.current.nextStep();
        }
      });

      expect(result.current.currentStep).toBe(4);
    });

    it('should not go below step 0', () => {
      const { result } = renderHook(() => useCheckout(), { wrapper });

      act(() => {
        for (let i = 0; i < 10; i++) {
          result.current.prevStep();
        }
      });

      expect(result.current.currentStep).toBe(0);
    });

    it('should jump to a specific step', () => {
      const { result } = renderHook(() => useCheckout(), { wrapper });

      act(() => {
        result.current.goToStep(3);
      });

      expect(result.current.currentStep).toBe(3);
    });
  });

  describe('address management', () => {
    it('should set shipping address', () => {
      const { result } = renderHook(() => useCheckout(), { wrapper });
      const address = createTestAddress();

      act(() => {
        result.current.setShippingAddress(address);
      });

      expect(result.current.shippingAddress).toEqual(address);
    });

    it('should set billing address', () => {
      const { result } = renderHook(() => useCheckout(), { wrapper });
      const address = createTestAddress();

      act(() => {
        result.current.setBillingAddress(address);
      });

      expect(result.current.billingAddress).toEqual(address);
    });

    it('should toggle sameAsShipping', () => {
      const { result } = renderHook(() => useCheckout(), { wrapper });

      expect(result.current.sameAsShipping).toBe(true);

      act(() => {
        result.current.setSameAsShipping(false);
      });

      expect(result.current.sameAsShipping).toBe(false);
    });
  });

  describe('shipping method', () => {
    it('should set shipping method', () => {
      const { result } = renderHook(() => useCheckout(), { wrapper });
      const method: ShippingMethod = {
        id: 'standard',
        name: 'Standard Shipping',
        price: 4.99,
      };

      act(() => {
        result.current.setShippingMethod(method);
      });

      expect(result.current.shippingMethod).toEqual(method);
    });
  });

  describe('payment method', () => {
    it('should set payment method', () => {
      const { result } = renderHook(() => useCheckout(), { wrapper });

      act(() => {
        result.current.setPaymentMethod('stripe_card');
      });

      expect(result.current.paymentMethod).toBe('stripe_card');
    });
  });

  describe('payment ID', () => {
    it('should set payment ID', () => {
      const { result } = renderHook(() => useCheckout(), { wrapper });

      act(() => {
        result.current.setPaymentId('noda_mock_123');
      });

      expect(result.current.paymentId).toBe('noda_mock_123');
    });

    it('should have null payment ID initially', () => {
      const { result } = renderHook(() => useCheckout(), { wrapper });
      expect(result.current.paymentId).toBeNull();
    });
  });

  describe('handlePaymentCallback', () => {
    it('should set payment method to noda and advance step on completed status', () => {
      const { result } = renderHook(() => useCheckout(), { wrapper });

      // Move to payment step (step 2)
      act(() => {
        result.current.nextStep(); // 0 -> 1
        result.current.nextStep(); // 1 -> 2
      });
      expect(result.current.currentStep).toBe(2);

      act(() => {
        result.current.handlePaymentCallback('completed', 'noda_123');
      });

      expect(result.current.paymentMethod).toBe('noda');
      expect(result.current.paymentId).toBe('noda_123');
      expect(result.current.error).toBeNull();
      expect(result.current.currentStep).toBe(3); // advanced to Review
    });

    it('should set payment method to noda and advance step on authorized status', () => {
      const { result } = renderHook(() => useCheckout(), { wrapper });

      act(() => {
        result.current.nextStep();
        result.current.nextStep();
      });
      expect(result.current.currentStep).toBe(2);

      act(() => {
        result.current.handlePaymentCallback('authorized', 'noda_456');
      });

      expect(result.current.paymentMethod).toBe('noda');
      expect(result.current.paymentId).toBe('noda_456');
      expect(result.current.currentStep).toBe(3);
    });

    it('should set error message on failed status', () => {
      const { result } = renderHook(() => useCheckout(), { wrapper });

      act(() => {
        result.current.handlePaymentCallback('failed', 'noda_fail');
      });

      expect(result.current.paymentId).toBe('noda_fail');
      expect(result.current.error).toBe('Payment was failed. Please try again.');
    });

    it('should set error message on cancelled status', () => {
      const { result } = renderHook(() => useCheckout(), { wrapper });

      act(() => {
        result.current.handlePaymentCallback('cancelled', 'noda_cancel');
      });

      expect(result.current.paymentId).toBe('noda_cancel');
      expect(result.current.error).toBe('Payment was cancelled. Please try again.');
    });

    it('should clear error and set payment ID on pending status', () => {
      const { result } = renderHook(() => useCheckout(), { wrapper });

      // First set an error
      act(() => {
        result.current.setError('Some error');
      });
      expect(result.current.error).toBe('Some error');

      act(() => {
        result.current.handlePaymentCallback('pending', 'noda_pending');
      });

      expect(result.current.paymentId).toBe('noda_pending');
      expect(result.current.error).toBeNull();
    });

    it('should handle case-insensitive status', () => {
      const { result } = renderHook(() => useCheckout(), { wrapper });

      act(() => {
        result.current.handlePaymentCallback('COMPLETED', 'noda_upper');
      });

      expect(result.current.paymentMethod).toBe('noda');
      expect(result.current.paymentId).toBe('noda_upper');
    });

    it('should not advance step beyond max on completed status at step 4', () => {
      const { result } = renderHook(() => useCheckout(), { wrapper });

      act(() => {
        for (let i = 0; i < 10; i++) {
          result.current.nextStep();
        }
      });
      expect(result.current.currentStep).toBe(4);

      act(() => {
        result.current.handlePaymentCallback('completed', 'noda_max');
      });

      expect(result.current.currentStep).toBe(4); // Should not exceed 4
      expect(result.current.paymentMethod).toBe('noda');
    });
  });

  describe('order management', () => {
    it('should set order', () => {
      const { result } = renderHook(() => useCheckout(), { wrapper });
      const order: Order = {
        id: 'order-1',
        displayId: 1234,
        email: 'test@example.com',
        items: [],
        shippingAddress: createTestAddress() as unknown as import('@/types').Address,
        billingAddress: createTestAddress() as unknown as import('@/types').Address,
        shippingMethods: [],
        paymentMethod: 'stripe_card',
        subtotal: 100,
        taxTotal: 21,
        shippingTotal: 4.99,
        total: 125.99,
        status: 'completed',
        createdAt: '2025-01-01T00:00:00Z',
      };

      act(() => {
        result.current.setOrder(order);
      });

      expect(result.current.order).toEqual(order);
      expect(result.current.order?.displayId).toBe(1234);
    });
  });

  describe('error management', () => {
    it('should set error message', () => {
      const { result } = renderHook(() => useCheckout(), { wrapper });

      act(() => {
        result.current.setError('Something went wrong');
      });

      expect(result.current.error).toBe('Something went wrong');
    });

    it('should clear error', () => {
      const { result } = renderHook(() => useCheckout(), { wrapper });

      act(() => {
        result.current.setError('Something went wrong');
      });

      act(() => {
        result.current.setError(null);
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('reset', () => {
    it('should reset all state to initial values', () => {
      const { result } = renderHook(() => useCheckout(), { wrapper });

      // Set various state
      act(() => {
        result.current.nextStep();
        result.current.nextStep();
        result.current.setShippingAddress(createTestAddress());
        result.current.setPaymentMethod('stripe_card');
        result.current.setPaymentId('noda_123');
        result.current.setError('error');
      });

      expect(result.current.currentStep).toBe(2);
      expect(result.current.shippingAddress).not.toBeNull();
      expect(result.current.paymentMethod).toBe('stripe_card');
      expect(result.current.paymentId).toBe('noda_123');
      expect(result.current.error).toBe('error');

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.currentStep).toBe(0);
      expect(result.current.shippingAddress).toBeNull();
      expect(result.current.paymentMethod).toBeNull();
      expect(result.current.paymentId).toBeNull();
      expect(result.current.error).toBeNull();
    });
  });
});
