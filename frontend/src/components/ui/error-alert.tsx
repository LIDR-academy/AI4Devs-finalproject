import { AlertCircle, X } from "lucide-react";

interface ErrorAlertProps {
  error: string;
  onClose?: () => void;
  className?: string;
}

export const ErrorAlert = ({ error, onClose, className = "" }: ErrorAlertProps) => {
  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 animate-slide-up ${className}`}>
      <div className="flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800">Error</h3>
          <div className="mt-1 text-sm text-red-700">{error}</div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="ml-auto text-red-600 hover:text-red-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}; 