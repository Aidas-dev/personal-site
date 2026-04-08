import { useState, useCallback } from 'react';
import { useCheckout as useCheckoutContext } from '@/context/checkoutContext';
import { useCheckout } from '@/hooks/useCheckout';
import { useCart } from '@/context/cartContext';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { StripeCardElement } from './StripeCardElement';
import { BankRedirect } from './BankRedirect';

interface PaymentOption {
  id: string;
  label: string;
  icon: string;
  description: string;
}

const PAYMENT_OPTIONS: PaymentOption[] = [
  {
    id: 'stripe_card',
    label: 'Credit/Debit Card',
    icon: '💳',
    description: 'Visa, Mastercard, and more via Stripe',
  },
  {
    id: 'apple_google_pay',
    label: 'Apple Pay / Google Pay',
    icon: '📱',
    description: 'Fast checkout with your digital wallet',
  },
  {
    id: 'swedbank',
    label: 'Swedbank',
    icon: '🏦',
    description: 'Pay directly via Swedbank online banking',
  },
  {
    id: 'seb',
    label: 'SEB',
    icon: '🏦',
    description: 'Pay directly via SEB online banking',
  },
  {
    id: 'luminor',
    label: 'Luminor',
    icon: '🏦',
    description: 'Pay directly via Luminor online banking',
  },
  {
    id: 'invoice',
    label: 'B2B Invoice',
    icon: '📄',
    description: 'Invoice for business customers (net 14)',
  },
];

// Payment methods that require expanded UI before continuing
const EXPANDED_PAYMENT_METHODS = new Set([
  'stripe_card',
  'swedbank',
  'seb',
  'luminor',
  'invoice',
]);

