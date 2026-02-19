# Technical Specification: T-0501-BACK

**Ticket ID:** T-0501-BACK  
**Story:** US-005 - Dashboard 3D Interactivo  
**Sprint:** Sprint 1 (Week 1-2, 2026)  
**Estimación:** 3 Story Points (~4 hours)  
**Responsable:** Backend Developer  
**Prioridad:** 🔵 P2 (Blocker for T-0504-FRONT, T-0505-FRONT)
**Status:** ✅ **READY FOR TDD-RED** (Enrichment Phase Complete)

---

## 1. Ticket Summary

- **Tipo:** BACK
- **Alcance:** Create `GET /api/parts` endpoint that returns ALL parts (no pagination) with 3D canvas-ready fields (`low_poly_url`, `bbox`). Support filters by `status`, `tipologia`, `workshop_id`. Apply RLS so workshop users see only assigned+unassigned parts.
- **Dependencias:** 
  - **Upstream:** T-0503-DB (✅ DONE 2026-02-19) - `low_poly_url`, `bbox` columns and `idx_blocks_canvas_query` index must exist
  - **Downstream:** T-0504-FRONT (Dashboard3D layout), T-0505-FRONT (PartsScene rendering) will consume this API
  - **Related:** T-0502-AGENT (generates `low_poly_url` values asynchronously, independent)

### Problem Statement
Dashboard 3D needs to load 150+ parts with low-poly geometry (~300-400KB GLB each after Draco compression, from POC). Current `GET /api/parts` endpoint (if it exists) doesn't include:
- `low_poly_url`: URL to simplified .glb file for 3D rendering
- `bbox`: 3D bounding box for camera auto-centering and spatial layout
- Performance optimization: Response <200KB, query <500ms with proper index usage
- RLS enforcement: Workshop users only see assigned parts + unassigned parts

### Current State (Before Implementation)
**NO existing endpoint exists yet.** This is a new feature. If an old `GET /api/parts` exists with pagination, it will be replaced.

### Target State (After Implementation)
Endpoint `GET /api/parts` returns all blocks with:
- Fields: `id`, `iso_code`, `status`, `tipologia`, `low_poly_url`, `bbox`, `workshop_id`
- Filters: `status`, `tipologia`, `workshop_id` (query params)
- RLS: Workshop users see only assigned + unassigned parts
- Performance: <500ms query time, <200KB response size
- Index usage: Must use `idx_blocks_canvas_query` composite index

---

## 2. Data Structures & Contracts

### Backend Schema (Pydantic)

**File:** `src/backend/schemas.py` (add to existing file)

