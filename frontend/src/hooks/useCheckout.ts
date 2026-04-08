import { useCallback } from 'react';
import { useCheckout as useCheckoutContext, type AddressFormData, type CheckoutStep } from '@/context/checkoutContext';
import type { ShippingMethod } from '@/types';

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

function validateAddress(data: AddressFormData): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.firstName.trim()) {
    errors.firstName = 'First name is required';
  }
  if (!data.lastName.trim()) {
    errors.lastName = 'Last name is required';
  }
  if (!data.email.trim()) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Please enter a valid email';
  }
  if (!data.address1.trim()) {
    errors.address1 = 'Address is required';
  }
  if (!data.city.trim()) {
    errors.city = 'City is required';
  }
  if (!data.postalCode.trim()) {
    errors.postalCode = 'Postal code is required';
  }
  if (!data.country.trim()) {
    errors.country = 'Country is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * useCheckout — wraps checkout context with validation logic per step.
 */
export function useCheckout() {
  const ctx = useCheckoutContext();

  const validateStep = useCallback(
    (step: CheckoutStep): ValidationResult => {
      switch (step) {
        case 0: {
          // Address step
          if (!ctx.shippingAddress) {
            return { isValid: false, errors: { _form: 'Please fill in the shipping address' } };
          }
          const shippingValidation = validateAddress(ctx.shippingAddress);
          if (!shippingValidation.isValid) {
            return shippingValidation;
          }

          // If not same as shipping, validate billing too
          if (!ctx.sameAsShipping) {
            if (!ctx.billingAddress) {
              return { isValid: false, errors: { _form: 'Please fill in the billing address' } };
            }
            const billingValidation = validateAddress(ctx.billingAddress);
            if (!billingValidation.isValid) {
              return billingValidation;
            }
          }

          return { isValid: true, errors: {} };
        }

        case 1: {
          // Shipping step
          if (!ctx.shippingMethod) {
            return { isValid: false, errors: { _form: 'Please select a shipping method' } };
          }
          return { isValid: true, errors: {} };
        }

        case 2: {
          // Payment step
          if (!ctx.paymentMethod) {
            return { isValid: false, errors: { _form: 'Please select a payment method' } };
          }
          return { isValid: true, errors: {} };
        }

        case 3: {
          // Review step — no validation needed beyond terms checkbox (handled in component)
          return { isValid: true, errors: {} };
        }

        default:
          return { isValid: true, errors: {} };
      }
    },
    [ctx.shippingAddress, ctx.billingAddress, ctx.sameAsShipping, ctx.shippingMethod, ctx.paymentMethod],
  );

  const nextStep = useCallback(() => {
    const validation = validateStep(ctx.currentStep);
    if (!validation.isValid) {
      ctx.setError(validation.errors._form ?? 'Please fix the errors above');
      return false;
    }
    ctx.setError(null);
    ctx.nextStep();
    return true;
  }, [ctx, validateStep]);

  const goToStep = useCallback(
    (step: CheckoutStep) => {
      // Only allow going to steps that are before current or are validated
      if (step > ctx.currentStep) {
        // Validate all steps up to the target
        for (let i = 0; i < step; i++) {
          const validation = validateStep(i as CheckoutStep);
          if (!validation.isValid) {
            ctx.setError(`Complete step "${['Address', 'Shipping', 'Payment', 'Review', 'Confirm'][i]}" first`);
            return false;
          }
        }
      }
      ctx.setError(null);
      ctx.goToStep(step);
      return true;
    },
    [ctx, validateStep],
  );

  const setShippingAddress = useCallback(
    (data: AddressFormData) => {
      ctx.setShippingAddress(data);
      // If same as shipping is enabled, also set billing
      if (ctx.sameAsShipping) {
        ctx.setBillingAddress(data);
      }
    },
    [ctx],
  );

  const setShippingMethod = useCallback(
    (method: ShippingMethod) => {
      ctx.setShippingMethod(method);
      ctx.setError(null);
    },
    [ctx],
  );

  const setPaymentMethod = useCallback(
    (method: string) => {
      ctx.setPaymentMethod(method);
      ctx.setError(null);
    },
    [ctx],
  );

  return {
    ...ctx,
    validateStep,
    nextStep,
    goToStep,
    setShippingAddress,
    setShippingMethod,
    setPaymentMethod,
  };
}
