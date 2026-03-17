import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

/**
 * Input atom component
 * Basic reusable input component with label and error handling
 * Follows Design System Guide: 48px min height, 16px font size, violet focus
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor={props.id}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full min-h-[48px] px-4 text-base border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-600 focus-visible:ring-2 focus-visible:ring-violet-600 focus:border-transparent transition-colors ${
            error
              ? 'border-red-500 bg-red-50 focus:ring-red-500 focus-visible:ring-red-500'
              : 'border-slate-300 bg-white hover:border-slate-400'
          } ${className}`}
          style={{ fontSize: '16px' }}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