```python
# ===== T-0501-BACK: Parts Canvas API Schemas =====

from typing import List, Optional, Dict, Any
from uuid import UUID
from enum import Enum
from pydantic import BaseModel, Field, validator

class BlockStatus(str, Enum):
    """Enum for block lifecycle status (mirrors database enum)."""
    uploaded = "uploaded"
    processing = "processing"
    validated = "validated"
    rejected = "rejected"
    in_fabrication = "in_fabrication"
    completed = "completed"
    error_processing = "error_processing"
    archived = "archived"


class BoundingBox(BaseModel):
    """
    3D bounding box for spatial layout in canvas.
    
    Attributes:
        min: Array of [x, y, z] coordinates for minimum corner
        max: Array of [x, y, z] coordinates for maximum corner
    """
    min: List[float] = Field(..., min_length=3, max_length=3, description="Min corner [x, y, z]")
    max: List[float] = Field(..., min_length=3, max_length=3, description="Max corner [x, y, z]")
    
    @validator('min', 'max')
    def validate_coordinates(cls, v):
        if len(v) != 3:
            raise ValueError('Must contain exactly 3 coordinates [x, y, z]')
        return v
    
    class Config:
        schema_extra = {
            "example": {
                "min": [-2.5, 0.0, -2.5],
                "max": [2.5, 5.0, 2.5]
            }
        }


class PartCanvasItem(BaseModel):
    """
    Minimal part info optimized for 3D canvas rendering.
    
    Contract: Must match TypeScript interface PartCanvasItem exactly.
    Used by GET /api/parts endpoint for Dashboard 3D (US-005).
    
    Attributes:
        id: Block UUID
        iso_code: Part identifier (ISO-19650 format, e.g., SF-C12-D-001)
        status: Lifecycle state
        tipologia: Part typology (capitel, columna, dovela, clave, imposta, etc.)
        low_poly_url: Storage URL to simplified GLB file (~1000 triangles, ~300-400KB with Draco)
        bbox: 3D bounding box for camera centering and spatial queries
        workshop_id: Assigned workshop UUID (NULL if unassigned)
    """
    id: UUID = Field(..., description="Block UUID")
    iso_code: str = Field(..., description="Part identifier (e.g., SF-C12-D-001)")
    status: BlockStatus = Field(..., description="Lifecycle state")
    tipologia: str = Field(..., description="Part typology")
    low_poly_url: Optional[str] = Field(None, description="GLB file URL for 3D rendering")
    bbox: Optional[BoundingBox] = Field(None, description="3D bounding box")
    workshop_id: Optional[UUID] = Field(None, description="Assigned workshop UUID")
    
    class Config:
        schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "iso_code": "SF-C12-D-001",
                "status": "validated",
                "tipologia": "capitel",
                "low_poly_url": "https://xyz.supabase.co/storage/v1/object/public/processed-geometry/low-poly/550e8400.glb",
                "bbox": {"min": [-2.5, 0.0, -2.5], "max": [2.5, 5.0, 2.5]},
                "workshop_id": "123e4567-e89b-12d3-a456-426614174000"
            }
        }


class PartsListResponse(BaseModel):
    """
    Response for GET /api/parts endpoint.
    
    Attributes:
        parts: Array of all parts matching filters
        count: Total number of parts returned
        filters_applied: Echo of query parameters used for transparency
    """
    parts: List[PartCanvasItem] = Field(..., description="Array of canvas-ready parts")
    count: int = Field(..., description="Total count of parts returned")
    filters_applied: Dict[str, Any] = Field(default_factory=dict, description="Applied filters (for debugging)")
    
    class Config:
        schema_extra = {
            "example": {
                "parts": [
                    {
                        "id": "550e8400-e29b-41d4-a716-446655440000",
                        "iso_code": "SF-C12-D-001",
                        "status": "validated",
                        "tipologia": "capitel",
                        "low_poly_url": "https://xyz.supabase.co/storage/v1/object/public/processed-geometry/low-poly/550e8400.glb",
                        "bbox": {"min": [-2.5, 0, -2.5], "max": [2.5, 5, 2.5]},
                        "workshop_id": "123e4567-e89b-12d3-a456-426614174000"
                    }
                ],
                "count": 1,
                "filters_applied": {
                    "status": "validated",
                    "tipologia": "capitel",
                    "workshop_id": null
                }
            }
        }
```

---

### Frontend Types (TypeScript)

**File:** `src/frontend/src/types/parts.ts` (replace stub with full implementation)

```typescript
/**
 * T-0501-BACK Contract: 3D Canvas Parts API Types
 * CRITICAL: Must match backend Pydantic schemas exactly (field names, types, nullability)
 * 
 * Mapping rules:
 * - Python UUID → TypeScript string
 * - Python Optional[X] → TypeScript X | null
 * - Python List[float] → TypeScript number[]
 * - Python Enum → TypeScript enum (same values)
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

// Query parameters for GET /api/parts (all optional)
export interface PartsQueryParams {
  status?: BlockStatus;
  tipologia?: string;
  workshop_id?: string;  // UUID string
}
```

