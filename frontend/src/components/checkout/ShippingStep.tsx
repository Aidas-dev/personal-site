import { useState, useCallback } from 'react';
import { useCheckout as useCheckoutContext } from '@/context/checkoutContext';
import { useCheckout } from '@/hooks/useCheckout';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { formatPrice } from '@/utils/formatPrice';
import type { ShippingMethod } from '@/types';

const SHIPPING_OPTIONS: ShippingMethod[] = [
  {
    id: 'standard',
    name: 'Standard Shipping',
    price: 4.99,
    estimatedDelivery: '3-5 business days',
  },
  {
    id: 'express',
    name: 'Express Shipping',
    price: 9.99,
    estimatedDelivery: '1-2 business days',
  },
  {
    id: 'pickup',
    name: 'Free Pickup',
    price: 0,
    estimatedDelivery: 'Same day',
  },
];

export function ShippingStep() {
  const hook = useCheckout();
  const ctx = useCheckoutContext();
  const [selectedId, setSelectedId] = useState<string>(
    hook.shippingMethod?.id ?? '',
  );
  const [selectionError, setSelectionError] = useState<string>('');

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
    setSelectionError('');
  }, []);

  const handleContinue = useCallback(() => {
    if (!selectedId) {
      setSelectionError('Please select a shipping method');
      return;
    }
    const method = SHIPPING_OPTIONS.find((o) => o.id === selectedId);
    if (method) {
      hook.setShippingMethod(method);
      ctx.nextStep();
    }
  }, [selectedId, hook, ctx]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-neutral-900 mb-1">
          Shipping Method
        </h2>
        <p className="text-sm text-neutral-500 mb-4">
          Choose how you'd like to receive your order
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
        <div role="radiogroup" aria-label="Shipping methods" className="divide-y divide-neutral-100">
          {SHIPPING_OPTIONS.map((option) => {
            const isSelected = selectedId === option.id;
            const isFree = option.price === 0;

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
                  name="shipping-method"
                  value={option.id}
                  checked={isSelected}
                  onChange={() => handleSelect(option.id)}
                  className="w-4 h-4 text-primary-500 border-neutral-300 focus:ring-primary-500"
                  aria-label={`${option.name} — ${isFree ? 'Free' : formatPrice(option.price, 'EUR')}`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-medium text-neutral-900">
                      {option.name}
                    </span>
                    <span
                      className={`font-semibold whitespace-nowrap ${
                        isFree ? 'text-green-600' : 'text-neutral-900'
                      }`}
                    >
                      {isFree ? 'Free' : formatPrice(option.price, 'EUR')}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-500 mt-0.5">
                    {option.estimatedDelivery}
                  </p>
                </div>
              </label>
            );
          })}
        </div>
      </Card>

      <div className="flex gap-3 pt-2">
        <Button variant="outline" size="lg" onClick={ctx.prevStep}>
          Back
        </Button>
        <Button variant="primary" size="lg" onClick={handleContinue}>
          Continue to Payment
        </Button>
      </div>
    </div>
  );
}
