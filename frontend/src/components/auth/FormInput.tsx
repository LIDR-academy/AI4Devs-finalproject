import { AlertCircle } from "lucide-react";
import React from "react";
import type { UseFormRegister } from "react-hook-form";

interface FormInputProps {
  id: string;
  name: string;
  type: "text" | "email" | "password";
  label: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  register: UseFormRegister<any>;
  validation?: any;
  autoComplete?: string;
  disabled?: boolean;
}

const FormInput: React.FC<FormInputProps> = ({
  id,
  name,
  type,
  label,
  placeholder,
  required = false,
  error,
  register,
  validation,
  autoComplete,
  disabled = false,
}) => {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="form-field">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="required">
            *
          </span>
        )}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        disabled={disabled}
        placeholder={placeholder}
        aria-describedby={errorId}
        aria-invalid={error ? "true" : "false"}
        className={`
          appearance-none block w-full px-3 py-2 border rounded-md shadow-sm
          placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500
          sm:text-sm transition-colors
          ${
            error
              ? "border-red-300 dark:border-red-600"
              : "border-gray-300 dark:border-gray-600"
          }
          ${
            disabled
              ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
              : "bg-white dark:bg-gray-900"
          }
          dark:text-white
        `}
        {...register(name, validation)}
      />
      {error && (
        <div
          id={errorId}
          className="mt-1 flex items-center text-sm text-red-600 dark:text-red-400"
          role="alert"
        >
          <AlertCircle className="h-4 w-4 mr-1" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default FormInput;

