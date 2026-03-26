import { Button } from '../atoms/Button';
import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

/**
 * ErrorState molecule component
 * Displays error message with optional retry button
 * Follows Design System Guide: actionable error states
 */
export const ErrorState = ({ message, onRetry, className = '' }: ErrorStateProps) => {
  return (
    <div className={`flex flex-col items-center justify-center gap-4 p-6 ${className}`}>
      <div className="flex items-center gap-3 text-red-600">
        <AlertCircle size={24} aria-hidden="true" />
        <p className="text-sm font-medium text-center">{message}</p>
      </div>
      {onRetry && (
        <Button variant="primary" size="md" onClick={onRetry} className="min-w-[120px]">
          Reintentar
        </Button>
      )}
    </div>
  );
};
