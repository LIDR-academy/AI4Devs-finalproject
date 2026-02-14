/**
 * Validation types for T-023-TEST
 * 
 * These interfaces mirror the Pydantic schemas in src/backend/schemas.py
 * to ensure frontend-backend contract alignment.
 */

export interface ValidationErrorItem {
  category: string;
  target?: string;
  message: string;
}

export interface ValidationReport {
  is_valid: boolean;
  errors: ValidationErrorItem[];
  metadata: Record<string, any>;
  validated_at?: string;  // ISO datetime string
  validated_by?: string;
}

/**
 * T-030-BACK: Get Validation Status Endpoint Types
 * 
 * CRITICAL: Must match Pydantic schemas in src/backend/schemas.py EXACTLY
 * (BlockStatus enum values, ValidationStatusResponse field names/types/nullability)
 */

/**
 * Lifecycle states for blocks (parts).
 * Synchronized with PostgreSQL ENUM block_status (T-021-DB).
 */
export type BlockStatus = 
  | "uploaded" 
  | "processing" 
  | "validated" 
  | "rejected" 
  | "error_processing" 
  | "in_fabrication" 
  | "completed" 
  | "archived";

/**
 * Response from GET /api/parts/{id}/validation endpoint.
 * Combines block metadata with validation report.
 */
export interface ValidationStatusResponse {
  block_id: string;  // UUID as string
  iso_code: string;
  status: BlockStatus;
  validation_report: ValidationReport | null;  // NULL if not validated yet
  job_id: string | null;  // Celery task ID if status="processing"
}
