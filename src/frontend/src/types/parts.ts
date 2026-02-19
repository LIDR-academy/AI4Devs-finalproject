/**
 * T-0501-BACK Contract: 3D Canvas Parts API Types
 * 
 * CRITICAL: Must match backend Pydantic schemas exactly (field names, types, nullability)
 * 
 * Mapping rules:
 * - Python UUID → TypeScript string
 * - Python Optional[X] → TypeScript X | null
 * - Python List[float] → TypeScript number[]
 * - Python Enum → TypeScript enum (same string values)
 * 
 * @see src/backend/schemas.py - BlockStatus, BoundingBox, PartCanvasItem, PartsListResponse
 */

export enum BlockStatus {
  Uploaded = "uploaded",
  Processing = "processing",
  Validated = "validated",
  Rejected = "rejected",
  InFabrication = "in_fabrication",
  Completed = "completed",
  ErrorProcessing = "error_processing",
  Archived = "archived",
}

export interface BoundingBox {
  min: [number, number, number];  // [x, y, z] - exactly 3 elements
  max: [number, number, number];  // [x, y, z] - exactly 3 elements
}

export interface PartCanvasItem {
  id: string;                      // UUID string
  iso_code: string;                // e.g., "SF-C12-D-001"
  status: BlockStatus;             // Enum value
  tipologia: string;               // "capitel" | "columna" | "dovela" | etc.
  low_poly_url: string | null;     // Supabase Storage URL to GLB, or null if not processed
  bbox: BoundingBox | null;        // 3D bounding box, or null if not extracted yet
  workshop_id: string | null;      // UUID string or null if unassigned
}

export interface PartsListResponse {
  parts: PartCanvasItem[];
  count: number;
  filters_applied: Record<string, string | null>;
}

/**
 * Query parameters for GET /api/parts (all optional)
 * Used by frontend to filter parts list
 */
export interface PartsQueryParams {
  status?: BlockStatus;
  tipologia?: string;
  workshop_id?: string;  // UUID string
}
