/**
 * TypeScript interfaces for PDF Template Analysis functionality
 */

// Template field interface matching backend response
export interface TemplateField {
  field_id: string;
  type: "text" | "radiobutton" | "checkbox" | "listbox";
  near_text: string;
  value_options: string[] | null;
}

// Analysis metadata interface
export interface AnalysisMetadata {
  total_fields: number;
  processing_time_ms: number;
  document_pages: number;
}

// Complete API response interface
export interface AnalysisResponse {
  status: "success" | "error";
  data: TemplateField[];
  metadata: AnalysisMetadata;
}

// Error response interface
export interface ErrorResponse {
  status: "error";
  error: string;
  message: string;
  timestamp: string;
}

// Upload state management
export type UploadState = "idle" | "uploading" | "processing" | "success" | "error";

// Component state interface
export interface AnalyzePageState {
  uploadState: UploadState;
  selectedFile: File | null;
  analysisResults: TemplateField[] | null;
  metadata: AnalysisMetadata | null;
  error: string | null;
  progress: number;
  // Save functionality state
  showSaveModal: boolean;
  isSaving: boolean;
  saveError: string | null;
}

// File upload validation result
export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

// Component Props Interfaces

// Main page component props
export interface TemplateAnalyzePageProps {
  className?: string;
}

// File upload component props
export interface FileUploadZoneProps {
  onFileSelect: (file: File | null) => void;
  onAnalyze: () => void;
  selectedFile: File | null;
  uploadState: UploadState;
  error: string | null;
  progress: number;
  disabled?: boolean;
  className?: string;
}

// Table component props
export interface TemplateFieldTableProps {
  fields: TemplateField[];
  metadata: AnalysisMetadata;
  loading?: boolean;
  className?: string;
}

// Table row component props
export interface TableRowProps {
  field: TemplateField;
  index: number;
  className?: string;
}

// Custom error interface for API errors
export interface AnalysisErrorData {
  message: string;
  statusCode?: number;
  errorCode?: string;
}

// Custom error class for API errors
export class AnalysisError extends Error {
  statusCode?: number;
  errorCode?: string;

  constructor(message: string, statusCode?: number, errorCode?: string) {
    super(message);
    this.name = "AnalysisError";
    this.statusCode = statusCode;
    this.errorCode = errorCode;
  }
}

// Hook interfaces for state management
export interface UseAnalyzePageState {
  state: AnalyzePageState;
  updateState: (updates: Partial<AnalyzePageState>) => void;
  handleFileSelect: (file: File) => void;
  handleAnalyze: () => Promise<void>;
  handleReset: () => void;
  // Save functionality handlers
  handleOpenSaveModal: () => void;
  handleCloseSaveModal: () => void;
  handleSaveTemplate: (data: { name: string; version: string; sepe_url?: string }) => Promise<void>;
}

// Progress tracking callback type
export type ProgressCallback = (progress: number) => void;

// API function types
export type AnalyzePDFFunction = (file: File) => Promise<AnalysisResponse>;
export type ValidatePDFFunction = (file: File) => FileValidationResult;
export type UploadWithProgressFunction = (
  file: File,
  onProgress: ProgressCallback
) => Promise<AnalysisResponse>;

// Event handler types for components
export type HandleFileSelect = (file: File) => void;
export type HandleAnalyze = () => Promise<void>;
export type HandleDragEvent = (event: React.DragEvent<HTMLDivElement>) => void;
export type HandleDropEvent = (event: React.DragEvent<HTMLDivElement>) => void;

// Drag and drop state
export interface DragState {
  isDragOver: boolean;
  isDragActive: boolean;
  dragCounter: number;
}

// Mobile responsive breakpoint helper
export interface ResponsiveBreakpoints {
  mobile: boolean;
  tablet: boolean;
  desktop: boolean;
}

// Accessibility props for components
export interface AccessibilityProps {
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-labelledby'?: string;
  'aria-expanded'?: boolean;
  'aria-hidden'?: boolean;
  role?: string;
  tabIndex?: number;
}

// Combined props for enhanced components
export interface EnhancedFileUploadProps extends FileUploadZoneProps, AccessibilityProps {
  id?: string;
  testId?: string;
}

export interface EnhancedTableProps extends TemplateFieldTableProps, AccessibilityProps {
  id?: string;
  testId?: string;
  sortable?: boolean;
  onSort?: (column: keyof TemplateField, direction: 'asc' | 'desc') => void;
}

// Form validation helpers
export interface ValidationRule {
  required?: boolean;
  maxSize?: number;
  allowedTypes?: string[];
  customValidator?: (file: File) => FileValidationResult;
}

// Configuration interface for the analyzer
export interface AnalyzerConfig {
  maxFileSize: number;
  allowedExtensions: string[];
  apiEndpoint: string;
  timeout: number;
  retryAttempts: number;
}

// Default configuration
export const DEFAULT_ANALYZER_CONFIG: AnalyzerConfig = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedExtensions: ['.pdf'],
  apiEndpoint: '/api/v1/templates/analyze',
  timeout: 60000, // 60 seconds - increased for large PDF analysis
  retryAttempts: 1, // No retries for PDF analysis (it's expensive)
};
