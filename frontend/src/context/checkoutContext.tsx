import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { Address, Order, ShippingMethod } from '@/types';

// ============================================================================
// Types
// ============================================================================

export type CheckoutStep = 0 | 1 | 2 | 3 | 4;

export const STEP_LABELS = [
  'Address',
  'Shipping',
  'Payment',
  'Review',
  'Confirm',
] as const;

export interface AddressFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface CheckoutState {
  currentStep: CheckoutStep;
  shippingAddress: AddressFormData | null;
  billingAddress: AddressFormData | null;
  sameAsShipping: boolean;
  shippingMethod: ShippingMethod | null;
  paymentMethod: string | null;
  paymentId: string | null;
  order: Order | null;
  error: string | null;
  isCompleting: boolean;
}

export interface CheckoutContextValue extends CheckoutState {
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: CheckoutStep) => void;
  setShippingAddress: (data: AddressFormData) => void;
  setBillingAddress: (data: AddressFormData) => void;
  setSameAsShipping: (same: boolean) => void;
  setShippingMethod: (method: ShippingMethod) => void;
  setPaymentMethod: (method: string) => void;
  setPaymentId: (id: string) => void;
  handlePaymentCallback: (status: string, paymentId: string) => void;
  setOrder: (order: Order) => void;
  setError: (msg: string | null) => void;
  setIsCompleting: (completing: boolean) => void;
  reset: () => void;
}

// ============================================================================
// Context
// ============================================================================

const CheckoutContext = createContext<CheckoutContextValue | null>(null);

const initialState: CheckoutState = {
  currentStep: 0,
  shippingAddress: null,
  billingAddress: null,
  sameAsShipping: true,
  shippingMethod: null,
  paymentMethod: null,
  paymentId: null,
  order: null,
  error: null,
  isCompleting: false,
};

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CheckoutState>(initialState);

  const nextStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, 4) as CheckoutStep,
    }));
  }, []);

  const prevStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 0) as CheckoutStep,
    }));
  }, []);

  const goToStep = useCallback((step: CheckoutStep) => {
    setState((prev) => ({
      ...prev,
      currentStep: step,
    }));
  }, []);

  const setShippingAddress = useCallback((data: AddressFormData) => {
    setState((prev) => ({
      ...prev,
      shippingAddress: data,
    }));
  }, []);

  const setBillingAddress = useCallback((data: AddressFormData) => {
    setState((prev) => ({
      ...prev,
      billingAddress: data,
    }));
  }, []);

  const setSameAsShipping = useCallback((same: boolean) => {
    setState((prev) => ({
      ...prev,
      sameAsShipping: same,
    }));
  }, []);

  const setShippingMethod = useCallback((method: ShippingMethod) => {
    setState((prev) => ({
      ...prev,
      shippingMethod: method,
    }));
  }, []);

  const setPaymentMethod = useCallback((method: string) => {
    setState((prev) => ({
      ...prev,
      paymentMethod: method,
    }));
  }, []);

  const setPaymentId = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      paymentId: id,
    }));
  }, []);

  /**
   * Handle the Noda payment callback result.
   * - 'completed'/'authorized': set payment method and advance to Review step
   * - 'failed'/'cancelled': set error message (user can retry by going back)
   * - 'pending': set payment ID and show pending message
   */
  const handlePaymentCallback = useCallback(
    (status: string, paymentId: string) => {
      const normalizedStatus = status.toLowerCase();

      if (normalizedStatus === 'completed' || normalizedStatus === 'authorized') {
        setState((prev) => ({
          ...prev,
          paymentMethod: 'noda',
          paymentId,
          error: null,
          currentStep: Math.min(prev.currentStep + 1, 4) as CheckoutStep,
        }));
      } else if (
        normalizedStatus === 'failed' ||
        normalizedStatus === 'cancelled'
      ) {
        setState((prev) => ({
          ...prev,
          paymentId,
          error: `Payment was ${normalizedStatus}. Please try again.`,
        }));
      } else {
        // pending or unknown status
        setState((prev) => ({
          ...prev,
          paymentId,
          error: null,
        }));
      }
    },
    [],
  );

  const setOrder = useCallback((order: Order) => {
    setState((prev) => ({
      ...prev,
      order,
    }));
  }, []);

  const setError = useCallback((msg: string | null) => {
    setState((prev) => ({
      ...prev,
      error: msg,
    }));
  }, []);

  const setIsCompleting = useCallback((completing: boolean) => {
    setState((prev) => ({
      ...prev,
      isCompleting: completing,
    }));
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return (
    <CheckoutContext.Provider
      value={{
        ...state,
        nextStep,
        prevStep,
        goToStep,
        setShippingAddress,
        setBillingAddress,
        setSameAsShipping,
        setShippingMethod,
        setPaymentMethod,
        setPaymentId,
        handlePaymentCallback,
        setOrder,
        setError,
        setIsCompleting,
        reset,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout(): CheckoutContextValue {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error(
      'useCheckout must be used within a CheckoutProvider',
    );
  }
  return context;
}
