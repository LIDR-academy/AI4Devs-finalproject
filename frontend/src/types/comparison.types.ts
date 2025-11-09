/**
 * TypeScript types for template comparison feature.
 *
 * These types match the backend Pydantic schemas for template version
 * comparison and analysis.
 */

/**
 * Status of a field change in the comparison.
 */
export type FieldChangeStatus = 'ADDED' | 'REMOVED' | 'MODIFIED' | 'UNCHANGED';

/**
 * Status of a specific attribute comparison.
 */
export type DiffStatus = 'EQUAL' | 'DIFFERENT' | 'NOT_APPLICABLE';

/**
 * Request payload for comparison analysis.
 */
export interface ComparisonRequest {
  /** Source version ID to compare from */
  source_version_id: number;
  /** Target version ID to compare to */
  target_version_id: number;
}

/**
 * Global metrics for template version comparison.
 *
 * Provides high-level statistics about the differences between
 * two template versions.
 */
export interface GlobalMetrics {
  /** Version identifier of source template */
  source_version_number: string;
  /** Version identifier of target template */
  target_version_number: string;
  /** Number of pages in source PDF */
  source_page_count: number;
  /** Number of pages in target PDF */
  target_page_count: number;
  /** Whether page count differs between versions */
  page_count_changed: boolean;
  /** Total fields in source version */
  source_field_count: number;
  /** Total fields in target version */
  target_field_count: number;
  /** Whether field count differs between versions */
  field_count_changed: boolean;
  /** Number of fields added in target */
  fields_added: number;
  /** Number of fields removed from source */
  fields_removed: number;
  /** Number of fields with changes */
  fields_modified: number;
  /** Number of fields without changes */
  fields_unchanged: number;
  /** Percentage of fields that changed (0-100) */
  modification_percentage: number;
  /** When source version was created */
  source_created_at: string;
  /** When target version was created */
  target_created_at: string;
}

/**
 * Field position coordinates.
 */
