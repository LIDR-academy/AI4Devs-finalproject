'use client';

type Variant = 'info' | 'error' | 'success' | 'warning';

interface StateMessageProps {
  message: string;
  variant?: Variant;
}

const stylesByVariant: Record<Variant, string> = {
  info: 'border-slate-200 bg-slate-50 text-slate-700',
  error: 'border-red-200 bg-red-50 text-red-700',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-700',
};

export default function StateMessage({ message, variant = 'info' }: StateMessageProps) {
  return <div className={`rounded-md border p-3 text-sm ${stylesByVariant[variant]}`}>{message}</div>;
}
