import React, { HTMLAttributes, ReactNode } from 'react';

type BadgeProps = {
  children: ReactNode;
  className?: string;
} & HTMLAttributes<HTMLSpanElement>;

/** Status pill: terracotta-tint background, uppercase terracotta text. */
export function Badge({ children, className = '', ...rest }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-pill bg-terracotta-tint px-3 py-1 font-sans text-[12px] leading-[16px] uppercase tracking-[0.05em] text-terracotta ${className}`}
      {...rest}
    >
      {children}
    </span>
  );
}