**⚠️ CONTRACT VERIFICATION:**
| Field | Backend (Pydantic) | Frontend (TypeScript) | Match? |
|-------|-------------------|-----------------------|--------|
| `id` | `UUID` | `string` | ✅ |
| `iso_code` | `str` | `string` | ✅ |
| `status` | `BlockStatus (Enum)` | `BlockStatus (enum)` | ✅ |
| `tipologia` | `str` | `string` | ✅ |
| `low_poly_url` | `Optional[str]` | `string \| null` | ✅ |
| `bbox` | `Optional[BoundingBox]` | `BoundingBox \| null` | ✅ |
| `workshop_id` | `Optional[UUID]` | `string \| null` | ✅ |

**All fields match exactly.** ✅ Contract validated.

---

### Database Changes (SQL)

**⚠️ NO DATABASE CHANGES** in this ticket. Migration already applied in T-0503-DB (✅ DONE 2026-02-19).

**Relevant Schema (reference only):**
```sql
-- From migration 20260219000001_add_low_poly_url_bbox.sql (ALREADY APPLIED)
ALTER TABLE blocks ADD COLUMN IF NOT EXISTS low_poly_url TEXT NULL;
ALTER TABLE blocks ADD COLUMN IF NOT EXISTS bbox JSONB NULL;

COMMENT ON COLUMN blocks.low_poly_url IS 
'URL pública del archivo GLB simplificado (~1000 triángulos). 
Generado por Celery task tras validación. 
Format: https://xyz.supabase.co/storage/v1/object/public/processed-geometry/low-poly/{id}.glb';

COMMENT ON COLUMN blocks.bbox IS 
'3D Bounding box from Rhino model. 
Schema: {"min": [x,y,z], "max": [x,y,z]} 
Example: {"min": [-2.5, 0, -2.5], "max": [2.5, 5, 2.5]}';

-- Performance indexes (ALREADY CREATED)
CREATE INDEX IF NOT EXISTS idx_blocks_canvas_query 
ON blocks(status, tipologia, workshop_id) 
WHERE is_archived = false;

CREATE INDEX IF NOT EXISTS idx_blocks_low_poly_processing
ON blocks(status)
WHERE low_poly_url IS NULL AND is_archived = false;
```

**Query Pattern (this ticket will implement):**
```sql
-- Optimized query using composite index
SELECT 
    id, 
    iso_code, 
    status, 
    tipologia, 
    low_poly_url,
    bbox,
    workshop_id
FROM blocks
WHERE 
    is_archived = false
    AND ($1::text IS NULL OR status = $1)          -- Dynamic filter
    AND ($2::text IS NULL OR tipologia = $2)       -- Dynamic filter
    AND ($3::uuid IS NULL OR workshop_id = $3)     -- Dynamic filter
ORDER BY created_at DESC;                          -- Consistent ordering
```

**Performance Characteristics:**
- **Index scan cost:** <100 (vs seq scan ~200 for 500 rows)
- **Query time:** <500ms target (validated in T-0503-DB tests: 28ms actual)
- **Index size:** 24KB (validated in T-0503-DB)

---

## 3. API Interface

### Endpoint: GET /api/parts

**Router Prefix:** `/api` (defined in main.py)  
**Full Path:** `GET /api/parts`  
**Authentication:** **Required** (Bearer token via Supabase Auth)  
**Content-Type:** `application/json`

**Query Parameters (all optional):**
| Parameter | Type | Description | Example | Validation |
|-----------|------|-------------|---------|------------|
| `status` | `string` (enum) | Filter by lifecycle status | `?status=validated` | Must be valid BlockStatus enum value |
| `tipologia` | `string` | Filter by part type | `?tipologia=capitel` | No validation (free text in DB) |
| `workshop_id` | `string` (UUID) | Filter by assigned workshop | `?workshop_id=<uuid>` | Must be valid UUID format |

**Request Example 1: No filters**
```http
GET /api/parts HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Accept: application/json
```

