'use client';

import type {
  FieldError,
  FieldValues,
  Path,
  UseFormRegister,
} from 'react-hook-form';
import { cn } from '@/shared/lib/cn';

interface TechnicalNotesFieldProps<T extends FieldValues> {
  label: string;
  id: string;
  name: Path<T>;
  register?: UseFormRegister<T>;
  error?: FieldError;
  maxLength?: number;
  readOnly?: boolean;
  value?: string | null;
  currentLength?: number;
}

export function TechnicalNotesField<T extends FieldValues>({
  label,
  id,
  name,
  register,
  error,
  maxLength = 5000,
  readOnly = false,
  value = null,
  currentLength = 0,
}: TechnicalNotesFieldProps<T>) {
  if (readOnly) {
    return (
      <div className="space-y-1">
        <p className="text-sm font-medium text-slate-700">{label}</p>
        {value ? (
          <p className="whitespace-pre-wrap text-sm text-slate-800">{value}</p>
        ) : (
          <p className="text-sm italic text-slate-500">Sin registro</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <textarea
        id={id}
        rows={3}
        maxLength={maxLength}
        className={cn(
          'w-full rounded-lg border px-3 py-2 text-slate-900 outline-none ring-blue-500 focus:ring-2',
          error ? 'border-red-500' : 'border-slate-300',
        )}
        {...(register ? register(name) : {})}
      />
      <div className="flex items-center justify-between gap-2">
        {error ? (
          <p className="text-sm text-red-600">{error.message}</p>
        ) : (
          <span />
        )}
        <p className="text-xs text-slate-500">
          {currentLength} / {maxLength}
        </p>
      </div>
    </div>
  );
}
