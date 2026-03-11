/**
 * Template-related TypeScript type definitions
 * Matches backend API response structures
 */

/**
 * Base Template Types (aligned with refactored backend PDFTemplate model)
 * 
 * Note: file_path, file_size_bytes, field_count, and sepe_url are fetched
 * from the current version relationship, not directly from the template.
 */
export interface Template {
  id: number;
  name: string;
  current_version: string;
  comment: string | null;
  uploaded_by: number | null;
  created_at: string;
  updated_at: string | null;
  // Optional fields from current version (may be null if no current version)
  file_path?: string | null;
  file_size_bytes?: number | null;
  field_count?: number | null;
  sepe_url?: string | null;
}

/**
 * Template Version with PDF metadata and file information
 * 
 * Each version now contains its own file data (file_path, file_size_bytes, etc.)
 * to implement version atomicity.
 */
export interface TemplateVersion {
  id: number;
  template_id: number;
  version_number: string;
  change_summary: string | null;
  is_current: boolean;
  created_at: string;
  // File Information (version-specific)
  file_path: string;
  file_size_bytes: number;
  field_count: number;
  sepe_url: string | null;
  // PDF Document Metadata
  title: string | null;
  author: string | null;
  subject: string | null;
  creation_date: string | null;
  modification_date: string | null;
  page_count: number;
}

// Template Field (AcroForm field data)
export interface TemplateField {
  id: number;
  version_id: number;
  field_id: string;
  field_type: FieldType;
  raw_type: string | null;
  page_number: number;
  field_page_order: number;
  near_text: string | null;
  value_options: string[] | null;
  position_data: PositionData | null;
  created_at: string;
}

// Position data for field coordinates
export interface PositionData {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

// Field types matching backend
export type FieldType =
  | 'text'
  | 'checkbox'
  | 'radiobutton'
  | 'select'
  | 'textarea'
  | 'button'
  | 'signature';

// Paginated Response Types
export interface TemplateListResponse {
  items: Template[];
  total: number;
  limit: number;
  offset: number;
}

export interface TemplateVersionListResponse {
  items: TemplateVersion[];
  total: number;
  limit: number;
  offset: number;
}

export interface TemplateFieldListResponse {
  items: TemplateField[];
  total: number;
  limit: number;
  offset: number;
  version_info: VersionInfo;
}

// Version metadata included in field responses
export interface VersionInfo {
  version_id: number;
  version_number: string;
  field_count: number;
}

/**
 * Basic template information for version detail responses
 * 
 * Used when we need template context in version responses,
 * such as success pages after template creation.
 */
export interface TemplateBasicInfo {
  id: number;
  name: string;
  current_version: string;
  comment: string | null;
  uploaded_by: number | null;
  created_at: string;
}

/**
 * Detailed template version response with associated template info
 * 
 * Used for success pages and version detail views where we need
 * both version and template information in one response.
 * This minimizes API calls from the frontend.
 */
export interface TemplateVersionDetail {
  // Version information
  id: number;
  version_number: string;
  change_summary: string | null;
  is_current: boolean;
  created_at: string;
  
  // File information (version-specific)
  file_path: string;
  file_size_bytes: number;
  field_count: number;
  sepe_url: string | null;
  
  // PDF metadata
  title: string | null;
  author: string | null;
  subject: string | null;
  creation_date: string | null;
  modification_date: string | null;
  page_count: number;
  
  // Associated template
  template: TemplateBasicInfo;
}

/**
 * Template ingestion response
 * 
 * Returned after successfully ingesting a new template.
 * Includes version_id to enable direct navigation to success page.
 */
export interface TemplateIngestResponse {
  id: number;
  name: string;
  current_version: string;
  comment: string | null;
  file_path: string;
  file_size_bytes: number;
  field_count: number;
  sepe_url: string | null;
  checksum: string;
  message: string;
  version_id: number; // ID of the created version for navigation
}

/**
 * Template name item for selectors
 * 
 * Lightweight template data for dropdowns and autocomplete components.
 * Used by the version upload modal to select existing templates.
 */
export interface TemplateNameItem {
  id: number;
  name: string;
  current_version: string;
}

/**
 * Template names response
 * 
 * Response from GET /api/v1/templates/names endpoint.
 * Used to populate template selectors in the UI.
 */
export interface TemplateNamesResponse {
  items: TemplateNameItem[];
  total: number;
}

/**
 * Template version ingestion request
 * 
 * Data required to create a new version of an existing template.
 */
export interface TemplateVersionIngestRequest {
  template_id: number;
  version: string;
  change_summary?: string;
  sepe_url?: string;
  file: File;
}

/**
 * Template version ingestion response
 * 
 * Returned after successfully ingesting a new template version.
 * Includes version_id to enable direct navigation to version detail page.
 */
export interface TemplateVersionIngestResponse {
  template_id: number;
  version_id: number;
  version_number: string;
  change_summary: string | null;
  file_path: string;
  file_size_bytes: number;
  field_count: number;
  is_current: boolean;
  message: string;
}

// Filter and Sort Types
export interface TemplatesFilters {
  name?: string;
  current_version?: string;
  search?: string;
  limit?: number;
  offset?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface VersionsFilters {
  limit?: number;
  offset?: number;
  sort_by?: 'created_at' | 'version_number' | 'page_count';
  sort_order?: 'asc' | 'desc';
}

export interface FieldsFilters {
  limit?: number;
  offset?: number;
  page_number?: number;
  search?: string;
}

export interface SortConfig {
  sort_by: string;
  sort_order: 'asc' | 'desc';
}

// Pagination State
export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  offset: number;
}

// UI State Types
export interface TemplatesPageState {
  templates: Template[];
  loading: boolean;
  error: string | null;
  pagination: PaginationState;
  filters: TemplatesFilters;
  sort: SortConfig;
}

export interface ModalState {
  isOpen: boolean;
  templateId: number | null;
}

// Field Type Badge Colors (for UI display)
export const FIELD_TYPE_COLORS: Record<FieldType, string> = {
  text: 'blue',
  checkbox: 'green',
  radiobutton: 'purple',
  select: 'orange',
  textarea: 'blue',
  button: 'gray',
  signature: 'red',
};

// Field Type Display Labels
export const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  text: 'Text',
  checkbox: 'Checkbox',
  radiobutton: 'Radio Button',
  select: 'Select',
  textarea: 'Text Area',
  button: 'Button',
  signature: 'Signature',
};

