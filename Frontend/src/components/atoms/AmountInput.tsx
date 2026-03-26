import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import { parseCurrency, formatCurrency } from '@/utils/currency';
import type { TripCurrency } from '@/types/trip.types';

interface AmountInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange'
> {
  value?: number;
  onChange?: (value: number) => void;
  error?: string;
  currency?: TripCurrency; // Optional: Currency type (COP or USD). Defaults to COP for backward compatibility
}

/**
 * AmountInput atom component
 * Specialized input for currency amounts (COP or USD)
 * Follows Design System Guide: large size (text-3xl), $ prefix
 * COP: no decimals, USD: with decimals
 */
export const AmountInput = forwardRef<HTMLInputElement, AmountInputProps>(
  ({ value = 0, onChange, error, currency = 'COP', className = '', ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const parsed = parseCurrency(e.target.value);
      onChange?.(parsed);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      // Format on blur
      const parsed = parseCurrency(e.target.value);
      if (onChange) {
        onChange(parsed);
      }
    };

    const formatted_currency = formatCurrency(value, currency);
    const displayValue = value > 0 ? formatted_currency.replace('$ ', '') : '';

    return (
      <div className="w-full">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-3xl font-medium">
            $
          </span>
          <input
            ref={ref}
            type="text"
            inputMode="numeric"
            value={displayValue}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full min-h-[48px] pl-12 pr-4 text-3xl font-medium text-right border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-600 focus-visible:ring-2 focus-visible:ring-violet-600 focus:border-transparent transition-colors ${
              error
                ? 'border-red-500 bg-red-50 focus:ring-red-500 focus-visible:ring-red-500'
                : 'border-slate-300 bg-white hover:border-slate-400'
            } ${className}`}
            placeholder="0"
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  },
);

AmountInput.displayName = 'AmountInput';