**Request Example 2: Multiple filters**
```http
GET /api/parts?status=validated&tipologia=capitel&workshop_id=123e4567-e89b-12d3-a456-426614174000 HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Accept: application/json
```

**Response 200 (Success):**
```json
{
  "parts": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "iso_code": "SF-C12-D-001",
      "status": "validated",
      "tipologia": "capitel",
      "low_poly_url": "https://xyz.supabase.co/storage/v1/object/public/processed-geometry/low-poly/550e8400.glb",
      "bbox": {
        "min": [-2.5, 0.0, -2.5],
        "max": [2.5, 5.0, 2.5]
      },
      "workshop_id": "123e4567-e89b-12d3-a456-426614174000"
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "iso_code": "SF-C12-D-002",
      "status": "validated",
      "tipologia": "capitel",
      "low_poly_url": null,
      "bbox": null,
      "workshop_id": null
    }
  ],
  "count": 2,
  "filters_applied": {
    "status": "validated",
    "tipologia": "capitel",
    "workshop_id": null
  }
}
```

**Response 400 (Bad Request - Invalid status enum):**
```json
{
  "detail": "Invalid status value 'invalid_status'. Must be one of: uploaded, processing, validated, rejected, in_fabrication, completed, error_processing, archived"
}
```

**Response 400 (Bad Request - Invalid UUID):**
```json
{
  "detail": "Invalid UUID format for workshop_id: 'not-a-uuid'"
}
```

**Response 401 (Unauthorized - Missing token):**
```json
{
  "detail": "Authentication required"
}
```

**Response 500 (Internal Server Error - Database error):**
```json
{
  "detail": "Database query failed: [detailed error message for debugging]"
}
```

**Performance Guarantees:**
- **Query execution:** <500ms (using `idx_blocks_canvas_query` index, validated in T-0503-DB: 28ms actual)
- **Response size:** <200KB gzipped (even with 500 parts, ~150 bytes per part)
- **No pagination:** Returns ALL parts matching filters (canvas needs full dataset for 3D scene)
- **Index usage:** MUST use `idx_blocks_canvas_query` (verified via EXPLAIN ANALYZE in tests)

**RLS Behavior:**
- **BIM Manager / Architect / Director:** See ALL parts (no filter applied)
- **Workshop User:** See only:
  - Parts assigned to their workshop (`workshop_id = user.workshop_id`)
  - Unassigned parts (`workshop_id IS NULL`)
- RLS is enforced at the database/Supabase level via policies (not re-implemented in Python)

---

## 4. Component Contract

**⚠️ NOT APPLICABLE** - This is a backend ticket. Frontend components will be created in downstream tickets:
- **T-0504-FRONT:** Dashboard3D canvas layout component
- **T-0505-FRONT:** PartsScene 3D meshes rendering component

**Frontend Service Layer (to be created later in T-0504-FRONT):**
```typescript
// src/frontend/src/services/parts.service.ts (FUTURE - NOT THIS TICKET)
import { PartsQueryParams, PartsListResponse } from '@/types/parts';

export class PartsService {
  private baseUrl = '/api/parts';
  
  async fetchParts(params?: PartsQueryParams): Promise<PartsListResponse> {
    const queryString = new URLSearchParams(
      params as Record<string, string>
    ).toString();
    
    const response = await fetch(
      `${this.baseUrl}${queryString ? `?${queryString}` : ''}`,
      {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    
    return response.json();
  }
}
```

---

## 5. Test Cases Checklist

### Happy Path (Core Functionality)

- [ ] **Test 1: Fetch all parts without filters**
  - **Setup:** Insert 5 blocks with varied status/tipologia
  - **Request:** `GET /api/parts`
  - **Assert:** Returns all 5 non-archived blocks
  - **Assert:** Response contains `parts`, `count`, `filters_applied` fields
  - **Assert:** `count === parts.length`

