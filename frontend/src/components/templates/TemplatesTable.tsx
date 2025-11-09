/**
 * TemplatesTable Component
 *
 * Main table component for displaying templates list with:
 * - Sortable columns
 * - Template data display (name, version, size, fields, last updated)
 * - Action buttons for each row
 * - Loading states
 * - Empty states
 * - Responsive design
 * - Accessible table structure
 *
 * @author AI4Devs
 * @date 2025-10-25
 */

import { ArrowDown, ArrowUp, Loader2 } from 'lucide-react';
import React from 'react';
import type { Template } from '../../types/templates.types';
import { formatFileSize, formatRelativeTime } from '../../utils/formatters';
import EmptyState from './EmptyState';
import TemplateActionsMenu from './TemplateActionsMenu';

/**
 * Props for TemplatesTable component
 */
export interface TemplatesTableProps {
  /** Array of templates to display */
  templates: Template[];
  /** Whether data is currently loading */
  isLoading: boolean;
  /** Current sort field */
  sortBy: string;
  /** Current sort order */
  sortOrder: 'asc' | 'desc';
  /** Callback when sort is requested */
  onSort: (field: string) => void;
  /** Callback when download is requested */
  onDownload: (templateId: number, templateName: string) => void;
  /** Callback when view versions is requested */
  onViewVersions: (templateId: number) => void;
  /** Callback when view fields is requested */
  onViewFields: (templateId: number) => void;
  /** Callback when delete is requested */
  onDelete: (templateId: number, templateName: string) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Sortable column header component
 */
interface SortableHeaderProps {
  field: string;
  label: string;
  currentSort: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
}

const SortableHeader: React.FC<SortableHeaderProps> = ({
  field,
  label,
  currentSort,
  sortOrder,
  onSort,
}) => {
  const isSorted = currentSort === field;

  return (
    <th scope="col" className="px-6 py-3 text-left">
      <button
        onClick={() => onSort(field)}
        className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none focus:underline"
        type="button"
      >
        {label}
        {isSorted && (
          <span className="text-blue-600 dark:text-blue-400">
            {sortOrder === 'asc' ? (
              <ArrowUp size={14} />
            ) : (
              <ArrowDown size={14} />
            )}
          </span>
        )}
      </button>
    </th>
  );
};

/**
 * TemplatesTable component for displaying templates in a table format
 *
 * @example
 * ```tsx
 * <TemplatesTable
 *   templates={templates}
 *   isLoading={isLoading}
 *   sortBy="updated_at"
 *   sortOrder="desc"
 *   onSort={handleSort}
 *   onDownload={handleDownload}
 *   onViewVersions={handleViewVersions}
 *   onViewFields={handleViewFields}
 * />
 * ```
 */
const TemplatesTable: React.FC<TemplatesTableProps> = ({
  templates,
  isLoading,
  sortBy,
  sortOrder,
  onSort,
  onDownload,
  onViewVersions,
  onViewFields,
  onDelete,
  className = '',
}) => {
  // Show loading state
  if (isLoading) {
    return (
      <div
        className={`flex items-center justify-center py-16 ${className}`}
      >
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  // Show empty state if no templates
  if (templates.length === 0) {
    return (
      <div className={className}>
        <EmptyState />
      </div>
    );
  }

  return (
    <div className={`templates-table overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <SortableHeader
              field="name"
              label="Name"
              currentSort={sortBy}
              sortOrder={sortOrder}
              onSort={onSort}
            />
            <SortableHeader
              field="version"
              label="Version"
              currentSort={sortBy}
              sortOrder={sortOrder}
              onSort={onSort}
            />
            <SortableHeader
              field="file_size_bytes"
              label="Size"
              currentSort={sortBy}
              sortOrder={sortOrder}
              onSort={onSort}
            />
            <SortableHeader
              field="field_count"
              label="Fields"
              currentSort={sortBy}
              sortOrder={sortOrder}
              onSort={onSort}
            />
            <SortableHeader
              field="updated_at"
              label="Last Updated"
              currentSort={sortBy}
              sortOrder={sortOrder}
              onSort={onSort}
            />
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {templates.map((template) => (
            <tr
              key={template.id}
              className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {template.name}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {template.current_version}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {template.file_size_bytes ? formatFileSize(template.file_size_bytes) : '—'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {template.field_count ?? '—'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {template.updated_at ? formatRelativeTime(template.updated_at) : '—'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <TemplateActionsMenu
                  templateId={template.id}
                  templateName={template.name}
                  onDownload={onDownload}
                  onViewVersions={onViewVersions}
                  onViewFields={onViewFields}
                  onDelete={onDelete}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TemplatesTable;

