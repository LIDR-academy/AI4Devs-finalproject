import React, { HTMLAttributes, ReactNode } from 'react';

type LabelProps = {
  children: ReactNode;
  className?: string;
} & HTMLAttributes<HTMLSpanElement>;

/** Editorial micro-label: Inter, uppercase, wide tracking, 12px taupe. */
export function Label({ children, className = '', ...rest }: LabelProps) {
  return (
    <span
      className={`font-sans uppercase text-taupe text-[12px] leading-[16px] tracking-[0.1em] ${className}`}
      {...rest}
    >
      {children}
    </span>
  );
}
