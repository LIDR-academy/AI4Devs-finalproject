/**
 * T-1003-BACK: Part Navigation API Types
 * Contract must match backend Pydantic schema PartNavigationResponse exactly
 */

/**
 * Response from GET /api/parts/{id}/adjacent endpoint
 */
export interface PartNavigationResponse {
  /** UUID of previous part (null if current is first) */
  prev_id: string | null;
  
  /** UUID of next part (null if current is last) */
  next_id: string | null;
  
  /** 1-based index of current part in filtered set */
  current_index: number;
  
  /** Total number of parts in filtered set */
  total_count: number;
}

/**
 * Query parameters for navigation API
 */
export interface PartNavigationQueryParams {
  /** Filter by workshop ID (RLS enforcement) */
  workshop_id?: string;
  
  /** Filter by status (validated, in_production, etc.) */
  status?: string;
  
  /** Filter by tipologia (capitel, columna, dovela, etc.) */
  tipologia?: string;
}
