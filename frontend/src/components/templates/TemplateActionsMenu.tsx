/**
 * TemplateActionsMenu Component
 *
 * Provides action buttons for each template in the table:
 * - Download PDF button
 * - View version history button
 * - View form fields button
 * - Delete template button
 *
 * Features:
 * - Icon-only buttons with tooltips
 * - Accessible with proper ARIA labels
 * - Hover states for better UX
 * - Responsive sizing
 *
 * @author AI4Devs
 * @date 2025-10-25
 */

import { Download, FileText, History, Trash2 } from 'lucide-react';
import React from 'react';

/**
 * Props for TemplateActionsMenu component
 */
export interface TemplateActionsMenuProps {
  /** Template ID */
  templateId: number;
  /** Template name (for download filename) */
  templateName: string;
  /** Callback when download action is triggered */
  onDownload: (templateId: number, templateName: string) => void;
  /** Callback when view versions action is triggered */
  onViewVersions: (templateId: number) => void;
  /** Callback when view fields action is triggered */
  onViewFields: (templateId: number) => void;
  /** Callback when delete action is triggered */
  onDelete: (templateId: number, templateName: string) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * TemplateActionsMenu component for template row actions
 *
 * @example
 * ```tsx
 * <TemplateActionsMenu
 *   templateId={template.id}
 *   templateName={template.name}
 *   onDownload={handleDownload}
 *   onViewVersions={handleOpenVersionsModal}
 *   onViewFields={handleOpenFieldsModal}
 * />
 * ```
 */
const TemplateActionsMenu: React.FC<TemplateActionsMenuProps> = ({
  templateId,
  templateName,
  onDownload,
  onViewVersions,
  onViewFields,
  onDelete,
  className = '',
}) => {
  const handleDownload = () => {
    onDownload(templateId, templateName);
  };

  const handleViewVersions = () => {
    onViewVersions(templateId);
  };

  const handleViewFields = () => {
    onViewFields(templateId);
  };

  const handleDelete = () => {
    onDelete(templateId, templateName);
  };

  return (
    <div className={`template-actions-menu flex gap-2 ${className}`}>
      <button
        onClick={handleDownload}
        aria-label="Download PDF"
        title="Download PDF"
        type="button"
        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <Download size={18} />
      </button>

      <button
        onClick={handleViewVersions}
        aria-label="View version history"
        title="View version history"
        type="button"
        className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 dark:text-gray-400 dark:hover:text-green-400 dark:hover:bg-green-900/20 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        <History size={18} />
      </button>

      <button
        onClick={handleViewFields}
        aria-label="View form fields"
        title="View form fields"
        type="button"
        className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 dark:text-gray-400 dark:hover:text-purple-400 dark:hover:bg-purple-900/20 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
        <FileText size={18} />
      </button>

      <button
        onClick={handleDelete}
        aria-label="Delete template"
        title="Delete template"
        type="button"
        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/20 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
};

export default TemplateActionsMenu;