- [ ] **Test 2: Filter by status only**
  - **Setup:** Insert blocks with status = [validated, in_fabrication, completed]
  - **Request:** `GET /api/parts?status=validated`
  - **Assert:** All returned parts have `status === "validated"`
  - **Assert:** `filters_applied.status === "validated"`
  - **Assert:** Blocks with other statuses NOT returned

- [ ] **Test 3: Filter by tipologia only**
  - **Setup:** Insert blocks with tipologia = [capitel, columna, dovela]
  - **Request:** `GET /api/parts?tipologia=capitel`
  - **Assert:** All returned parts have `tipologia === "capitel"`
  - **Assert:** Blocks with other tipologias NOT returned

- [ ] **Test 4: Filter by workshop_id only**
  - **Setup:** Insert blocks with workshop_id = [workshop-A, workshop-B, NULL]
  - **Request:** `GET /api/parts?workshop_id=<workshop-A-uuid>`
  - **Assert:** All returned parts have `workshop_id === workshop-A` OR `workshop_id === NULL` (if RLS not active)
  - **Assert:** Blocks with workshop-B NOT returned (unless RLS applies)

- [ ] **Test 5: Multiple filters combined**
  - **Setup:** Insert 10 blocks with varied combinations
  - **Request:** `GET /api/parts?status=validated&tipologia=columna&workshop_id=<uuid>`
  - **Assert:** All parts match ALL three filters simultaneously
  - **Assert:** Query plan uses index `idx_blocks_canvas_query` (verify with EXPLAIN ANALYZE)

- [ ] **Test 6: Parts include new columns (low_poly_url, bbox)**
  - **Setup:** Insert block with `low_poly_url = "https://example.com/file.glb"` and `bbox = {"min": [-1,-1,-1], "max": [1,1,1]}`
  - **Assert:** Response includes `low_poly_url` field with correct URL
  - **Assert:** Response includes `bbox` field with correct structure `{"min": [...], "max": [...]}`

### Edge Cases (Boundary Conditions)

- [ ] **Test 7: No parts match filters**
  - **Setup:** Insert blocks with status = [validated, completed]
  - **Request:** `GET /api/parts?status=rejected`
  - **Assert:** Returns `{"parts": [], "count": 0, "filters_applied": {"status": "rejected", ...}}`
  - **Assert:** HTTP 200 (not 404 - empty result is valid)

- [ ] **Test 8: Parts with NULL low_poly_url**
  - **Setup:** Insert block with `low_poly_url = NULL` (not yet processed by agent)
  - **Request:** `GET /api/parts`
  - **Assert:** Part returned with `low_poly_url: null` (JSON null, field NOT omitted)

- [ ] **Test 9: Parts with NULL bbox**
  - **Setup:** Insert block with `bbox = NULL` (not yet extracted)
  - **Request:** `GET /api/parts`
  - **Assert:** Part returned with `bbox: null` (field NOT omitted)

- [ ] **Test 10: Empty database (no blocks exist)**
  - **Setup:** Clean database, no blocks inserted
  - **Request:** `GET /api/parts`
  - **Assert:** Returns `{"parts": [], "count": 0}`
  - **Assert:** HTTP 200 (not 404)

- [ ] **Test 11: Archived parts excluded**
  - **Setup:** Insert 2 blocks: Block A (`is_archived = false`), Block B (`is_archived = true`)
  - **Request:** `GET /api/parts`
  - **Assert:** Only Block A in response
  - **Assert:** Block B NOT in response (filtered by `WHERE is_archived = false`)

### Security/Errors (Input Validation & Auth)

- [ ] **Test 12: Authentication required**
  - **Request:** `GET /api/parts` (NO Authorization header)
  - **Assert:** HTTP 401 Unauthorized
  - **Assert:** Error message: "Authentication required" or similar

- [ ] **Test 13: Invalid status enum value**
  - **Request:** `GET /api/parts?status=invalid_status`
  - **Assert:** HTTP 400 Bad Request
  - **Assert:** Error message lists valid enum values (uploaded, processing, validated, rejected, in_fabrication, completed, error_processing, archived)

