/**
 * TypeScript type definitions for SEPE Templates Comparator frontend
 */

// API Response Types
export interface ApiResponse<T = unknown> {
  data?: T;
  message?: string;
  error?: string;
  status?: number;
  timestamp?: string;
}

export interface PaginatedResponse<T = unknown> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

// User Types
export interface User {
  id: number;
  email: string;
  full_name?: string;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name?: string;
}

// Template Types
export interface PDFTemplate {
  id: number;
  name: string;
  version: string;
  file_path: string;
  file_size_bytes: number;
  field_count: number;
  sepe_url?: string;
  uploaded_by?: number;
  created_at: string;
  updated_at?: string;
}

export interface TemplateCreateRequest {
  name: string;
  version: string;
  sepe_url?: string;
  file: File;
}

export interface TemplateVersion {
  id: number;
  template_id: number;
  version_number: string;
  change_summary?: string;
  is_current: boolean;
  created_at: string;
}

// Comparison Types
export interface Comparison {
  id: number;
  source_template_id: number;
  target_template_id: number;
  comparison_type: string;
  status: ComparisonStatus;
  differences_count: number;
  created_by?: number;
  created_at: string;
  completed_at?: string;
  source_template?: PDFTemplate;
  target_template?: PDFTemplate;
  field_differences?: ComparisonField[];
}

export interface ComparisonField {
  id: number;
  comparison_id: number;
  field_name: string;
  field_type?: string;
  change_type: ChangeType;
  old_value?: string;
  new_value?: string;
  position_x?: number;
  position_y?: number;
  created_at: string;
}

export interface ComparisonCreateRequest {
  source_template_id: number;
  target_template_id: number;
  comparison_type?: string;
}

// Enums
export enum ComparisonStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum ChangeType {
  ADDED = 'added',
  REMOVED = 'removed',
  MODIFIED = 'modified',
  UNCHANGED = 'unchanged',
}

// UI State Types
export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

export interface TableColumn<T = Record<string, unknown>> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: unknown, item: T) => React.ReactNode;
}

export interface TableProps<T = Record<string, unknown>> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  onSort?: (column: keyof T, direction: 'asc' | 'desc') => void;
  onRowClick?: (item: T) => void;
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'file';
  required?: boolean;
  placeholder?: string;
  options?: { label: string; value: string | number }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: RegExp;
    message?: string;
  };
}

// Navigation Types
export interface NavigationItem {
  label: string;
  path: string;
  icon?: React.ComponentType<{ className?: string }>;
  children?: NavigationItem[];
  requiresAuth?: boolean;
}

// Context Types
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  register: (userData: RegisterRequest) => Promise<void>;
  loading: boolean;
  error?: string;
}

export interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

// Hook Types
export interface UseApiOptions<T = unknown> {
  immediate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  mutate: (newData: T) => void;
}

// Utility Types
export type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };
export type XOR<T, U> = (T | U) extends object ? (Without<T, U> & U) | (Without<U, T> & T) : T | U;
export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;
export type RequiredKeys<T> = { [K in keyof T]-?: Record<string, never> extends Pick<T, K> ? never : K }[keyof T];
export type OptionalKeys<T> = { [K in keyof T]-?: Record<string, never> extends Pick<T, K> ? K : never }[keyof T];

// PDF Analysis Types
export * from './pdfAnalysis';

// Template Types
export * from './templates.types';

// Comparison Types
export * from './comparison.types';

// Activity Types
export * from './activity.types';

// Metrics Types
export * from './metrics.types';

