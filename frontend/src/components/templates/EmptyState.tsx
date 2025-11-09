/**
 * EmptyState Component
 *
 * Displays a friendly empty state message when:
 * - No templates exist in the system
 * - Search/filter returns no results
 * - Loading is complete but data is empty
 *
 * Features:
 * - Customizable title and description
 * - Optional icon display
 * - Optional action button
 * - Accessible and responsive design
 *
 * @author AI4Devs
 * @date 2025-10-25
 */

import { FileText } from 'lucide-react';
import React from 'react';

/**
 * Props for EmptyState component
 */
export interface EmptyStateProps {
  /** Title to display (defaults to "No templates found") */
  title?: string;
  /** Description text to display */
  description?: string;
  /** Whether to show the icon (defaults to true) */
  showIcon?: boolean;
  /** Optional action button configuration */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** Additional CSS classes */
  className?: string;
}

/**
 * EmptyState component for displaying when no data is available
 *
 * @example
 * ```tsx
 * // Basic usage
 * <EmptyState />
 *
 * // With custom message
 * <EmptyState
 *   title="No matching templates"
 *   description="Try adjusting your search or filters"
 * />
 *
 * // With action button
 * <EmptyState
 *   action={{
 *     label: 'Upload Template',
 *     onClick: () => navigate('/upload')
 *   }}
 * />
 * ```
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No templates found',
  description = 'No templates have been uploaded yet.',
  showIcon = true,
  action,
  className = '',
}) => {
  return (
    <div
      className={`empty-state flex flex-col items-center justify-center py-16 px-4 ${className}`}
    >
      {showIcon && (
        <div className="mb-4 text-gray-300 dark:text-gray-600">
          <FileText size={64} aria-hidden="true" strokeWidth={1.5} />
        </div>
      )}

      <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
        {title}
      </h2>

      <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-6">
        {description}
      </p>

      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          type="button"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;

