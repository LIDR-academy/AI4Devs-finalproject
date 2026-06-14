'use client';

import { useState } from 'react';
import type { ShippingData } from '../../types/checkout';

interface ShippingFormProps {
  initialData?: ShippingData;
  onSubmit: (data: ShippingData) => void;
}

type FormErrors = Partial<Record<keyof ShippingData, string>>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Digits, spaces, hyphens, parentheses, leading +. Min 7 chars (e.g. "600 123 4")
const PHONE_REGEX = /^[+]?[0-9\s\-().]{7,20}$/;
// Digits only, 4–10 chars (ES/FR/DE/US 5-digit, PT 4-digit, etc.)
// Letters not allowed: free-text country field makes ISO-aware validation impractical in MVP
const POSTAL_CODE_REGEX = /^\d{4,10}$/;

function validateShippingForm(data: ShippingData): FormErrors {
  const errors: FormErrors = {};

  if (!data.name.trim()) {
    errors.name = 'El nombre completo es obligatorio';
  }
  if (!data.email.trim()) {
    errors.email = 'El email es obligatorio';
  } else if (!EMAIL_REGEX.test(data.email)) {
    errors.email = 'Introduce un email válido';
  }
  const phone = data.phone?.trim() ?? '';
  if (phone && !PHONE_REGEX.test(phone)) {
    errors.phone = 'Introduce un número de teléfono válido';
  }
  if (!data.address.trim()) {
    errors.address = 'La dirección es obligatoria';
  }
  if (!data.city.trim()) {
    errors.city = 'La ciudad es obligatoria';
  }
  const postalCode = data.postalCode.trim();
  if (!postalCode) {
    errors.postalCode = 'El código postal es obligatorio';
  } else if (!POSTAL_CODE_REGEX.test(postalCode)) {
    errors.postalCode = 'Introduce un código postal válido';
  }
  if (!data.country.trim()) {
    errors.country = 'El país es obligatorio';
  }

  return errors;
}

export function ShippingForm({ initialData, onSubmit }: ShippingFormProps) {
  const [formData, setFormData] = useState<ShippingData>({
    name: initialData?.name ?? '',
    email: initialData?.email ?? '',
    phone: initialData?.phone ?? '',
    address: initialData?.address ?? '',
    city: initialData?.city ?? '',
    postalCode: initialData?.postalCode ?? '',
    country: initialData?.country ?? 'España',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  function handleChange(field: keyof ShippingData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validateShippingForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSubmit(formData);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <Field
        id="shipping-name"
        label="Nombre completo"
        required
        value={formData.name}
        onChange={(v) => handleChange('name', v)}
        error={errors.name}
        autoComplete="name"
      />

      <Field
        id="shipping-email"
        label="Email"
        type="email"
        required
        value={formData.email}
        onChange={(v) => handleChange('email', v)}
        error={errors.email}
        autoComplete="email"
      />

      <Field
        id="shipping-phone"
        label="Teléfono"
        type="tel"
        value={formData.phone ?? ''}
        onChange={(v) => handleChange('phone', v)}
        error={errors.phone}
        placeholder="Opcional"
        autoComplete="tel"
      />

      <Field
        id="shipping-address"
        label="Dirección"
        required
        value={formData.address}
        onChange={(v) => handleChange('address', v)}
        error={errors.address}
        autoComplete="street-address"
      />

      <div className="grid grid-cols-2 gap-4">
        <Field
          id="shipping-city"
          label="Ciudad"
          required
          value={formData.city}
          onChange={(v) => handleChange('city', v)}
          error={errors.city}
          autoComplete="address-level2"
        />
        <Field
          id="shipping-postal-code"
          label="Código postal"
          required
          value={formData.postalCode}
          onChange={(v) => handleChange('postalCode', v)}
          error={errors.postalCode}
          autoComplete="postal-code"
        />
      </div>

      <Field
        id="shipping-country"
        label="País"
        required
        value={formData.country}
        onChange={(v) => handleChange('country', v)}
        error={errors.country}
        autoComplete="country-name"
      />

      <button
        type="submit"
        className="mt-2 w-full rounded-lg bg-rm-cta px-4 py-3 font-medium text-rm-cta-fg transition-colors hover:bg-rm-cta-hover"
      >
        Continuar al pago
      </button>
    </form>
  );
}

interface FieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  type = 'text',
  required,
  placeholder,
  autoComplete,
}: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-foreground">
        {label}
        {required && <span className="ml-1 text-destructive" aria-hidden="true">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={[
          'w-full rounded-lg border bg-input-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-colors',
          error
            ? 'border-destructive focus:ring-destructive'
            : 'border-border focus:ring-primary/30',
        ].join(' ')}
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
