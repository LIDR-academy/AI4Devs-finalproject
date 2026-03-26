import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  title?: string;
  className?: string;
}

/**
 * Card molecule component
 * Composed component using atoms for card layout
 */
export const Card = ({ children, title, className = '' }: CardProps) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {title && <h3 className="text-xl font-semibold text-gray-900 mb-4">{title}</h3>}
      {children}
    </div>
  );
};
