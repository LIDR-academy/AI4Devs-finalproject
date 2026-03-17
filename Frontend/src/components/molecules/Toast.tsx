import { useEffect, useRef } from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export function Toast({
  message,
  type = 'success',
  isVisible,
  onClose,
  duration = 3000,
}: ToastProps) {
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

  const bgColor = type === 'success' ? 'bg-emerald-50' : 'bg-red-50';
  const borderColor = type === 'success' ? 'border-emerald-200' : 'border-red-200';
  const textColor = type === 'success' ? 'text-emerald-700' : 'text-red-700';
  const role = type === 'error' ? 'alert' : 'status';
  const ariaLive = type === 'error' ? 'assertive' : 'polite';

  return (
    <div className="fixed right-4 top-4 z-50 animate-in slide-in-from-top-2 transition-all duration-300 ease-out">
      <div
        role={role}
        aria-live={ariaLive}
        aria-atomic="true"
        className={`flex items-start gap-3 rounded-xl border ${borderColor} ${bgColor} p-4 shadow-lg`}
      >
        {type === 'success' && <CheckCircle2 size={20} className={textColor} aria-hidden="true" />}
        <p className={`flex-1 text-sm font-medium ${textColor}`}>{message}</p>
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          className={`${textColor} opacity-70 hover:opacity-100 focus-visible:outline-2 focus-visible:outline-violet-600 focus-visible:outline-offset-2 rounded transition-opacity`}
          aria-label="Cerrar notificación"
          tabIndex={0}
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
