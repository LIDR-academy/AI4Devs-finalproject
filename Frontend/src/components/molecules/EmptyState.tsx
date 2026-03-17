import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

/**
 * EmptyState molecule component
 * Reusable component for empty states throughout the application
 * Follows Design System Guide: centered layout, slate-300 icon, clear hierarchy
 */
/**
 * EmptyState molecule component
 * Reusable component for empty states throughout the application
 * Follows Design System Guide: centered layout, slate-300 icon, clear hierarchy
 *
 * Note: The icon prop should include aria-hidden="true" if it's decorative.
 * This component wraps the icon in a div with aria-hidden for accessibility.
 */
export const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-6 py-8">
      {icon && (
        <div className="text-slate-300 mb-4" aria-hidden="true">
          {icon}
        </div>
      )}
      <h2 className="text-2xl font-heading font-bold text-slate-900 mb-2 text-center">{title}</h2>
      {description && <p className="text-slate-600 text-center mb-6 max-w-md">{description}</p>}
      {action && <div className="w-full max-w-xs flex justify-center">{action}</div>}
    </div>
  );
};
