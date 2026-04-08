import { useState, useCallback, type ChangeEvent, type FormEvent } from 'react';
import { useCheckout as useCheckoutContext } from '@/context/checkoutContext';
import { useCheckout } from '@/hooks/useCheckout';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Card } from '@/components/Card';
import type { AddressFormData } from '@/context/checkoutContext';

function createEmptyFormData(): AddressFormData {
  return {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    postalCode: '',
    country: 'LT',
  };
}

interface AddressFormProps {
  initialData: AddressFormData | null;
  onSubmit: (data: AddressFormData) => void;
  submitLabel: string;
}

function AddressForm({ initialData, onSubmit, submitLabel }: AddressFormProps) {
  const [formData, setFormData] = useState<AddressFormData>(
    initialData ?? createEmptyFormData(),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());

  const handleChange = useCallback(
    (field: keyof AddressFormData) =>
      (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData((prev) => ({ ...prev, [field]: value }));
      },
    [],
  );

  const handleBlur = useCallback(
    (field: keyof AddressFormData) => () => {
      setTouched((prev) => new Set(prev).add(field));
      // Validate on blur
      const fieldErrors: Record<string, string> = {};
      const value = formData[field];
      if (
        ['firstName', 'lastName', 'email', 'address1', 'city', 'postalCode', 'country'].includes(
          field,
        )
      ) {
        if (!value.trim()) {
          const labels: Record<string, string> = {
            firstName: 'First name',
            lastName: 'Last name',
            email: 'Email',
            address1: 'Address',
            city: 'City',
            postalCode: 'Postal code',
            country: 'Country',
          };
          fieldErrors[field] = `${labels[field]} is required`;
        }
        if (field === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          fieldErrors[field] = 'Please enter a valid email';
        }
      }
      setErrors((prev) => {
        const next = { ...prev };
        if (fieldErrors[field]) {
          next[field] = fieldErrors[field];
        } else {
          delete next[field];
        }
        return next;
      });
    },
    [formData],
  );

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();

      // Validate all fields
      const newErrors: Record<string, string> = {};
      const requiredFields: (keyof AddressFormData)[] = [
        'firstName',
        'lastName',
        'email',
        'address1',
        'city',
        'postalCode',
        'country',
      ];

      for (const field of requiredFields) {
        const value = formData[field];
        if (!value.trim()) {
          const labels: Record<string, string> = {
            firstName: 'First name',
            lastName: 'Last name',
            email: 'Email',
            address1: 'Address',
            city: 'City',
            postalCode: 'Postal code',
            country: 'Country',
          };
          newErrors[field] = `${labels[field]} is required`;
        }
      }

      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email';
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setTouched(new Set(requiredFields));
        return;
      }

      onSubmit(formData);
    },
    [formData, onSubmit],
  );

  const getFieldError = (field: keyof AddressFormData): string | undefined => {
    return touched.has(field) ? errors[field] : undefined;
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="First name"
          required
          value={formData.firstName}
          onChange={handleChange('firstName')}
          onBlur={handleBlur('firstName')}
          error={getFieldError('firstName')}
          autoComplete="given-name"
        />
        <Input
          label="Last name"
          required
          value={formData.lastName}
          onChange={handleChange('lastName')}
          onBlur={handleBlur('lastName')}
          error={getFieldError('lastName')}
          autoComplete="family-name"
        />
      </div>

      <Input
        label="Email"
        type="email"
        required
        value={formData.email}
        onChange={handleChange('email')}
        onBlur={handleBlur('email')}
        error={getFieldError('email')}
        autoComplete="email"
      />

      <Input
        label="Phone (optional)"
        type="tel"
        value={formData.phone}
        onChange={handleChange('phone')}
        onBlur={handleBlur('phone')}
        autoComplete="tel"
      />

      <Input
        label="Address"
        required
        value={formData.address1}
        onChange={handleChange('address1')}
        onBlur={handleBlur('address1')}
        error={getFieldError('address1')}
        autoComplete="address-line1"
      />

      <Input
        label="Address line 2"
        value={formData.address2}
        onChange={handleChange('address2')}
        onBlur={handleBlur('address2')}
        autoComplete="address-line2"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          label="City"
          required
          value={formData.city}
          onChange={handleChange('city')}
          onBlur={handleBlur('city')}
          error={getFieldError('city')}
          autoComplete="address-level2"
        />
        <Input
          label="Postal code"
          required
          value={formData.postalCode}
          onChange={handleChange('postalCode')}
          onBlur={handleBlur('postalCode')}
          error={getFieldError('postalCode')}
          autoComplete="postal-code"
        />
        <Input
          label="Country"
          required
          value={formData.country}
          onChange={handleChange('country')}
          onBlur={handleBlur('country')}
          error={getFieldError('country')}
          autoComplete="country-name"
        />
      </div>

      <div className="pt-2">
        <Button variant="primary" size="lg" type="submit">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

export function AddressStep() {
  const hook = useCheckout();
  const ctx = useCheckoutContext();

  const {
    shippingAddress,
    billingAddress,
    sameAsShipping,
    error,
  } = hook;

  const handleShippingSubmit = (data: AddressFormData) => {
    hook.setShippingAddress(data);
    if (sameAsShipping) {
      hook.setBillingAddress(data);
    }
    ctx.setError(null);
    ctx.nextStep();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-neutral-900 mb-1">
          Shipping Address
        </h2>
        <p className="text-sm text-neutral-500 mb-4">
          Where should we deliver your order?
        </p>
      </div>

      {error && (
        <div
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
          role="alert"
        >
          {error}
        </div>
      )}

      <Card variant="info">
        <AddressForm
          initialData={shippingAddress}
          onSubmit={handleShippingSubmit}
          submitLabel="Continue to Shipping"
        />
      </Card>

      <div className="pt-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={sameAsShipping}
            onChange={(e) => hook.setSameAsShipping(e.target.checked)}
            className="w-4 h-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
          />
          <span className="text-sm text-neutral-700">
            Billing address same as shipping
          </span>
        </label>
      </div>

      {!sameAsShipping && (
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-1">
            Billing Address
          </h2>
          <p className="text-sm text-neutral-500 mb-4">
            Address for billing purposes
          </p>
          <Card variant="info">
            <AddressForm
              initialData={billingAddress}
              onSubmit={(data) => {
                hook.setBillingAddress(data);
                ctx.setError(null);
                ctx.nextStep();
              }}
              submitLabel="Continue to Shipping"
            />
          </Card>
        </div>
      )}
    </div>
  );
}
