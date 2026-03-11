/**
 * TemplateSaveModal - Modal dialog for saving template analysis results
 * 
 * Provides a form for users to enter template metadata (name, version, SEPE URL)
 * before saving the analyzed template to the backend.
 * 
 * Features:
 * - React Hook Form for form management and validation
 * - Real-time validation with user-friendly error messages
 * - Loading states and error display
 * - Keyboard navigation and accessibility (WCAG compliant)
 * - Mobile-responsive design with Tailwind CSS
 */

import { AlertCircle, Loader2, X } from 'lucide-react';
import React, { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';

/**
 * Form data interface matching backend TemplateIngestRequest
 */
export interface TemplateSaveFormData {
  name: string;
  version: string;
  sepe_url: string;
}

/**
 * Props for TemplateSaveModal component
 */
export interface TemplateSaveModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Callback when form is submitted with valid data */
  onSave: (data: TemplateSaveFormData) => void;
  /** The PDF file being saved (for display purposes) */
  file: File;
  /** Whether the save operation is in progress */
  isLoading: boolean;
  /** Error message to display, if any */
  error: string | null;
}

/**
 * Modal dialog component for saving template analysis results
 */
const TemplateSaveModal: React.FC<TemplateSaveModalProps> = ({
  isOpen,
  onClose,
  onSave,
  file,
  isLoading,
  error,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // React Hook Form setup with validation
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TemplateSaveFormData>({
    defaultValues: {
      name: '',
      version: '',
      sepe_url: '',
    },
    mode: 'onSubmit',
  });

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  // Focus management - focus modal when opened
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

  // Handle form submission
  const onSubmit = (data: TemplateSaveFormData) => {
    if (!isLoading) {
      onSave(data);
    }
  };

  // Don't render if modal is not open
  if (!isOpen) {
    return null;
  }

  return (
    <div
      ref={overlayRef}
      data-testid="modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={handleOverlayClick}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2
            id="modal-title"
            className="text-xl font-semibold text-gray-900 dark:text-gray-100"
          >
            Guardar Plantilla
          </h2>
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
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-4">
          {/* File info */}
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <span className="font-medium">Archivo:</span> {file.name}
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div
              role="alert"
              className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md flex items-start gap-2"
            >
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Name field */}
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Nombre <span className="text-red-500" aria-label="requerido">*</span>
            </label>
            <input
              id="name"
              type="text"
              disabled={isLoading}
              aria-required="true"
              aria-invalid={errors.name ? 'true' : 'false'}
              aria-describedby={errors.name ? 'name-error' : undefined}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-100 dark:disabled:bg-gray-800"
              {...register('name', {
                required: 'El nombre es requerido',
                maxLength: {
                  value: 255,
                  message: 'El nombre no puede exceder 255 caracteres',
                },
                validate: (value) =>
                  value.trim().length > 0 || 'El nombre no puede estar vacío',
              })}
            />
            {errors.name && (
              <p
                id="name-error"
                className="mt-1 text-sm text-red-600 dark:text-red-400"
                role="alert"
              >
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Version field */}
          <div className="mb-4">
            <label
              htmlFor="version"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Versión <span className="text-red-500" aria-label="requerido">*</span>
            </label>
            <input
              id="version"
              type="text"
              disabled={isLoading}
              aria-required="true"
              aria-invalid={errors.version ? 'true' : 'false'}
              aria-describedby={errors.version ? 'version-error' : undefined}
              placeholder="ej: 1.0, 2023-Q1"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-100 dark:disabled:bg-gray-800"
              {...register('version', {
                required: 'La versión es requerida',
                maxLength: {
                  value: 50,
                  message: 'La versión no puede exceder 50 caracteres',
                },
                validate: (value) =>
                  value.trim().length > 0 || 'La versión no puede estar vacía',
              })}
            />
            {errors.version && (
              <p
                id="version-error"
                className="mt-1 text-sm text-red-600 dark:text-red-400"
                role="alert"
              >
                {errors.version.message}
              </p>
            )}
          </div>

          {/* SEPE URL field (optional) */}
          <div className="mb-6">
            <label
              htmlFor="sepe_url"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              URL SEPE <span className="text-gray-400 text-xs">(opcional)</span>
            </label>
            <input
              id="sepe_url"
              type="text"
              disabled={isLoading}
              aria-invalid={errors.sepe_url ? 'true' : 'false'}
              aria-describedby={errors.sepe_url ? 'sepe-url-error' : undefined}
              placeholder="https://www.sepe.es/..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-100 dark:disabled:bg-gray-800"
              {...register('sepe_url', {
                validate: (value) => {
                  if (!value || value.trim().length === 0) {
                    return true; // Optional field
                  }
                  // Basic URL validation
                  try {
                    new URL(value);
                    return true;
                  } catch {
                    return 'La URL no es válida';
                  }
                },
              })}
            />
            {errors.sepe_url && (
              <p
                id="sepe-url-error"
                className="mt-1 text-sm text-red-600 dark:text-red-400"
                role="alert"
              >
                {errors.sepe_url.message}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              URL de referencia del documento en el portal del SEPE
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2
                    data-testid="loading-spinner"
                    className="w-4 h-4 animate-spin"
                  />
                  <span>Guardando...</span>
                </>
              ) : (
                <span>Guardar</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TemplateSaveModal;

