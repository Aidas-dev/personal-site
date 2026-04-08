import { useEffect } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useCheckout } from '@/hooks/useCheckout';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { formatPrice } from '@/utils/formatPrice';
import { getBankName } from './BankRedirect';

export function ConfirmationStep() {
  const { order, paymentMethod, error, goToStep, reset } = useCheckout();
  const navigate = useNavigate();

  // Navigate to dedicated order confirmation page if order exists
  useEffect(() => {
    if (order && !error) {
      navigate({
        to: '/order/confirmation',
        search: { order_id: order.id },
        replace: true,
      }).catch(() => {
        // Navigation may fail if already on the page — ignore
      });
    }
  }, [order, error, navigate]);

  if (error) {
    return (
      <div className="text-center py-8">
        <Card variant="info" className="max-w-lg mx-auto">
          {/* Error icon */}
          <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>

          <h2 className="text-xl font-semibold text-neutral-900 mb-2">
            Something Went Wrong
          </h2>
          <p className="text-neutral-600 mb-6">{error}</p>

          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                reset();
                goToStep(3);
              }}
            >
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const currency = 'EUR';

  const getPaymentStatusMessage = (): {
    message: string;
    type: 'success' | 'pending' | 'info';
  } => {
    if (!paymentMethod) {
      return { message: 'Payment method not specified', type: 'info' };
    }

    switch (paymentMethod) {
      case 'stripe_card':
        return {
          message:
            'Payment processed securely by Stripe. A confirmation has been sent to your email.',
          type: 'success',
        };
      case 'apple_google_pay':
        return {
          message:
            'Payment initiated via digital wallet. You will receive a confirmation shortly.',
          type: 'success',
        };
      case 'swedbank':
      case 'seb':
      case 'luminor': {
        const bankName = getBankName(paymentMethod);
        return {
          message: `Payment pending — you'll be redirected to ${bankName} to complete your payment.`,
          type: 'pending',
        };
      }
      case 'invoice':
        return {
          message: `Invoice will be sent to ${order.email}. Payment is due within 14 days of the invoice date.`,
          type: 'info',
        };
      default:
        return { message: 'Order confirmed', type: 'success' };
    }
  };

  const paymentMessage = getPaymentStatusMessage();

  const getStatusIcon = () => {
    if (paymentMessage.type === 'success') {
      return (
        <svg
          className="w-8 h-8 text-green-600"
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
      );
    }
    if (paymentMessage.type === 'pending') {
      return (
        <svg
          className="w-8 h-8 text-amber-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    }
    return (
      <svg
        className="w-8 h-8 text-blue-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    );
  };

  const getStatusBgColor = (): string => {
    switch (paymentMessage.type) {
      case 'success':
        return 'bg-green-100';
      case 'pending':
        return 'bg-amber-100';
      case 'info':
        return 'bg-blue-100';
      default:
        return 'bg-green-100';
    }
  };

  return (
    <div className="text-center py-4">
      <Card variant="info" className="max-w-lg mx-auto">
        {/* Status icon */}
        <div
          className={`mx-auto w-16 h-16 rounded-full ${getStatusBgColor()} flex items-center justify-center mb-4`}
        >
          {getStatusIcon()}
        </div>

        <h2 className="text-2xl font-bold text-neutral-900 mb-2">
          Order Confirmed!
        </h2>
        <p className="text-neutral-600 mb-4">
          Thank you for your order. We'll send you a confirmation email shortly.
        </p>

        {/* Payment status message */}
        <div
          className={`mb-6 px-4 py-3 rounded-lg text-sm text-left ${
            paymentMessage.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : paymentMessage.type === 'pending'
                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                : 'bg-blue-50 text-blue-800 border border-blue-200'
          }`}
          role="status"
        >
          <p className="font-medium">{paymentMessage.message}</p>
        </div>

        {/* Order details */}
        <div className="text-left bg-white rounded-lg p-4 mb-6 border border-neutral-200">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500">Order Number</span>
              <span className="font-mono font-medium text-neutral-900">
                #{order.displayId}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Date</span>
              <span className="text-neutral-900">
                {new Date(order.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Total</span>
              <span className="font-semibold text-primary-500">
                {formatPrice(order.total, currency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Items</span>
              <span className="text-neutral-900">{order.items.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Payment Method</span>
              <span className="text-neutral-900">{paymentMethod ?? 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Shipping summary */}
        <div className="text-left text-sm text-neutral-600 mb-6">
          <p className="font-medium text-neutral-900 mb-1">Shipping to:</p>
          <p>
            {order.shippingAddress.firstName} {order.shippingAddress.lastName}
          </p>
          <p>{order.shippingAddress.address1}</p>
          {order.shippingAddress.address2 && (
            <p>{order.shippingAddress.address2}</p>
          )}
          <p>
            {order.shippingAddress.city} {order.shippingAddress.postalCode}
          </p>
          <p>{order.shippingAddress.country}</p>
        </div>

        <Link to="/products">
          <Button variant="primary" size="lg">
            Continue Shopping
          </Button>
        </Link>
      </Card>
    </div>
  );
}
