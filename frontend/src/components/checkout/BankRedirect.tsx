import { useState, useCallback } from 'react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { NodaService } from '@/services/nodaService';
import { useCart } from '@/context/cartContext';

// ============================================================================
// Bank Configuration
// ============================================================================

interface BankConfig {
  id: string;
  name: string;
  color: string;
  bgColor: string;
  borderColor: string;
  logo: string;
}

const BANK_CONFIGS: Record<string, BankConfig> = {
  swedbank: {
    id: 'swedbank',
    name: 'Swedbank',
    color: '#5D3290',
    bgColor: '#F5F0FA',
    borderColor: '#D4C4E8',
    logo: '🟣',
  },
  seb: {
    id: 'seb',
    name: 'SEB',
    color: '#00376E',
    bgColor: '#EBF3FA',
    borderColor: '#C5D9ED',
    logo: '🔵',
  },
  luminor: {
    id: 'luminor',
    name: 'Luminor',
    color: '#1B1B3A',
    bgColor: '#F0F0F5',
    borderColor: '#D0D0DD',
    logo: '⚫',
  },
};

// ============================================================================
// Mode Detection (runtime check for testability)
// ============================================================================

/** Check if we're in mock mode — exported for testing */
export function isMockMode(): boolean {
  return import.meta.env.VITE_API_USE_MOCK !== 'false';
}

// ============================================================================
// Mock Bank Page Overlay
// ============================================================================

interface MockBankPageProps {
  bank: BankConfig;
  onConfirm: () => void;
  onCancel: () => void;
}

function MockBankPage({ bank, onConfirm, onCancel }: MockBankPageProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-label={`${bank.name} payment page`}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Bank branding header */}
        <div
          className="px-6 py-4 flex items-center gap-3"
          style={{ backgroundColor: bank.color }}
        >
          <span className="text-2xl" aria-hidden="true">
            {bank.logo}
          </span>
          <h2 className="text-lg font-semibold text-white">{bank.name}</h2>
          <span className="ml-auto text-xs text-white/80">
            Secure Payment Gateway
          </span>
        </div>

        {/* Bank page content */}
        <div className="p-6 space-y-4">
          <div
            className="rounded-lg p-4"
            style={{ backgroundColor: bank.bgColor }}
          >
            <p className="text-sm font-medium" style={{ color: bank.color }}>
              Confirm your payment
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              You are about to make a payment via {bank.name} online banking.
            </p>
          </div>

          {/* Mock authentication fields */}
          <div className="space-y-3">
            <div>
              <label
                htmlFor={`bank-user-${bank.id}`}
                className="block text-xs font-medium text-neutral-600 mb-1"
              >
                Online Banking Username
              </label>
              <input
                id={`bank-user-${bank.id}`}
                type="text"
                placeholder="Enter your username"
                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                style={{ '--tw-ring-color': bank.color } as React.CSSProperties}
                aria-label={`${bank.name} username`}
              />
            </div>
            <div>
              <label
                htmlFor={`bank-pass-${bank.id}`}
                className="block text-xs font-medium text-neutral-600 mb-1"
              >
                Password
              </label>
              <input
                id={`bank-pass-${bank.id}`}
                type="password"
                placeholder="Enter your password"
                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                style={{ '--tw-ring-color': bank.color } as React.CSSProperties}
                aria-label={`${bank.name} password`}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              size="lg"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={onConfirm}
              className="flex-1"
              style={{
                backgroundColor: bank.color,
                borderColor: bank.color,
              }}
            >
              Confirm Payment
            </Button>
          </div>

          <p className="text-xs text-neutral-400 text-center">
            This is a simulated bank page for testing purposes only.
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// BankRedirect Component
// ============================================================================

interface BankRedirectProps {
  bankId: string;
  onConfirm: () => void;
  onCancel: () => void;
  /** Cart total for payment initiation (used in real mode) */
  amount?: number;
}

export function BankRedirect({
  bankId,
  onConfirm,
  onCancel,
  amount,
}: BankRedirectProps) {
  const [showMockBank, setShowMockBank] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [redirectError, setRedirectError] = useState<string | null>(null);
  const cart = useCart();
  const cartId = cart.cart?.id ?? '';

  const bank = BANK_CONFIGS[bankId];

  if (!bank) {
    return (
      <Card variant="info" className="mt-4">
        <p className="text-sm text-red-600">Unknown bank selected</p>
      </Card>
    );
  }

  const handleProceed = useCallback(async () => {
    if (isMockMode()) {
      // Mock mode: show the fake bank overlay
      setShowMockBank(true);
      return;
    }

    // Real mode: initiate Noda payment and redirect
    setIsRedirecting(true);
    setRedirectError(null);

    try {
      const paymentAmount = amount ?? cart.total;
      if (!cartId) {
        setRedirectError('Cart ID not available. Please try again.');
        setIsRedirecting(false);
        return;
      }
      if (paymentAmount <= 0) {
        setRedirectError('Invalid cart total. Please try again.');
        setIsRedirecting(false);
        return;
      }

      const result = await NodaService.initiatePayment(
        cartId,
        paymentAmount,
        'EUR',
      );
      // Redirect to Noda gateway
      window.location.href = result.redirectUrl;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to initiate payment';
      setRedirectError(message);
      setIsRedirecting(false);
    }
  }, [isMockMode, cartId, amount, cart.total]);

  const handleBankConfirm = useCallback(() => {
    setShowMockBank(false);
    onConfirm();
  }, [onConfirm]);

  const handleBankCancel = useCallback(() => {
    setShowMockBank(false);
    onCancel();
  }, [onCancel]);

  return (
    <>
      <Card variant="info" className="mt-4">
        <div className="flex items-center gap-4">
          <span className="text-3xl" aria-hidden="true">
            {bank.logo}
          </span>
          <div className="flex-1">
            <h4 className="font-medium text-neutral-900">{bank.name}</h4>
            <p className="text-sm text-neutral-500">
              {isMockMode()
                ? `You will be redirected to ${bank.name} to complete your payment securely.`
                : `You will be redirected to ${bank.name} via Noda to complete your payment securely.`}
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={handleProceed}
            disabled={isRedirecting}
          >
            {isRedirecting ? 'Redirecting...' : `Proceed to ${bank.name}`}
          </Button>
        </div>

        {/* Redirect error message */}
        {redirectError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{redirectError}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRedirectError(null)}
              className="mt-2"
            >
              Dismiss
            </Button>
          </div>
        )}
      </Card>

      {isMockMode() && showMockBank && (
        <MockBankPage
          bank={bank}
          onConfirm={handleBankConfirm}
          onCancel={handleBankCancel}
        />
      )}
    </>
  );
}

/** Get bank name by ID (for display in other components) */
export function getBankName(bankId: string): string {
  return BANK_CONFIGS[bankId]?.name ?? bankId;
}
