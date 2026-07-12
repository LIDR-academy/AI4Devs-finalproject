import React, { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonProps = {
  variant?: 'primary' | 'ghost' | 'secondary';
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const base = 'inline-flex items-center gap-2 font-sans transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

const variantClasses: Record<'primary' | 'ghost' | 'secondary', string> = {
  primary:
    'bg-terracotta text-white rounded-pill px-6 py-3 text-[14px] font-semibold hover:opacity-90',
  ghost:
    'bg-transparent text-terracotta uppercase tracking-[0.1em] text-[14px] font-semibold hover:opacity-80',
  secondary:
    'border border-border bg-canvas text-ink rounded-pill px-6 py-3 text-[14px] font-semibold hover:bg-terracotta-tint',
};

/** Editorial button. primary = terracotta fill; secondary = neutral outlined; ghost = uppercase terracotta text (e.g. "VIEW DETAILS"). */
export function Button({
  variant = 'primary',
  className = '',
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${base} ${variantClasses[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
