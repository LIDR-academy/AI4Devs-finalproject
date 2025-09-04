import React from 'react';
import { formatCurrency, formatPriceRange, formatPricePerSqm, CurrencyOptions } from '@/utils/currency';

interface CurrencyDisplayProps {
  amount: number | string;
  options?: CurrencyOptions;
  variant?: 'currency' | 'number' | 'range' | 'pricePerSqm';
  minAmount?: number | string;
  maxAmount?: number | string;
  sqMeters?: number | string;
  showCurrencySymbol?: boolean;
  className?: string;
  sx?: any;
}

export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  amount,
  options = {},
  variant = 'currency',
  minAmount,
  maxAmount,
  sqMeters,
  className,
  sx
}) => {
  const getFormattedValue = (): string => {
    switch (variant) {
      case 'range':
        if (minAmount !== undefined && maxAmount !== undefined) {
          return formatPriceRange(minAmount, maxAmount, options);
        }
        return formatCurrency(amount, options);
      
      case 'pricePerSqm':
        if (sqMeters !== undefined) {
          return formatPricePerSqm(amount, sqMeters, options);
        }
        return formatCurrency(amount, options);
      
      case 'number':
        return new Intl.NumberFormat(options.locale || 'es-MX').format(
          typeof amount === 'string' ? parseFloat(amount) : amount
        );
      
      case 'currency':
      default:
        return formatCurrency(amount, options);
    }
  };

  const formattedValue = getFormattedValue();

  return (
    <span className={className} style={sx}>
      {formattedValue}
    </span>
  );
};

export default CurrencyDisplay;
