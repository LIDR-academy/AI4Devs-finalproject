import type { HTMLAttributes, ReactNode } from 'react';
import './Card.css';

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  title?: string;
  subtitle?: string;
  children: ReactNode;
};

export function Card({ title, subtitle, children, className = '', ...rest }: CardProps) {
  return (
    <div className={`ui-card ${className}`.trim()} {...rest}>
      {title ? <h3 className="ui-card__title">{title}</h3> : null}
      {subtitle ? <p className="ui-card__subtitle">{subtitle}</p> : null}
      {children}
    </div>
  );
}

export type BadgeVariant = 'default' | 'accent' | 'kpi';

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
  children: ReactNode;
};

export function Badge({ variant = 'default', className = '', children, ...rest }: BadgeProps) {
  return (
    <span className={`ui-badge ui-badge--${variant} ${className}`.trim()} {...rest}>
      {children}
    </span>
  );
}
