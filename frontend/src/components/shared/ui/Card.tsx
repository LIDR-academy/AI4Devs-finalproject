import React, { HTMLAttributes, ReactNode } from 'react';

type CardProps = {
  children: ReactNode;
  className?: string;
} & HTMLAttributes<HTMLDivElement>;

/** White editorial surface: rounded-8, warm rose-beige border. Presentational only. */
export function Card({ children, className = '', ...rest }: CardProps) {
  return (
    <div
      className={`bg-surface rounded-card border border-border ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
