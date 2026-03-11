/**
 * VersionUploadModal - Modal dialog for uploading new template versions
 * 
 * Allows users to select an existing template and upload a new version
 * of the PDF document with optional metadata (change summary, SEPE URL).
 * 
 * Features:
 * - React Hook Form for form management and validation
 * - Template selector with search functionality
 * - Real-time validation with user-friendly error messages
 * - Loading states and error display
 * - Keyboard navigation and accessibility (WCAG compliant)
 * - Mobile-responsive design with Tailwind CSS
 */

import { AlertCircle, FileText, Loader2, Search, X } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { TemplateNameItem } from '../../types/templates.types';

/**
 * Form data interface for version upload
 */
export interface VersionUploadFormData {
  template_id: number;
  version: string;
  change_summary: string;
  sepe_url: string;
}

/**
 * Props for VersionUploadModal component
 */
export interface VersionUploadModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Callback when form is submitted with valid data */
  onSave: (data: VersionUploadFormData) => void;
  /** The PDF file being uploaded (for display purposes) */
  file: File;
  /** Whether the save operation is in progress */
  isLoading: boolean;
  /** Error message to display, if any */
  error: string | null;
  /** Function to fetch template names with optional search */
  fetchTemplateNames: (search?: string) => Promise<TemplateNameItem[]>;
}

/**
 * Modal dialog component for uploading new template versions
 */
const VersionUploadModal: React.FC<VersionUploadModalProps> = ({
  isOpen,
  onClose,
  onSave,
  file,
  isLoading,
  error,
  fetchTemplateNames,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  
  // Template selector state
  const [templates, setTemplates] = useState<TemplateNameItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [templatesError, setTemplatesError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateNameItem | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // React Hook Form setup with validation
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<VersionUploadFormData>({
    defaultValues: {
      template_id: 0,
      version: '',
      change_summary: '',
      sepe_url: '',
    },
    mode: 'onSubmit',
  });

  const template_id = watch('template_id');

  // Load templates when modal opens
  useEffect(() => {
    if (isOpen) {
      loadTemplates('');
    }
  }, [isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      reset();
      setSearchTerm('');
      setSelectedTemplate(null);
      setTemplatesError(null);
      setShowDropdown(false);
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
        if (showDropdown) {
          setShowDropdown(false);
        } else {
          onClose();
        }
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
  }, [isOpen, isLoading, showDropdown, onClose]);

  // Load templates function
  const loadTemplates = useCallback(async (search: string) => {
    setLoadingTemplates(true);
    setTemplatesError(null);
    try {
      const results = await fetchTemplateNames(search || undefined);
      setTemplates(results);
    } catch (err) {
      setTemplatesError(
        err instanceof Error ? err.message : 'Error al cargar plantillas'
      );
      setTemplates([]);
    } finally {
      setLoadingTemplates(false);
    }
  }, [fetchTemplateNames]);

  // Handle search input change with debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (isOpen && showDropdown) {
        loadTemplates(searchTerm);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, isOpen, showDropdown, loadTemplates]);

  // Handle template selection
  const handleTemplateSelect = (template: TemplateNameItem) => {
    setSelectedTemplate(template);
    setValue('template_id', template.id, { shouldValidate: true });
    setSearchTerm(template.name);
    setShowDropdown(false);
  };

  // Handle overlay click (close modal)
  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === overlayRef.current && !isLoading) {
      onClose();
    }
  };

  // Handle form submission
  const onSubmit = (data: VersionUploadFormData) => {
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
        className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h2
            id="modal-title"
            className="text-xl font-semibold text-gray-900 dark:text-gray-100"
          >
            Guardar Nueva Versión
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
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md flex items-start gap-2">
            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                Archivo a subir
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                {file.name}
              </p>
            </div>
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

          {/* Template selector */}
          <div className="mb-4">
            <label
              htmlFor="template-search"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Seleccionar Plantilla <span className="text-red-500" aria-label="requerido">*</span>
            </label>
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  id="template-search"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setShowDropdown(true)}
                  disabled={isLoading}
                  placeholder="Buscar plantilla..."
                  aria-autocomplete="list"
                  aria-controls="template-dropdown"
                  aria-expanded={showDropdown}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-100 dark:disabled:bg-gray-800"
                />
              </div>
              
              {/* Dropdown */}
              {showDropdown && (
                <div
                  id="template-dropdown"
                  role="listbox"
                  className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto"
                >
                  {loadingTemplates ? (
                    <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Cargando plantillas...</span>
                    </div>
                  ) : templatesError ? (
                    <div className="px-4 py-3 text-sm text-red-600 dark:text-red-400">
                      {templatesError}
                    </div>
                  ) : templates.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      No se encontraron plantillas
                    </div>
                  ) : (
                    templates.map((template) => (
                      <button
                        key={template.id}
                        type="button"
                        role="option"
                        aria-selected={selectedTemplate?.id === template.id}
                        onClick={() => handleTemplateSelect(template)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-600 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {template.name}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                            {template.current_version}
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            
            {/* Hidden input for form validation */}
            <input
              type="hidden"
              {...register('template_id', {
                validate: (value) =>
                  value > 0 || 'Debe seleccionar una plantilla',
              })}
            />
            
            {errors.template_id && (
              <p
                className="mt-1 text-sm text-red-600 dark:text-red-400"
                role="alert"
              >
                {errors.template_id.message}
              </p>
            )}
            
            {selectedTemplate && (
              <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-md">
                <p className="text-sm text-green-800 dark:text-green-300">
                  <span className="font-medium">Plantilla seleccionada:</span> {selectedTemplate.name}
                  <span className="text-xs ml-2">({selectedTemplate.current_version})</span>
                </p>
              </div>
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
              placeholder="ej: 2024-Q2, v2.0"
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

          {/* Change summary field (optional) */}
          <div className="mb-4">
            <label
              htmlFor="change_summary"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Resumen de Cambios <span className="text-gray-400 text-xs">(opcional)</span>
            </label>
            <textarea
              id="change_summary"
              rows={3}
              disabled={isLoading}
              aria-describedby="change-summary-help"
              placeholder="Describe los cambios en esta versión..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-100 dark:disabled:bg-gray-800 resize-none"
              {...register('change_summary')}
            />
            <p
              id="change-summary-help"
              className="mt-1 text-xs text-gray-500 dark:text-gray-400"
            >
              Describe qué ha cambiado respecto a la versión anterior (campos añadidos, eliminados, modificados)
            </p>
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
              aria-describedby={errors.sepe_url ? 'sepe-url-error' : 'sepe-url-help'}
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
            <p
              id="sepe-url-help"
              className="mt-1 text-xs text-gray-500 dark:text-gray-400"
            >
              URL de referencia del documento actualizado en el portal del SEPE
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
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
              disabled={isLoading || !selectedTemplate}
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
                <span>Guardar Versión</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VersionUploadModal;

