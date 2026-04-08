import { useState, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useCheckout as useCheckoutContext } from '@/context/checkoutContext';
import { useCheckout } from '@/hooks/useCheckout';
import { useCart } from '@/context/cartContext';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { formatPrice } from '@/utils/formatPrice';
import { getBankName } from './BankRedirect';
import { OrderService } from '@/services/orderService';

export function ReviewStep() {
  const hook = useCheckout();
  const ctx = useCheckoutContext();
  const { items, subtotal, taxTotal, region, clearCart } = useCart();
  const currency = region?.currencyCode ?? 'EUR';
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState('');
  const navigate = useNavigate();

  const {
    shippingAddress,
    billingAddress,
    shippingMethod,
    paymentMethod,
    isCompleting,
    error,
  } = hook;

  const shippingCost = shippingMethod?.price ?? 0;
  const taxRate = 0.21;
  const taxOnShipping = Math.round(shippingCost * taxRate * 100) / 100;
  const totalTax = taxTotal + taxOnShipping;
  const total = subtotal + shippingCost + totalTax;

  const getPaymentLabel = (id: string | null): string => {
    if (!id) return 'Not selected';
    const labels: Record<string, string> = {
      stripe_card: 'Credit/Debit Card — Payment processed securely by Stripe',
      apple_google_pay: 'Apple Pay / Google Pay',
      swedbank: `Bank Transfer via ${getBankName('swedbank')}`,
      seb: `Bank Transfer via ${getBankName('seb')}`,
      luminor: `Bank Transfer via ${getBankName('luminor')}`,
      invoice: 'Invoice — Payment due within 14 days',
    };
    return labels[id] ?? id;
  };

  const formatAddress = (addr: typeof shippingAddress): string => {
    if (!addr) return 'Not provided';
    const parts = [
      addr.address1,
      addr.address2,
      `${addr.city} ${addr.postalCode}`,
      addr.country,
    ].filter(Boolean);
    return parts.join(', ');
  };

  const handlePlaceOrder = useCallback(async () => {
    if (!termsAccepted) {
      setTermsError('You must accept the terms and conditions');
      return;
    }
    setTermsError('');

    // Import dynamically to avoid circular deps
    const { CheckoutService } = await import('@/services/checkoutService');

    ctx.setIsCompleting(true);
    ctx.setError(null);

    try {
      const cartId = localStorage.getItem('medusa_cart_id');
      if (!cartId) {
        throw new Error('No cart found');
      }

      if (!shippingAddress) {
        throw new Error('Shipping address is required');
      }

      const billingAddr = billingAddress ?? shippingAddress;

      const order = await CheckoutService.completeCart(cartId, {
        email: shippingAddress.email,
        shippingAddress: {
          firstName: shippingAddress.firstName,
          lastName: shippingAddress.lastName,
          email: shippingAddress.email,
          phone: shippingAddress.phone,
          address1: shippingAddress.address1,
          address2: shippingAddress.address2,
          city: shippingAddress.city,
          postalCode: shippingAddress.postalCode,
          country: shippingAddress.country,
        },
        billingAddress: {
          firstName: billingAddr.firstName,
          lastName: billingAddr.lastName,
          email: billingAddr.email,
          phone: billingAddr.phone,
          address1: billingAddr.address1,
          address2: billingAddr.address2,
          city: billingAddr.city,
          postalCode: billingAddr.postalCode,
          country: billingAddr.country,
        },
        shippingMethod: shippingMethod,
        paymentMethod: paymentMethod ?? '',
        subtotal,
        taxTotal,
        itemCount: items.length,
      });

      // Store order in mock localStorage for OrderService retrieval
      OrderService.storeOrderInMock(order);

      // Clear the cart and remove cart ID from localStorage
      try {
        await clearCart();
        localStorage.removeItem('medusa_cart_id');
      } catch {
        // Silently fail — cart clearing is best-effort
      }

      // Reset checkout state
      ctx.setOrder(order);

      // Navigate to dedicated order confirmation page
      await navigate({
        to: '/order/confirmation',
        search: { order_id: order.id },
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to place order';
      ctx.setError(message);
    } finally {
      ctx.setIsCompleting(false);
    }
  }, [
    termsAccepted,
    shippingAddress,
    billingAddress,
    shippingMethod,
    paymentMethod,
    subtotal,
    taxTotal,
    items,
    clearCart,
    ctx,
    navigate,
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-neutral-900 mb-1">
          Review Your Order
        </h2>
        <p className="text-sm text-neutral-500 mb-4">
          Please verify everything looks correct before placing your order
        </p>
      </div>

      {(error) && (
        <div
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Items */}
      <Card variant="info">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          Items ({items.length})
        </h3>
        <ul className="divide-y divide-neutral-100">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-4 py-3">
              {item.thumbnail && (
                <img
                  src={item.thumbnail}
                  alt=""
                  className="w-12 h-12 rounded-lg object-cover bg-neutral-100"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-neutral-900 truncate">
                  {item.title}
                </p>
                <p className="text-sm text-neutral-500">Qty: {item.quantity}</p>
              </div>
              <span className="font-medium text-neutral-900 whitespace-nowrap">
                {formatPrice(item.total, currency)}
              </span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Shipping Address */}
      <Card variant="info">
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
          Shipping Address
        </h3>
        <p className="text-neutral-600">{formatAddress(shippingAddress)}</p>
        {shippingAddress?.email && (
          <p className="text-sm text-neutral-500 mt-1">
            {shippingAddress.email}
          </p>
        )}
      </Card>

      {/* Billing Address */}
      <Card variant="info">
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
          Billing Address
        </h3>
        <p className="text-neutral-600">{formatAddress(billingAddress)}</p>
        {billingAddress?.email && (
          <p className="text-sm text-neutral-500 mt-1">
            {billingAddress.email}
          </p>
        )}
      </Card>

      {/* Shipping & Payment Methods */}
      <Card variant="info">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-neutral-500 mb-1">
              Shipping Method
            </h3>
            <p className="text-neutral-900">
              {shippingMethod?.name ?? 'Not selected'}
            </p>
            {shippingMethod?.estimatedDelivery && (
              <p className="text-sm text-neutral-500">
                {shippingMethod.estimatedDelivery}
              </p>
            )}
          </div>
          <div>
            <h3 className="text-sm font-medium text-neutral-500 mb-1">
              Payment Method
            </h3>
            <p className="text-neutral-900">{getPaymentLabel(paymentMethod)}</p>
          </div>
        </div>
      </Card>

      {/* Cost Breakdown */}
      <Card variant="info">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          Order Total
        </h3>
        <dl className="space-y-2">
          <div className="flex justify-between text-neutral-600">
            <dt>Subtotal</dt>
            <dd>{formatPrice(subtotal, currency)}</dd>
          </div>
          <div className="flex justify-between text-neutral-600">
            <dt>Shipping</dt>
            <dd>
              {shippingCost === 0
                ? 'Free'
                : formatPrice(shippingCost, currency)}
            </dd>
          </div>
          <div className="flex justify-between text-neutral-600">
            <dt>Tax (21% VAT)</dt>
            <dd>{formatPrice(totalTax, currency)}</dd>
          </div>
          <div className="border-t border-neutral-200 pt-3">
            <div className="flex justify-between">
              <dt className="text-lg font-semibold text-neutral-900">Total</dt>
              <dd className="text-lg font-bold text-primary-500">
                {formatPrice(total, currency)}
              </dd>
            </div>
          </div>
        </dl>
      </Card>

      {/* Terms & Conditions */}
      <div>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => {
              setTermsAccepted(e.target.checked);
              if (e.target.checked) setTermsError('');
            }}
            className="w-4 h-4 mt-0.5 rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
          />
          <span className="text-sm text-neutral-700">
            I accept the{' '}
            <a href="/terms" className="text-primary-500 hover:underline">
              terms and conditions
            </a>
            *
          </span>
        </label>
        {termsError && (
          <p className="text-sm text-red-600 mt-1 ml-7" role="alert">
            {termsError}
          </p>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          size="lg"
          onClick={ctx.prevStep}
          disabled={isCompleting}
        >
          Back
        </Button>
        <Button
          variant="primary"
          size="lg"
          onClick={handlePlaceOrder}
          isLoading={isCompleting}
          disabled={!termsAccepted}
        >
          Place Order
        </Button>
      </div>
    </div>
  );
}
