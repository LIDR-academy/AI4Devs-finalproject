import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import { Input } from '../atoms/Input';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

/**
 * FormField molecule component
 * Composed component combining Input atom with label and error handling
 */
export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, ...props }, ref) => {
    return <Input ref={ref} label={label} error={error} {...props} />;
  },
);

FormField.displayName = 'FormField';