export function PaymentStep() {
  const hook = useCheckout();
  const ctx = useCheckoutContext();
  const cart = useCart();
  const cartId = cart.cart?.id ?? '';
  const [selectedId, setSelectedId] = useState<string>(hook.paymentMethod ?? '');
  const [selectionError, setSelectionError] = useState<string>('');
  const [paymentError, setPaymentError] = useState<string>('');
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [bankCancelled, setBankCancelled] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
    setSelectionError('');
    setPaymentError('');
    setPaymentConfirmed(false);
    setBankCancelled(false);
  }, []);

  const handleStripeSuccess = useCallback((_paymentIntentId: string) => {
    setPaymentConfirmed(true);
    setPaymentError('');
  }, []);

  const handleStripeError = useCallback((error: string) => {
    setPaymentError(error);
    setPaymentConfirmed(false);
  }, []);

  const handleBankConfirm = useCallback(() => {
    setPaymentConfirmed(true);
    setBankCancelled(false);
    setPaymentError('');
  }, []);

  const handleBankCancel = useCallback(() => {
    setBankCancelled(true);
    setPaymentConfirmed(false);
    setPaymentError('Payment cancelled by user.');
  }, []);

  const needsExpandedUI = EXPANDED_PAYMENT_METHODS.has(selectedId);
  const canContinue = !needsExpandedUI || paymentConfirmed;

  const handleContinue = useCallback(() => {
    if (!selectedId) {
      setSelectionError('Please select a payment method');
      return;
    }
    if (needsExpandedUI && !paymentConfirmed) {
      setSelectionError('Please complete the payment process before continuing');
      return;
    }
    hook.setPaymentMethod(selectedId);
    ctx.nextStep();
  }, [selectedId, needsExpandedUI, paymentConfirmed, hook, ctx]);

  const isBankMethod =
    selectedId === 'swedbank' ||
    selectedId === 'seb' ||
    selectedId === 'luminor';

  const hasCompanyInfo =
    hook.shippingAddress?.company || hook.shippingAddress?.vatId;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-neutral-900 mb-1">
          Payment Method
        </h2>
        <p className="text-sm text-neutral-500 mb-4">
          How would you like to pay?
        </p>
      </div>

      {(ctx.error || selectionError) && (
        <div
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
          role="alert"
        >
          {ctx.error || selectionError}
        </div>
      )}

      <Card variant="info" className="p-0 overflow-hidden">
        <div role="radiogroup" aria-label="Payment methods" className="divide-y divide-neutral-100">
          {PAYMENT_OPTIONS.map((option) => {
            const isSelected = selectedId === option.id;

            return (
              <label
                key={option.id}
                className={`
                  flex items-center gap-4 p-4 cursor-pointer transition-colors
                  ${isSelected ? 'bg-primary-50' : 'hover:bg-neutral-50'}
                `}
              >
                <input
                  type="radio"
                  name="payment-method"
                  value={option.id}
                  checked={isSelected}
                  onChange={() => handleSelect(option.id)}
                  className="w-4 h-4 text-primary-500 border-neutral-300 focus:ring-primary-500"
                  aria-label={option.label}
                />
                <span className="text-xl" aria-hidden="true">
                  {option.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-neutral-900">
                    {option.label}
                  </div>
                  <p className="text-sm text-neutral-500 mt-0.5">
                    {option.description}
                  </p>
                </div>
              </label>
            );
          })}
        </div>
      </Card>

      {/* Expanded Payment UI */}
      {selectedId === 'stripe_card' && (
        <StripeCardElement
          cartId={cartId}
          onSuccess={handleStripeSuccess}
          onError={handleStripeError}
        />
      )}

      {selectedId === 'apple_google_pay' && (
        <Card variant="info" className="mt-4">
          <div className="flex items-center gap-3 py-2">
            <span className="text-2xl" aria-hidden="true">📱</span>
            <div>
              <p className="font-medium text-neutral-900">
                Apple Pay / Google Pay
              </p>
              <p className="text-sm text-neutral-500">
                Device support required. Use a supported mobile device or
                browser.
              </p>
            </div>
          </div>
        </Card>
      )}

      {isBankMethod && (
        <BankRedirect
          bankId={selectedId}
          onConfirm={handleBankConfirm}
          onCancel={handleBankCancel}
          amount={cart.total}
        />
      )}

      {selectedId === 'invoice' && (
        <Card variant="info" className="mt-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl" aria-hidden="true">📄</span>
              <div>
                <h4 className="font-medium text-neutral-900">
                  B2B Invoice Payment
                </h4>
                <p className="text-sm text-neutral-500">
                  Invoice will be sent to your company email
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-neutral-200 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Payment Terms</span>
                <span className="font-medium text-neutral-900">
                  14 days from invoice date
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Invoice Recipient</span>
                <span className="font-medium text-neutral-900">
                  {hook.shippingAddress?.company ?? 'Not provided'}
                </span>
              </div>
              {hook.shippingAddress?.vatId && (
                <div className="flex justify-between">
                  <span className="text-neutral-500">VAT ID</span>
                  <span className="font-mono text-neutral-900">
                    {hook.shippingAddress.vatId}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-neutral-500">Invoice Email</span>
                <span className="text-neutral-900">
                  {hook.shippingAddress?.email ?? 'Not provided'}
                </span>
              </div>
            </div>

            {!hasCompanyInfo && (
              <p className="text-xs text-amber-600">
                Tip: Add your company name and VAT ID in the Address step for
                proper invoicing.
              </p>
            )}

            <Button
              variant="primary"
              size="md"
              onClick={() => {
                setPaymentConfirmed(true);
                setPaymentError('');
              }}
              className="w-full"
            >
              Continue
            </Button>
          </div>
        </Card>
      )}

      {/* Payment error */}
      {paymentError && (
        <div
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
          role="alert"
        >
          {paymentError}
        </div>
      )}

      {/* Payment success indicator */}
      {paymentConfirmed && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
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
          Payment confirmed successfully
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button
          variant="outline"
          size="lg"
          onClick={ctx.prevStep}
          disabled={isProcessing}
        >
          Back
        </Button>
        <Button
          variant="primary"
          size="lg"
          onClick={handleContinue}
          isLoading={isProcessing}
          disabled={!canContinue}
        >
          Continue to Review
        </Button>
      </div>
    </div>
  );
}
