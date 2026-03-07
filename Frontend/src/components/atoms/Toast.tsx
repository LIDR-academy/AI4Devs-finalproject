import { useEffect, useRef } from 'react';
import { X, CheckCircle2 } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  isVisible?: boolean;
  onClose: () => void;
  duration?: number;
}

/**
 * Toast atom component
 * Simple toast notification for user feedback
 * Follows Design System Guide: rounded-xl, appropriate colors
 * Supports both visible prop (controlled) and auto-hide (uncontrolled)
 */
export const Toast = ({
  message,
  type = 'info',
  isVisible = true,
  onClose,
  duration = 3000,
}: ToastProps) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isVisible, duration, onClose]);

  // Auto-focus close button when toast appears for keyboard accessibility
  useEffect(() => {
    if (isVisible && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const bgColors = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-slate-50 border-slate-200 text-slate-800',
  };

  const focusRingColors = {
    success: 'focus-visible:ring-emerald-600',
    error: 'focus-visible:ring-red-600',
    info: 'focus-visible:ring-slate-600',
  };

  const role = type === 'error' ? 'alert' : 'status';
  const ariaLive = type === 'error' ? 'assertive' : 'polite';

  return (
    <div
      role={role}
      aria-live={ariaLive}
      aria-atomic="true"
      className={`fixed bottom-32 left-1/2 -translate-x-1/2 z-50 max-w-md w-full mx-4 px-4 py-3 rounded-xl border shadow-lg flex items-center justify-between ${bgColors[type]}`}
    >
      {type === 'success' && (
        <CheckCircle2 size={20} className="text-emerald-700 flex-shrink-0" aria-hidden="true" />
      )}
      <p className="text-sm font-medium flex-1">{message}</p>
      <button
        ref={closeButtonRef}
        type="button"
        onClick={onClose}
        className={`ml-4 text-current opacity-70 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 ${focusRingColors[type]} focus-visible:ring-offset-2 rounded transition-opacity`}
        aria-label="Cerrar notificación"
        tabIndex={0}
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
};
