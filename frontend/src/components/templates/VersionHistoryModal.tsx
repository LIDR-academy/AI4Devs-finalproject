/**
 * VersionHistoryModal Component
 *
 * Modal dialog for displaying template version history with:
 * - Timeline layout showing all versions
 * - Current version highlighting
 * - Version metadata (author, dates, page count, size)
 * - Pagination for many versions
 * - Loading and error states
 * - ESC key and click-outside to close
 * - Focus management and accessibility
 *
 * @author AI4Devs
 * @date 2025-10-25
 */

import { CheckCircle, Clock, Loader2, Trash2, User, X } from 'lucide-react';
import React, { useEffect, useRef } from 'react';
import type { TemplateVersion } from '../../types/templates.types';
import { formatDate } from '../../utils/formatters';
import TablePagination from './TablePagination';

/**
 * Props for VersionHistoryModal component
 */
export interface VersionHistoryModalProps {
  /** Whether modal is open */
  isOpen: boolean;
  /** Callback to close modal */
  onClose: () => void;
  /** Template name to display in title */
  templateName: string;
  /** Template ID for delete operations */
  templateId: number | null;
  /** Array of versions to display */
  versions: TemplateVersion[];
  /** Whether versions are loading */
  isLoading: boolean;
  /** Error message if loading failed */
  error: string | null;
  /** Current page number */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Callback when delete version is requested */
  onDeleteVersion?: (templateId: number, versionId: number, versionNumber: string) => void;
}

/**
 * VersionHistoryModal component for displaying template version history
 *
 * @example
 * ```tsx
 * <VersionHistoryModal
 *   isOpen={isModalOpen}
 *   onClose={() => setIsModalOpen(false)}
 *   templateName="SEPE Template"
 *   versions={versions}
 *   isLoading={isLoading}
 *   error={error}
 *   currentPage={currentPage}
 *   totalPages={totalPages}
 *   onPageChange={setPage}
 * />
 * ```
 */
const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  isOpen,
  onClose,
  templateName,
  templateId,
  versions,
  isLoading,
  error,
  currentPage,
  totalPages,
  onPageChange,
  onDeleteVersion,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Focus management
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  // Handle click outside modal
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={handleOverlayClick}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="version-history-title"
        tabIndex={-1}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2
            id="version-history-title"
            className="text-2xl font-semibold text-gray-900 dark:text-gray-100"
          >
            Version History - {templateName}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            type="button"
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="animate-spin text-blue-600" size={48} />
            </div>
          )}

          {error && !isLoading && (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <p className="text-red-600 dark:text-red-400 mb-2">
                  {error}
                </p>
                <button
                  onClick={onClose}
                  className="text-blue-600 hover:text-blue-700 underline"
                  type="button"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {!isLoading && !error && versions.length === 0 && (
            <div className="flex items-center justify-center py-16">
              <p className="text-gray-500 dark:text-gray-400">
                No versions found
              </p>
            </div>
          )}

          {!isLoading && !error && versions.length > 0 && (
            <div className="space-y-6">
              {versions.map((version, index) => (
                <div
                  key={version.id}
                  className={`relative pl-8 pb-6 ${
                    index !== versions.length - 1
                      ? 'border-l-2 border-gray-200 dark:border-gray-700'
                      : ''
                  }`}
                >
                  {/* Timeline dot */}
                  <div
                    className={`absolute left-0 top-0 -ml-[9px] w-4 h-4 rounded-full ${
                      version.is_current
                        ? 'bg-blue-600 ring-4 ring-blue-100 dark:ring-blue-900'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />

                  {/* Version card */}
                  <div
                    className={`ml-4 p-4 rounded-lg border ${
                      version.is_current
                        ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
                        : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                          Version {version.version_number}
                        </h3>
                        {version.is_current && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/50 rounded">
                            <CheckCircle size={12} />
                            Current
                          </span>
                        )}
                      </div>
                      
                      {/* Delete button */}
                      {onDeleteVersion && templateId && (
                        <div>
                          {version.is_current ? (
                            <button
                              type="button"
                              disabled
                              title="Cannot delete current version"
                              className="p-2 text-gray-300 dark:text-gray-600 cursor-not-allowed rounded"
                              aria-label="Cannot delete current version"
                            >
                              <Trash2 size={18} />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onDeleteVersion(templateId, version.id, version.version_number)}
                              title="Delete version"
                              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/20 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                              aria-label={`Delete version ${version.version_number}`}
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <User size={16} />
                        <span>
                          <span className="font-medium">Author:</span>{' '}
                          {version.author || 'Unknown'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Clock size={16} />
                        <span>
                          <span className="font-medium">Created:</span>{' '}
                          {formatDate(version.created_at)}
                        </span>
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Pages:</span>{' '}
                        {version.page_count}
                      </div>
                    </div>

                    {version.subject && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Subject:</span>{' '}
                          {version.subject}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with pagination */}
        {!isLoading && !error && versions.length > 0 && totalPages > 1 && (
          <div className="border-t border-gray-200 dark:border-gray-700">
            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={20}
              totalItems={totalPages * 20}
              onPageChange={onPageChange}
              onPageSizeChange={() => {}}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default VersionHistoryModal;

