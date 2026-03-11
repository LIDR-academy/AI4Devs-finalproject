/**
 * TemplateFieldsModal Component
 *
 * Modal dialog for displaying template AcroForm fields with:
 * - Table display of all fields
 * - Color-coded field type badges
 * - Search by field_id or near_text
 * - Filter by page number
 * - Pagination
 * - Field position coordinates
 * - Loading and error states
 * - ESC key and click-outside to close
 * - Focus management and accessibility
 *
 * @author AI4Devs
 * @date 2025-10-25
 */

import { Loader2, X } from 'lucide-react';
import React, { useEffect, useRef } from 'react';
import type { TemplateField, VersionInfo } from '../../types/templates.types';
import { FIELD_TYPE_COLORS, FIELD_TYPE_LABELS } from '../../types/templates.types';
import TablePagination from './TablePagination';

/**
 * Props for TemplateFieldsModal component
 */
export interface TemplateFieldsModalProps {
  /** Whether modal is open */
  isOpen: boolean;
  /** Callback to close modal */
  onClose: () => void;
  /** Template name to display in title */
  templateName: string;
  /** Array of fields to display */
  fields: TemplateField[];
  /** Version information */
  versionInfo: VersionInfo | null;
  /** Whether fields are loading */
  isLoading: boolean;
  /** Error message if loading failed */
  error: string | null;
  /** Current page number */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Current search query */
  search: string;
  /** Current page number filter */
  pageNumber: number | null;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Callback when search changes */
  onSearchChange: (search: string) => void;
  /** Callback when page number filter changes */
  onPageNumberFilter: (page: number) => void;
  /** Callback to clear page filter */
  onClearPageFilter: () => void;
}

/**
 * TemplateFieldsModal component for displaying template form fields
 *
 * @example
 * ```tsx
 * <TemplateFieldsModal
 *   isOpen={isModalOpen}
 *   onClose={() => setIsModalOpen(false)}
 *   templateName="SEPE Template"
 *   fields={fields}
 *   versionInfo={versionInfo}
 *   isLoading={isLoading}
 *   error={error}
 *   currentPage={currentPage}
 *   totalPages={totalPages}
 *   search={search}
 *   pageNumber={pageNumber}
 *   onPageChange={setPage}
 *   onSearchChange={setSearch}
 *   onPageNumberFilter={setPageNumber}
 *   onClearPageFilter={clearPageNumber}
 * />
 * ```
 */
const TemplateFieldsModal: React.FC<TemplateFieldsModalProps> = ({
  isOpen,
  onClose,
  templateName,
  fields,
  versionInfo,
  isLoading,
  error,
  currentPage,
  totalPages,
  search,
  pageNumber,
  onPageChange,
  onSearchChange,
  onPageNumberFilter,
  onClearPageFilter,
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

  // Generate page options for filter dropdown
  const pageCount = versionInfo?.page_count || 1;
  const pageOptions = Array.from({ length: pageCount }, (_, i) => i + 1);

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
        aria-labelledby="fields-modal-title"
        tabIndex={-1}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2
              id="fields-modal-title"
              className="text-2xl font-semibold text-gray-900 dark:text-gray-100"
            >
              Form Fields - {templateName}
            </h2>
            {versionInfo && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Version {versionInfo.version_number} • {versionInfo.page_count}{' '}
                pages
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            type="button"
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <X size={24} />
          </button>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search fields by ID or nearby text..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Page filter */}
            <div className="flex items-center gap-2">
              <label
                htmlFor="page-filter"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap"
              >
                Filter by page:
              </label>
              <select
                id="page-filter"
                value={pageNumber || ''}
                onChange={(e) =>
                  e.target.value
                    ? onPageNumberFilter(Number(e.target.value))
                    : onClearPageFilter()
                }
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All pages</option>
                {pageOptions.map((page) => (
                  <option key={page} value={page}>
                    Page {page}
                  </option>
                ))}
              </select>
              {pageNumber && (
                <button
                  onClick={onClearPageFilter}
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline"
                >
                  Clear filter
                </button>
              )}
            </div>
          </div>
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
                <p className="text-red-600 dark:text-red-400 mb-2">{error}</p>
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

          {!isLoading && !error && fields.length === 0 && (
            <div className="flex items-center justify-center py-16">
              <p className="text-gray-500 dark:text-gray-400">
                No fields found
              </p>
            </div>
          )}

          {!isLoading && !error && fields.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      Field ID
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      Type
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      Nearby Text
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      Page
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      Position
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {fields.map((field) => (
                    <tr
                      key={field.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-gray-100">
                        {field.field_id}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            FIELD_TYPE_COLORS[field.field_type] ||
                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {FIELD_TYPE_LABELS[field.field_type] ||
                            field.field_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {field.near_text || '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {field.page_number}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-600 dark:text-gray-400">
                        {field.position_data
                          ? `(${field.position_data.x0.toFixed(1)}, ${field.position_data.y0.toFixed(1)})`
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer with pagination */}
        {!isLoading && !error && fields.length > 0 && totalPages > 1 && (
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

export default TemplateFieldsModal;

