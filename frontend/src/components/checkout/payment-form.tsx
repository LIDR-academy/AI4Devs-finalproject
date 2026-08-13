'use client';

import { useState } from 'react';
import type { PaymentData } from '../../types/checkout';

interface PaymentFormProps {
  initialData?: PaymentData;
  onSubmit: (data: PaymentData) => void;
  onBack: () => void;
}

type FormErrors = Partial<Record<keyof PaymentData, string>>;

const CARD_NUMBER_REGEX = /^\d{16}$/;
const CARD_EXPIRY_REGEX = /^(0[1-9]|1[0-2])\/\d{2}$/;
const CARD_CVV_REGEX = /^\d{3}$/;

function formatCardNumber(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
}

function formatCardExpiry(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function validatePaymentForm(data: PaymentData): FormErrors {
  const errors: FormErrors = {};

  const cardNumber = data.cardNumber.trim();
  if (!cardNumber) {
    errors.cardNumber = 'El número de tarjeta es obligatorio';
  } else if (!CARD_NUMBER_REGEX.test(cardNumber.replace(/\s/g, ''))) {
    errors.cardNumber = 'Introduce un número de tarjeta válido de 16 dígitos';
  }

  if (!data.cardName.trim()) {
    errors.cardName = 'El nombre del titular es obligatorio';
  }

  const cardExpiry = data.cardExpiry.trim();
  if (!cardExpiry) {
    errors.cardExpiry = 'La fecha de vencimiento es obligatoria';
  } else if (!CARD_EXPIRY_REGEX.test(cardExpiry)) {
    errors.cardExpiry = 'Introduce una fecha de vencimiento válida (MM/AA)';
  }

  const cardCVV = data.cardCVV.trim();
  if (!cardCVV) {
    errors.cardCVV = 'El CVV es obligatorio';
  } else if (!CARD_CVV_REGEX.test(cardCVV)) {
    errors.cardCVV = 'El CVV debe tener 3 dígitos';
  }

  return errors;
}

export function PaymentForm({ initialData, onSubmit, onBack }: PaymentFormProps) {
  const [formData, setFormData] = useState<PaymentData>({
    cardNumber: formatCardNumber(initialData?.cardNumber ?? ''),
    cardName: initialData?.cardName ?? '',
    cardExpiry: formatCardExpiry(initialData?.cardExpiry ?? ''),
    cardCVV: initialData?.cardCVV ?? '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  function handleChange(field: keyof PaymentData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validatePaymentForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSubmit(formData);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <Field
        id="payment-card-number"
        label="Número de tarjeta"
        required
        value={formData.cardNumber}
        onChange={(v) => handleChange('cardNumber', formatCardNumber(v))}
        error={errors.cardNumber}
        placeholder="1234 5678 9012 3456"
        autoComplete="cc-number"
        inputMode="numeric"
      />

      <Field
        id="payment-card-name"
        label="Nombre del titular"
        required
        value={formData.cardName}
        onChange={(v) => handleChange('cardName', v)}
        error={errors.cardName}
        autoComplete="cc-name"
      />

      <div className="grid grid-cols-2 gap-4">
        <Field
          id="payment-card-expiry"
          label="Fecha de vencimiento"
          required
          value={formData.cardExpiry}
          onChange={(v) => handleChange('cardExpiry', formatCardExpiry(v))}
          error={errors.cardExpiry}
          placeholder="MM/AA"
          autoComplete="cc-exp"
          inputMode="numeric"
        />
        <Field
          id="payment-card-cvv"
          label="CVV"
          required
          value={formData.cardCVV}
          onChange={(v) => handleChange('cardCVV', v)}
          error={errors.cardCVV}
          placeholder="123"
          autoComplete="cc-csc"
          inputMode="numeric"
        />
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={onBack}
          className="w-full rounded-lg border border-border bg-white px-4 py-3 font-medium text-foreground transition-colors hover:bg-muted"
        >
          Volver
        </button>
        <button
          type="submit"
          className="w-full rounded-lg bg-rm-cta px-4 py-3 font-medium text-rm-cta-fg transition-colors hover:bg-rm-cta-hover"
        >
          Confirmar pedido
        </button>
      </div>
    </form>
  );
}

interface FieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  required,
  placeholder,
  autoComplete,
  inputMode,
}: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-foreground">
        {label}
        {required && <span className="ml-1 text-destructive" aria-hidden="true">*</span>}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
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
