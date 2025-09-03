import React, { useState, useEffect } from 'react';
import { TextField, TextFieldProps } from '@mui/material';
import { currencyMask, currencyInputToNumber, formatCurrencyForInput } from '@/utils/currency';

interface CurrencyInputProps extends Omit<TextFieldProps, 'onChange' | 'value'> {
  value: number | string;
  onChange: (value: number) => void;
  currency?: string;
  locale?: string;
  showCurrencySymbol?: boolean;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onChange,
  currency = 'MXN',
  locale = 'es-MX',
  showCurrencySymbol = true,
  ...textFieldProps
}) => {
  const [displayValue, setDisplayValue] = useState('');

  // Actualizar displayValue cuando cambie el value prop
  useEffect(() => {
    if (value !== undefined && value !== null && value !== '') {
      const numericValue = typeof value === 'string' ? parseFloat(value) : value;
      if (!isNaN(numericValue)) {
        setDisplayValue(formatCurrencyForInput(numericValue, locale));
      }
    } else {
      setDisplayValue('');
    }
  }, [value, locale]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    const maskedValue = currencyMask(inputValue);
    const numericValue = currencyInputToNumber(maskedValue);
    
    setDisplayValue(maskedValue);
    onChange(numericValue);
  };

  const handleBlur = () => {
    if (displayValue) {
      const numericValue = currencyInputToNumber(displayValue);
      setDisplayValue(formatCurrencyForInput(numericValue, locale));
    }
  };

  const handleFocus = () => {
    if (displayValue) {
      const numericValue = currencyInputToNumber(displayValue);
      setDisplayValue(numericValue.toString());
    }
  };

  return (
    <TextField
      {...textFieldProps}
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      InputProps={{
        ...textFieldProps.InputProps,
        startAdornment: showCurrencySymbol ? (
          <span style={{ marginRight: 8, color: '#666' }}>
            {currency === 'MXN' ? '$' : currency}
          </span>
        ) : undefined,
      }}
      placeholder={showCurrencySymbol ? '0.00' : '0'}
    />
  );
};

export default CurrencyInput;
