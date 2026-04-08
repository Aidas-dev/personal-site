import { STEP_LABELS, type CheckoutStep } from '@/context/checkoutContext';

interface StepIndicatorProps {
  currentStep: CheckoutStep;
  completedSteps: boolean[];
}

export function StepIndicator({ currentStep, completedSteps }: StepIndicatorProps) {
  return (
    <nav aria-label="Checkout progress" className="w-full">
      {/* Desktop: full labels */}
      <ol className="hidden sm:flex items-center justify-between w-full" role="list">
        {STEP_LABELS.map((label, index) => {
          const step = index as CheckoutStep;
          const isCompleted = completedSteps[index] ?? false;
          const isCurrent = step === currentStep;
          const isUpcoming = step > currentStep;

          return (
            <li
              key={label}
              className="flex flex-col items-center flex-1 relative"
              aria-current={isCurrent ? 'step' : undefined}
            >
              {/* Connector line */}
              {index > 0 && (
                <div
                  className={`absolute top-4 -left-1/2 w-full h-0.5 ${
                    completedSteps[index - 1]
                      ? 'bg-primary-500'
                      : 'bg-neutral-200'
                  }`}
                  aria-hidden="true"
                />
              )}

              {/* Step circle */}
              <div
                className={`
                  relative z-10 flex items-center justify-center w-8 h-8 rounded-full
                  text-sm font-medium transition-colors
                  ${isCompleted
                    ? 'bg-primary-500 text-white'
                    : isCurrent
                      ? 'bg-white border-2 border-primary-500 text-primary-600'
                      : 'bg-neutral-100 border border-neutral-300 text-neutral-400'
                  }
                `}
              >
                {isCompleted ? (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>

              {/* Label */}
              <span
                className={`
                  mt-2 text-xs font-medium text-center
                  ${isCompleted
                    ? 'text-primary-600'
                    : isCurrent
                      ? 'text-neutral-900'
                      : 'text-neutral-400'
                  }
                `}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>

      {/* Mobile: dots only */}
      <ol className="sm:hidden flex items-center justify-center gap-3" role="list">
        {STEP_LABELS.map((label, index) => {
          const step = index as CheckoutStep;
          const isCompleted = completedSteps[index] ?? false;
          const isCurrent = step === currentStep;

          return (
            <li
              key={label}
              className="flex flex-col items-center gap-1"
              aria-current={isCurrent ? 'step' : undefined}
            >
              <div
                className={`
                  w-3 h-3 rounded-full transition-colors
                  ${isCompleted
                    ? 'bg-primary-500'
                    : isCurrent
                      ? 'bg-primary-500 ring-4 ring-primary-200'
                      : 'bg-neutral-300'
                  }
                `}
                aria-label={`Step ${index + 1}: ${label}${isCompleted ? ' (completed)' : isCurrent ? ' (current)' : ''}`}
              />
              <span className="text-[10px] text-neutral-500">
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
