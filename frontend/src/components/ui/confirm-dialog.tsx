import { AlertTriangle, X } from "lucide-react";
import { ActionButton } from "./action-button";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "primary";
  loading?: boolean;
}

export const ConfirmDialog = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  loading = false
}: ConfirmDialogProps) => {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: "text-red-600",
      bg: "from-red-50 to-red-100",
      border: "border-red-200"
    },
    warning: {
      icon: "text-orange-600", 
      bg: "from-orange-50 to-orange-100",
      border: "border-orange-200"
    },
    primary: {
      icon: "text-blue-600",
      bg: "from-blue-50 to-blue-100", 
      border: "border-blue-200"
    }
  };

  const styles = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onCancel}
      />
      
      {/* Dialog */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 animate-scale-in">
        {/* Header */}
        <div className={`bg-gradient-to-r ${styles.bg} ${styles.border} border-b px-6 py-4 rounded-t-xl`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className={`w-6 h-6 ${styles.icon}`} />
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <p className="text-gray-700 leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <ActionButton
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </ActionButton>
          <ActionButton
            variant={variant}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </ActionButton>
        </div>
      </div>
    </div>
  );
}; 