- [ ] **Test 14: Invalid UUID format for workshop_id**
  - **Request:** `GET /api/parts?workshop_id=not-a-valid-uuid`
  - **Assert:** HTTP 400 Bad Request
  - **Assert:** Error message: "Invalid UUID format"

- [ ] **Test 15: SQL injection prevention**
  - **Request:** `GET /api/parts?status=validated'; DROP TABLE blocks;--`
  - **Assert:** Query parameterization prevents injection
  - **Assert:** No database error, returns empty list or 400 (depends on validation)
  - **Assert:** `blocks` table still exists after request

### Integration (Performance, RLS, Index Usage)

- [ ] **Test 16: Query uses idx_blocks_canvas_query index**
  - **Setup:** Insert 500 blocks
  - **Execute:** Query with all 3 filters (`status`, `tipologia`, `workshop_id`)
  - **Verify:** Run `EXPLAIN ANALYZE` on underlying SQL query
  - **Assert:** Query plan shows `Index Scan using idx_blocks_canvas_query`
  - **Assert:** Query time <500ms (target validated in T-0503-DB: 28ms actual)

- [ ] **Test 17: Response size <200KB with realistic dataset**
  - **Setup:** Insert 500 blocks with realistic data (iso_code, status, tipologia, etc.)
  - **Request:** `GET /api/parts`
  - **Assert:** Gzipped response payload <200KB
  - **Assert:** Each part JSON ~150-200 bytes (id + iso_code + status + tipologia + urls)

