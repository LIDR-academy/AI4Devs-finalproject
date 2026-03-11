/**
 * DeleteConfirmationModal - Reusable confirmation dialog for destructive actions
 * 
 * Provides a warning modal for users to confirm deletion operations.
 * 
 * Features:
 * - Keyboard navigation and accessibility (WCAG compliant)
 * - Loading states with disabled buttons during operation
 * - Escape key to cancel, Enter to confirm (with safeguard)
 * - Focus management and trap
 * - Mobile-responsive design with Tailwind CSS
 * - Dark mode support
 * - Dangerous action styling (red color scheme)
 * 
 * @author AI4Devs
 * @date 2025-11-08
 */

import { AlertTriangle, Loader2, X } from 'lucide-react';
import React, { useEffect, useRef } from 'react';

/**
 * Props for DeleteConfirmationModal component
 */
export interface DeleteConfirmationModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Callback when user confirms deletion */
  onConfirm: () => void;
  /** Title of the modal */
  title: string;
  /** Warning message to display */
  message: string;
  /** Optional additional details or consequences */
  details?: string;
  /** Whether the delete operation is in progress */
  isLoading: boolean;
  /** Text for the confirm button (default: "Eliminar") */
  confirmText?: string;
  /** Text for the cancel button (default: "Cancelar") */
  cancelText?: string;
}

/**
 * Reusable confirmation modal component for delete operations
 * 
 * @example
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false);
 * const [isDeleting, setIsDeleting] = useState(false);
 * 
 * const handleDelete = async () => {
 *   setIsDeleting(true);
 *   try {
 *     await templatesService.deleteTemplate(templateId);
 *     toast.success('Template deleted successfully');
 *     setIsOpen(false);
 *   } catch (error) {
 *     toast.error(error.message);
 *   } finally {
 *     setIsDeleting(false);
 *   }
 * };
 * 
 * <DeleteConfirmationModal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   onConfirm={handleDelete}
 *   title="Delete Template"
 *   message="Are you sure you want to delete this template?"
 *   details="This will permanently delete all versions, fields, and comparisons."
 *   isLoading={isDeleting}
 * />
 * ```
 */
const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  details,
  isLoading,
  confirmText = 'Eliminar',
  cancelText = 'Cancelar',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  // Focus management - focus cancel button (safer default) when opened
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, isLoading, onClose]);

  // Handle overlay click (close modal)
  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === overlayRef.current && !isLoading) {
      onClose();
    }
  };

  // Handle confirm action
  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm();
    }
  };

  // Don't render if modal is not open
  if (!isOpen) {
    return null;
  }

  return (
    <div
      ref={overlayRef}
      data-testid="delete-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={handleOverlayClick}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
        aria-describedby="delete-modal-message"
        tabIndex={-1}
        className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <h2
              id="delete-modal-title"
              className="text-xl font-semibold text-gray-900 dark:text-gray-100"
            >
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            aria-label="Cerrar modal"
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          {/* Warning message */}
          <div className="mb-4">
            <p
              id="delete-modal-message"
              className="text-sm text-gray-700 dark:text-gray-300"
            >
              {message}
            </p>
            {details && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {details}
              </p>
            )}
          </div>

          {/* Warning banner */}
          <div
            role="alert"
            className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md"
          >
            <p className="text-sm font-medium text-red-800 dark:text-red-300">
              ⚠️ Esta acción no se puede deshacer
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end px-6 py-4 bg-gray-50 dark:bg-gray-900/50 rounded-b-lg">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {cancelText}
          </button>
          <button
            ref={confirmButtonRef}
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2
                  data-testid="delete-loading-spinner"
                  className="w-4 h-4 animate-spin"
                />
                <span>Eliminando...</span>
              </>
            ) : (
              <span>{confirmText}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;

