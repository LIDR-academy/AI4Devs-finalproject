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