export interface FieldPosition {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

/**
 * Detailed field-level comparison data.
 *
 * Represents the comparison result for a single field between
 * source and target versions.
 */
export interface FieldChange {
  /** Unique field identifier */
  field_id: string;
  /** Change status (ADDED/REMOVED/MODIFIED/UNCHANGED) */
  status: FieldChangeStatus;
  /** Type of form field (text, checkbox, select, etc.) */
  field_type?: string;
  /** Page number in source (null if ADDED) */
  source_page_number?: number;
  /** Page number in target (null if REMOVED) */
  target_page_number?: number;
  /** Whether page number differs between versions */
  page_number_changed: boolean;
  /** Comparison status of field label/near text */
  near_text_diff: DiffStatus;
  /** Label text in source version */
  source_near_text?: string;
  /** Label text in target version */
  target_near_text?: string;
  /** Comparison status of field value options */
  value_options_diff: DiffStatus;
  /** Value options in source (for select/radio fields) */
  source_value_options?: string[];
  /** Value options in target (for select/radio fields) */
  target_value_options?: string[];
  /** Comparison status of field position coordinates */
  position_change: DiffStatus;
  /** Field coordinates in source {x0, y0, x1, y1} */
  source_position?: FieldPosition;
  /** Field coordinates in target {x0, y0, x1, y1} */
  target_position?: FieldPosition;
}

/**
 * Complete comparison result.
 *
 * Contains global metrics and detailed field-by-field comparison data
 * for two template versions.
 */
export interface ComparisonResult {
  /** Source version ID that was compared */
  source_version_id: number;
  /** Target version ID that was compared */
  target_version_id: number;
  /** High-level comparison statistics */
  global_metrics: GlobalMetrics;
  /** Detailed field-by-field comparison data */
  field_changes: FieldChange[];
  /** Timestamp when comparison was performed */
  analyzed_at: string;
}

/**
 * Filter option for field changes display.
 */
export type FieldChangeFilter = 'ALL' | FieldChangeStatus;

/**
 * Sort field options for field changes table.
 */
export type FieldChangeSortField = 'field_id' | 'status' | 'source_page_number' | 'target_page_number';

/**
 * Sort order options.
 */
export type SortOrder = 'asc' | 'desc';

/**
 * Helper type for grouping field changes by status.
 */
export interface FieldChangeCounts {
  added: number;
  removed: number;
  modified: number;
  unchanged: number;
  total: number;
}

/**
 * UI state for comparison page.
 */
export interface ComparisonPageState {
  /** Selected source template ID */
  sourceTemplateId: number | null;
  /** Selected source version ID */
  sourceVersionId: number | null;
  /** Selected target template ID */
  targetTemplateId: number | null;
  /** Selected target version ID */
  targetVersionId: number | null;
  /** Current field change filter */
  filter: FieldChangeFilter;
  /** Current sort field */
  sortField: FieldChangeSortField;
  /** Current sort order */
  sortOrder: SortOrder;
  /** Whether comparison is in progress */
  isAnalyzing: boolean;
  /** Error message if comparison failed */
  error: string | null;
  /** Comparison result if available */
  result: ComparisonResult | null;
}

// ============================================================================
// Persistence Types (for saving and retrieving comparisons)
// ============================================================================

/**
 * Summary of a saved comparison for list views.
 *
 * Lightweight view without field details for efficient browsing
 * of comparison history.
 */
export interface ComparisonSummary {
  /** Unique comparison ID */
  id: number;
  /** Source template version ID */
  source_version_id: number;
  /** Target template version ID */
  target_version_id: number;
  /** Source version number */
  source_version_number: string;
  /** Target version number */
  target_version_number: string;
  /** Name of source template */
  source_template_name: string;
  /** Name of target template */
  target_template_name: string;
  /** Percentage of fields that changed (0-100) */
  modification_percentage: number;
  /** Number of fields added in target */
  fields_added: number;
  /** Number of fields removed from source */
  fields_removed: number;
  /** Number of fields with changes */
  fields_modified: number;
  /** Number of fields without changes */
  fields_unchanged: number;
  /** When comparison was saved */
  created_at: string;
  /** User ID who saved the comparison (null if unknown) */
  created_by: number | null;
}

/**
 * Paginated list response for saved comparisons.
 *
 * Standard pagination structure with metadata for UI controls.
 */
export interface ComparisonListResponse {
  /** Array of comparison summaries */
  items: ComparisonSummary[];
  /** Total number of comparisons (across all pages) */
  total: number;
  /** Current page number (1-indexed) */
  page: number;
  /** Number of items per page */
  page_size: number;
  /** Total number of pages */
  total_pages: number;
}

/**
 * Response from saving a comparison.
 *
 * Contains the new comparison ID and confirmation message.
 */
export interface SaveComparisonResponse {
  /** ID of the saved comparison */
  comparison_id: number;
  /** Success message */
  message: string;
  /** Timestamp when comparison was saved */
  created_at: string;
}

/**
 * Response from checking if comparison exists.
 *
 * Used to prevent duplicate saves and link to existing comparisons.
 */
export interface ComparisonCheckResponse {
  /** Whether a comparison exists */
  exists: boolean;
  /** Comparison ID if it exists, null otherwise */
  comparison_id: number | null;
  /** When existing comparison was created, null if doesn't exist */
  created_at: string | null;
}

/**
 * Parameters for listing saved comparisons.
 *
 * Supports pagination, sorting, and search functionality.
 */
export interface ListComparisonsParams {
  /** Page number (1-indexed) */
  page?: number;
  /** Items per page (max 100) */
  page_size?: number;
  /** Field to sort by */
  sort_by?: 'created_at' | 'modification_percentage' | 'fields_added' | 'fields_removed' | 'fields_modified';
  /** Sort order */
  sort_order?: 'asc' | 'desc';
  /** Search term for template names */
  search?: string;
}

