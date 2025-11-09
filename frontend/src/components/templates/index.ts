/**
 * Templates Components - Barrel Export
 *
 * Centralized exports for all template-related components.
 * Provides clean imports throughout the application.
 *
 * @author AI4Devs
 * @date 2025-10-25
 */

// Table Components
export { default as EmptyState } from './EmptyState';
export { default as TableFilters } from './TableFilters';
export { default as TablePagination } from './TablePagination';
export { default as TemplateActionsMenu } from './TemplateActionsMenu';
export { default as TemplatesTable } from './TemplatesTable';

// Modal Components
export { default as TemplateFieldsModal } from './TemplateFieldsModal';
export { default as VersionHistoryModal } from './VersionHistoryModal';

// Type exports
export type { EmptyStateProps } from './EmptyState';
export type { TableFiltersProps } from './TableFilters';
export type { TablePaginationProps } from './TablePagination';
export type { TemplateActionsMenuProps } from './TemplateActionsMenu';
export type { TemplateFieldsModalProps } from './TemplateFieldsModal';
export type { TemplatesTableProps } from './TemplatesTable';
export type { VersionHistoryModalProps } from './VersionHistoryModal';

