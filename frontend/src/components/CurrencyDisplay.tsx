import React from 'react';
import { Typography, TypographyProps } from '@mui/material';
import { formatCurrency, formatPriceRange, formatPricePerSqm, CurrencyOptions } from '@/utils/currency';

interface CurrencyDisplayProps extends Omit<TypographyProps, 'children'> {
  amount: number | string;
  options?: CurrencyOptions;
  variant?: 'currency' | 'number' | 'range' | 'pricePerSqm';
  minAmount?: number | string;
  maxAmount?: number | string;
  sqMeters?: number | string;
  showCurrencySymbol?: boolean;
}

export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  amount,
  options = {},
  variant = 'currency',
  minAmount,
  maxAmount,
  sqMeters,
  showCurrencySymbol = true,
  ...typographyProps
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
    <Typography {...typographyProps}>
      {formattedValue}
    </Typography>
  );
};

export default CurrencyDisplay;
