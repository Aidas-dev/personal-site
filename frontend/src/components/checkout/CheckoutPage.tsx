import { useMemo } from 'react';
import { useCheckout, type CheckoutStep } from '@/context/checkoutContext';
import { StepIndicator } from './StepIndicator';
import { AddressStep } from './AddressStep';
import { ShippingStep } from './ShippingStep';
import { PaymentStep } from './PaymentStep';
import { ReviewStep } from './ReviewStep';
import { ConfirmationStep } from './ConfirmationStep';

export function CheckoutPage() {
  const { currentStep, order } = useCheckout();

  const completedSteps = useMemo(() => {
    const steps: boolean[] = [false, false, false, false, false];
    for (let i = 0; i < currentStep; i++) {
      steps[i] = true;
    }
    // If we're on confirmation (step 4), all previous are completed
    if (order) {
      steps[0] = true;
      steps[1] = true;
      steps[2] = true;
      steps[3] = true;
    }
    return steps;
  }, [currentStep, order]);

  const renderStep = (step: CheckoutStep) => {
    switch (step) {
      case 0:
        return <AddressStep />;
      case 1:
        return <ShippingStep />;
      case 2:
        return <PaymentStep />;
      case 3:
        return <ReviewStep />;
      case 4:
        return <ConfirmationStep />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <StepIndicator currentStep={currentStep} completedSteps={completedSteps} />
      <div className="mt-8">{renderStep(currentStep)}</div>
    </div>
  );
}
