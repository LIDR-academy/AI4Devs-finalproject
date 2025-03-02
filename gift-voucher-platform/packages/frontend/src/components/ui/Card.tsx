import React, { ReactNode } from 'react';
import { classNames } from '@/utils/classNames';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  footer?: ReactNode;
}

export default function Card({ children, className, title, footer }: CardProps) {
  return (
    <div className={classNames(
      'bg-white rounded-lg shadow-sm overflow-hidden',
      className || ''
    )}>
      {title && (
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        </div>
      )}
      <div className="px-4 py-5 sm:p-6">{children}</div>
      {footer && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          {footer}
        </div>
      )}
    </div>
  );
} 