- [ ] **Test 18: RLS applies for workshop users (see only assigned + unassigned)**
  - **Setup:** 
    - User: `role=workshop`, `workshop_id=workshop-A`
    - Block 1: `workshop_id=workshop-A` (assigned to user's workshop)
    - Block 2: `workshop_id=workshop-B` (assigned to different workshop)
    - Block 3: `workshop_id=NULL` (unassigned)
  - **Request:** `GET /api/parts` with workshop user auth token
  - **Assert:** Response includes Block 1 and Block 3
  - **Assert:** Response does NOT include Block 2 (different workshop)

- [ ] **Test 19: BIM Manager sees ALL parts (no RLS filter)**
  - **Setup:** 
    - User: `role=bim_manager`
    - Blocks with varied workshop assignments (A, B, NULL)
  - **Request:** `GET /api/parts` with BIM Manager auth token
  - **Assert:** Returns ALL non-archived parts regardless of workshop assignment
  - **Assert:** No RLS filter applied

- [ ] **Test 20: Consistent ordering (created_at DESC)**
  - **Setup:** Insert 5 blocks at different timestamps
  - **Request:** `GET /api/parts`
  - **Assert:** Parts returned in descending order by `created_at` (newest first)
  - **Assert:** Order is stable across multiple requests

---

## 6. Files to Create/Modify

### Create (New Files):
- `src/backend/api/parts.py` — FastAPI router with GET /api/parts endpoint, filter validation, error handling
- `src/backend/services/parts_service.py` — Business logic layer: query building, RLS application, data transformation
- `tests/integration/test_parts_api.py` — Integration tests for endpoint (20 test cases covering happy path, edge cases, security, performance)
- `tests/unit/test_parts_service.py` — Unit tests for service layer (query logic, RLS filtering, data transformation) — 8-10 tests

### Modify (Existing Files):
- `src/backend/schemas.py` — Add 4 new schemas:
  - `BlockStatus` enum (8 values)
  - `BoundingBox` model (min/max coordinates)
  - `PartCanvasItem` model (7 fields)
  - `PartsListResponse` model (parts list + metadata)
- `src/backend/main.py` — Register new router:
  ```python
  from src.backend.api import parts
  app.include_router(parts.router, prefix="/api", tags=["parts"])
  ```
- `src/frontend/src/types/parts.ts` — Replace stub (currently empty) with full interfaces:
  - `BlockStatus` enum
  - `BoundingBox` interface
  - `PartCanvasItem` interface
  - `PartsListResponse` interface
  - `PartsQueryParams` interface (for type-safe query building)
- `src/backend/constants.py` — Add new constants (optional but recommended):
  ```python
  TABLE_BLOCKS = "blocks"
  INDEX_CANVAS_QUERY = "idx_blocks_canvas_query"
  ```

---

## 7. Reusable Components/Patterns

### Existing Patterns to Follow:

1. **Clean Architecture (from T-004-BACK, T-028-BACK)**
   - **API layer** (`api/parts.py`): HTTP concerns only (routing, request validation, response formatting, error mapping)
   - **Service layer** (`services/parts_service.py`): Business logic, orchestration, data persistence
   - **Schemas** (`schemas.py`): Pydantic models define API contracts

2. **Service Class Pattern (from UploadService, ValidationReportService)**
   ```python
   class PartsService:
       def __init__(self, supabase_client: Client):
           self.supabase = supabase_client
       
       def list_parts(
           self, 
           status: Optional[str], 
           tipologia: Optional[str], 
           workshop_id: Optional[str],
           user_role: str,
           user_workshop_id: Optional[str]
       ) -> List[PartCanvasItem]:
           # Build query with dynamic filters
           # Apply RLS logic based on user role
           # Execute query and transform rows to Pydantic models
   ```

3. **Error Handling (from api/upload.py)**
   - Validate inputs early, raise `HTTPException` with appropriate status codes
   - Use try-except to catch database errors and return 500

4. **Constants Pattern (from constants.py)**
   - Centralize magic strings/numbers in `constants.py`

5. **Contract-First Design (from systemPatterns.md)**
   - Pydantic schema MUST match TypeScript interface exactly
   - Field names: `snake_case` in both (this project uses snake_case in JSON)
   - Nullability: `Optional[str]` = `string | null`

---

## 8. Next Steps

This spec is ready for **TDD-Red** phase.

```
=============================================
READY FOR TDD-RED PHASE - Copy these values:
=============================================
Ticket ID:       T-0501-BACK
Feature name:    List Parts API for 3D Canvas
Sprint:          Sprint 1 (Week 1-2, 2026)
Estimated effort: 4 hours (2h tests + 1.5h implementation + 0.5h refactor)

Key test cases (20 total):
  ✅ Happy Path (6 tests): Fetch all, filter by status/tipologia/workshop/combined, verify new columns
  ⚠️ Edge Cases (5 tests): Empty results, NULL values, empty DB, archived excluded
  🛡️ Security (4 tests): Auth required, invalid enum, invalid UUID, SQL injection
  🔗 Integration (5 tests): Index usage, response size, RLS workshop/BIM, ordering

Files to create:
  - src/backend/api/parts.py
  - src/backend/services/parts_service.py
  - tests/integration/test_parts_api.py (20 tests)
  - tests/unit/test_parts_service.py (8-10 tests)

Files to modify:
  - src/backend/schemas.py (+ 4 schemas)
  - src/backend/main.py (register router)
  - src/frontend/src/types/parts.ts (+ 5 interfaces)

Performance targets:
  - Query: <500ms (index scan required)
  - Response: <200KB gzipped
  - Index: idx_blocks_canvas_query MUST be used

Dependencies:
  - ✅ T-0503-DB DONE (columns + indexes exist)
=============================================
```

---

**Status:** ✅ **READY FOR TDD-RED**  
**Last Updated:** 2026-02-19 (Enrichment Phase Complete)  
**Enriched By:** AI Assistant (Claude Sonnet 4.5 via GitHub Copilot)  
**Estimated Effort:** 4h (2h tests + 1.5h implementation + 0.5h refactor)  
**Risk Level:** 🟢 Low (straightforward CRUD endpoint, pattern established, index validated)  
**Next Phase:** TDD-Red (write 20 failing tests)
