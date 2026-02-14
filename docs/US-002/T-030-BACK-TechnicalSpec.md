# T-030-BACK: Get Validation Status Endpoint - Technical Specification

**Author:** AI Assistant (Prompt #109 - Enrichment Phase)  
**Date:** 2026-02-14  
**Status:** ✅ READY FOR TDD-RED  
**Ticket Type:** BACK (Backend API)  
**Priority:** 🟡 ALTA

---

## 1. Ticket Summary

- **Ticket ID:** T-030-BACK
- **Title:** Get Validation Status Endpoint
- **Type:** BACK (Backend API Development)
- **User Story:** US-002 (Validación Automática por "The Librarian")
- **Scope:** Implementar endpoint `GET /api/parts/{id}/validation` que retorna el estado de validación completo de un block (pieza), incluyendo `validation_report` JSONB, estado actual (`status`), y `job_id` si está en procesamiento.
- **Dependencies:** 
  - **T-020-DB** ✅ DONE - Tabla `blocks` con columna `validation_report JSONB`
  - **T-021-DB** ✅ DONE - ENUM `block_status` extendido (processing, validated, rejected, error_processing)
  - **T-028-BACK** ✅ DONE - ValidationReportService (esquema ValidationReport definido)
  - **T-029-BACK** ✅ DONE - Trigger de validación desde `/api/upload/confirm` (validation_report se popula)

---

## 2. Business Requirements

### 2.1 Functional Requirements

1. **FR-1:** El endpoint debe aceptar un UUID de block en el path (`/api/parts/{id}/validation`)
2. **FR-2:** Debe retornar el `validation_report` JSONB completo si existe (puede ser `null` si no se ha validado)
3. **FR-3:** Debe incluir el estado actual del block (`status`: uploaded, processing, validated, rejected, error_processing)
4. **FR-4:** Si `status = processing`, debe incluir `job_id` para tracking de progreso (Celery task ID)
5. **FR-5:** Debe retornar 404 si el block no existe
6. **FR-6:** Debe retornar 422 si el UUID es malformado

### 2.2 Non-Functional Requirements

- **NFR-1:** Tiempo de respuesta < 200ms (query simple a PostgreSQL con índice en PK)
- **NFR-2:** Error handling completo (DB timeout, migración faltante, conexión fallida)
- **NFR-3:** Logging estructurado para debugging (incluir `block_id` en todos los logs)
- **NFR-4:** Respuesta cacheableable por frontend (HTTP 200 con headers `Cache-Control`)

---

## 3. Data Structures & Contracts

### 3.1 Pydantic Schemas (Backend)

#### 3.1.1 Reusable Schema (Already Exists - T-028-BACK)

```python
# File: src/backend/schemas.py (lines 81-107)
# DO NOT DUPLICATE - Reuse existing ValidationReport

from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field

class ValidationErrorItem(BaseModel):
    """
    Representa un error individual en la validación de un archivo .3dm
    """
    type: str = Field(..., description="Tipo de error: nomenclature | geometry | metadata")
    severity: str = Field(..., description="Severidad: error | warning")
    location: str = Field(..., description="Ubicación del error (layer:name o object:uuid)")
    message: str = Field(..., description="Mensaje descriptivo del error")

class ValidationReport(BaseModel):
    """
    Estructura del reporte de validación retornado por The Librarian agent
    """
    is_valid: bool = Field(..., description="True si el archivo pasó todas las validaciones")
    errors: List[ValidationErrorItem] = Field(default_factory=list, description="Lista de errores encontrados")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Metadatos extraídos del archivo")
    validated_at: Optional[datetime] = Field(None, description="Timestamp de validación (ISO 8601)")
    validated_by: Optional[str] = Field(None, description="Identificador del validador (ej: 'librarian-v1.2.3')")
```

#### 3.1.2 New Response Schema (TO CREATE in schemas.py)

```python
# File: src/backend/schemas.py (ADD after ValidationReport)

from enum import Enum
from uuid import UUID

class BlockStatus(str, Enum):
    """
    Estados del ciclo de vida de un block (pieza)
    Sincronizado con ENUM block_status en PostgreSQL (T-021-DB)
    """
    UPLOADED = "uploaded"
    PROCESSING = "processing"
    VALIDATED = "validated"
    REJECTED = "rejected"
    ERROR_PROCESSING = "error_processing"
    IN_FABRICATION = "in_fabrication"
    COMPLETED = "completed"
    ARCHIVED = "archived"

class ValidationStatusResponse(BaseModel):
    """
    Response del endpoint GET /api/parts/{id}/validation
    Combina metadata del block + validation_report completo
    """
    block_id: UUID = Field(..., description="UUID único del block")
    iso_code: str = Field(..., description="Código ISO del block (ej: 'PENDING-a1b2c3d4', 'SAGR-Z1-001')")
    status: BlockStatus = Field(..., description="Estado actual del block en su ciclo de vida")
    validation_report: Optional[ValidationReport] = Field(
        None, 
        description="Reporte de validación completo (NULL si aún no se ha validado)"
    )
    job_id: Optional[str] = Field(
        None, 
        description="ID del job de Celery si status=processing (para tracking de progreso)"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "block_id": "550e8400-e29b-41d4-a716-446655440000",
                "iso_code": "PENDING-a1b2c3d4",
                "status": "validated",
                "validation_report": {
                    "is_valid": True,
                    "errors": [],
                    "metadata": {
                        "total_objects": 42,
                        "valid_objects": 42,
                        "invalid_objects": 0,
                        "user_strings_extracted": 15
                    },
                    "validated_at": "2026-02-14T23:15:00Z",
                    "validated_by": "librarian-v1.0.0"
                },
                "job_id": None
            }
        }
```

### 3.2 TypeScript Interfaces (Frontend)

#### 3.2.1 Location: `src/frontend/src/types/validation.ts` (UPDATE)

```typescript
// File: src/frontend/src/types/validation.ts
// CRITICAL: Must match Pydantic schemas EXACTLY (field names, types, nullability)

export type BlockStatus = 
  | "uploaded" 
  | "processing" 
  | "validated" 
  | "rejected" 
  | "error_processing" 
  | "in_fabrication" 
  | "completed" 
  | "archived";

export interface ValidationErrorItem {
  type: "nomenclature" | "geometry" | "metadata";
  severity: "error" | "warning";
  location: string;  // Format: "layer:name" or "object:uuid"
  message: string;
}

export interface ValidationReport {
  is_valid: boolean;
  errors: ValidationErrorItem[];
  metadata: Record<string, any>;
  validated_at: string | null;  // ISO 8601 timestamp
  validated_by: string | null;  // Validator version (e.g., "librarian-v1.0.0")
}

export interface ValidationStatusResponse {
  block_id: string;  // UUID as string
  iso_code: string;
  status: BlockStatus;
  validation_report: ValidationReport | null;  // NULL if not validated yet
  job_id: string | null;  // Celery task ID if status="processing"
}
```

### 3.3 SQL Query

```sql
-- Query executed by service layer against Supabase PostgreSQL
-- Returns block metadata + validation_report JSONB
-- CRITICAL: validation_report can be NULL (not all blocks are validated)

SELECT 
    id,
    iso_code,
    status,
    validation_report,
    event_id  -- Optional: Include for tracking correlation with events table
FROM blocks
WHERE id = $1;

-- Expected Result (validated block):
-- id                                   | iso_code         | status    | validation_report (JSONB)           | event_id
-- 550e8400-e29b-41d4-a716-446655440000 | PENDING-a1b2c3d4 | validated | {"is_valid": true, "errors": [], ...} | evt_...

-- Expected Result (unvalidated block):
-- id                                   | iso_code         | status   | validation_report | event_id
-- 550e8400-e29b-41d4-a716-446655440000 | PENDING-a1b2c3d4 | uploaded | NULL              | evt_...

-- Edge Case (block not found):
-- Returns 0 rows → Service layer must return (False, None, "Block not found")
```

---

## 4. API Interface

### 4.1 Endpoint Definition

- **Method:** `GET`
- **Path:** `/api/parts/{id}/validation`
- **Path Parameter:** 
  - `id` (required): UUID del block (format: `550e8400-e29b-41d4-a716-446655440000`)
- **Query Parameters:** None
- **Request Body:** None
- **Authentication:** None (MVP - sin autenticación)
- **Rate Limiting:** None (MVP)

### 4.2 Request Examples

#### Example 1: Valid Request (cURL)

```bash
curl -X GET "http://localhost:8000/api/parts/550e8400-e29b-41d4-a716-446655440000/validation" \
  -H "Accept: application/json"
```

#### Example 2: Valid Request (HTTPie)

```bash
http GET "localhost:8000/api/parts/550e8400-e29b-41d4-a716-446655440000/validation"
```

#### Example 3: Invalid UUID (expected 422)

```bash
curl -X GET "http://localhost:8000/api/parts/invalid-uuid/validation"
# Expected Response: 422 Unprocessable Entity
```

### 4.3 Response Examples

#### 4.3.1 Success - Validated Block (200 OK)

```json
{
  "block_id": "550e8400-e29b-41d4-a716-446655440000",
  "iso_code": "PENDING-a1b2c3d4",
  "status": "validated",
  "validation_report": {
    "is_valid": true,
    "errors": [],
    "metadata": {
      "total_objects": 42,
      "valid_objects": 42,
      "invalid_objects": 0,
      "user_strings_extracted": 15,
      "processing_duration_ms": 342
    },
    "validated_at": "2026-02-14T23:15:00Z",
    "validated_by": "librarian-v1.0.0"
  },
  "job_id": null
}
```

#### 4.3.2 Success - Rejected Block (200 OK)

```json
{
  "block_id": "660e8400-e29b-41d4-a716-446655440001",
  "iso_code": "PENDING-b2c3d4e5",
  "status": "rejected",
  "validation_report": {
    "is_valid": false,
    "errors": [
      {
        "type": "nomenclature",
        "severity": "error",
        "location": "layer:SAGR-Z1-001-InvalidLayer",
        "message": "Layer name does not follow BIM nomenclature standard"
      },
      {
        "type": "geometry",
        "severity": "warning",
        "location": "object:7f3a2b1c-9d8e-4f5a-b1c2-3d4e5f6a7b8c",
        "message": "Mesh has non-manifold edges"
      }
    ],
    "metadata": {
      "total_objects": 38,
      "valid_objects": 36,
      "invalid_objects": 2,
      "user_strings_extracted": 12
    },
    "validated_at": "2026-02-14T23:18:00Z",
    "validated_by": "librarian-v1.0.0"
  },
  "job_id": null
}
```

#### 4.3.3 Success - Unvalidated Block (200 OK)

```json
{
  "block_id": "770e8400-e29b-41d4-a716-446655440002",
  "iso_code": "PENDING-c3d4e5f6",
  "status": "uploaded",
  "validation_report": null,
  "job_id": null
}
```

#### 4.3.4 Success - Processing Block (200 OK)

```json
{
  "block_id": "880e8400-e29b-41d4-a716-446655440003",
  "iso_code": "PENDING-d4e5f6a7",
  "status": "processing",
  "validation_report": null,
  "job_id": "celery-task-550e8400-e29b-41d4-a716"
}
```

#### 4.3.5 Error - Block Not Found (404 NOT FOUND)

```json
{
  "detail": "Block with ID 990e8400-e29b-41d4-a716-446655440099 not found"
}
```

#### 4.3.6 Error - Invalid UUID Format (422 UNPROCESSABLE ENTITY)

```json
{
  "detail": [
    {
      "type": "uuid_parsing",
      "loc": ["path", "id"],
      "msg": "Input should be a valid UUID, invalid character",
      "input": "invalid-uuid",
      "url": "https://errors.pydantic.dev/2.6/v/uuid_parsing"
    }
  ]
}
```

#### 4.3.7 Error - Database Connection Failed (500 INTERNAL SERVER ERROR)

```json
{
  "detail": "Database connection failed. Please try again later."
}
```

---

## 5. Implementation Design

### 5.1 Service Layer (NEW - ValidationService)

**Decision:** Create NEW `ValidationService` class (do NOT extend UploadService)  
**Rationale:** Clean Architecture principle - validation concerns are separate from upload concerns  
**Location:** `src/backend/services/validation_service.py` (NEW FILE)

```python
# File: src/backend/services/validation_service.py (TO CREATE)

from typing import Optional, Tuple, Dict, Any
from uuid import UUID
from infra.supabase_client import get_supabase_client
from constants import TABLE_BLOCKS
import logging

logger = logging.getLogger(__name__)

class ValidationService:
    """
    Service layer for validation status queries
    Follows Clean Architecture pattern with 4-tuple returns
    """
    
    def __init__(self):
        self.supabase = get_supabase_client()
    
    def get_validation_status(self, block_id: UUID) -> Tuple[bool, Optional[Dict[str, Any]], Optional[str], Optional[Dict[str, Any]]]:
        """
        Retrieve validation status for a specific block
        
        Args:
            block_id: UUID of the block to query
        
        Returns:
            Tuple of (success, block_data, error_message, extra_metadata)
            - success (bool): True if operation succeeded
            - block_data (dict | None): Block metadata + validation_report if found
            - error_message (str | None): Error description if failed
            - extra_metadata (dict | None): Additional context (e.g., job_id for processing blocks)
        
        Examples:
            success, data, error, extra = service.get_validation_status(uuid)
            
            # Case 1: Block found with validation_report
            (True, {"id": "...", "status": "validated", "validation_report": {...}}, None, None)
            
            # Case 2: Block not found
            (False, None, "Block not found", None)
            
            # Case 3: DB connection error
            (False, None, "Database connection failed", {"exception": "TimeoutError"})
        """
        try:
            logger.info(f"Querying validation status for block_id={block_id}")
            
            # Query blocks table
            response = self.supabase.table(TABLE_BLOCKS) \
                .select("id, iso_code, status, validation_report, event_id") \
                .eq("id", str(block_id)) \
                .execute()
            
            if not response.data or len(response.data) == 0:
                logger.warning(f"Block not found: block_id={block_id}")
                return (False, None, "Block not found", None)
            
            block = response.data[0]
            logger.info(f"Block found: block_id={block_id}, status={block['status']}")
            
            # Extract job_id if status=processing (T-029-BACK stored event_id with task_id metadata)
            job_id = None
            if block["status"] == "processing" and block.get("event_id"):
                # TODO: Query events table to get task_id from event metadata (future enhancement)
                # For now, return event_id as placeholder
                job_id = block["event_id"]
            
            return (True, block, None, {"job_id": job_id})
        
        except Exception as e:
            logger.error(f"Failed to query validation status: block_id={block_id}, error={str(e)}")
            return (False, None, "Database connection failed", {"exception": str(e)})
```

### 5.2 API Layer (NEW - Router)

**Location:** `src/backend/api/validation.py` (NEW FILE)

```python
# File: src/backend/api/validation.py (TO CREATE)

from fastapi import APIRouter, HTTPException, status
from uuid import UUID
from schemas import ValidationStatusResponse, ValidationReport, BlockStatus
from services.validation_service import ValidationService
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/parts", tags=["validation"])

@router.get("/{id}/validation", response_model=ValidationStatusResponse, status_code=status.HTTP_200_OK)
async def get_validation_status(id: UUID) -> ValidationStatusResponse:
    """
    Retrieve validation status for a specific block (part)
    
    Args:
        id: UUID of the block to query
    
    Returns:
        ValidationStatusResponse with block metadata + validation_report
    
    Raises:
        HTTPException 404: If block not found
        HTTPException 500: If database connection fails
    
    Example:
        GET /api/parts/550e8400-e29b-41d4-a716-446655440000/validation
        
        Response 200:
        {
          "block_id": "550e8400-e29b-41d4-a716-446655440000",
          "iso_code": "PENDING-a1b2c3d4",
          "status": "validated",
          "validation_report": {...},
          "job_id": null
        }
    """
    logger.info(f"GET /api/parts/{id}/validation")
    
    service = ValidationService()
    success, block_data, error_msg, extra = service.get_validation_status(id)
    
    if not success:
        if "not found" in error_msg.lower():
            logger.warning(f"Block not found: id={id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Block with ID {id} not found"
            )
        else:
            logger.error(f"Database error: id={id}, error={error_msg}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database connection failed. Please try again later."
            )
    
    # Build response
    return ValidationStatusResponse(
        block_id=block_data["id"],
        iso_code=block_data["iso_code"],
        status=BlockStatus(block_data["status"]),
        validation_report=ValidationReport(**block_data["validation_report"]) if block_data.get("validation_report") else None,
        job_id=extra.get("job_id") if extra else None
    )
```

### 5.3 Router Registration (UPDATE main.py)

```python
# File: src/backend/main.py (MODIFY - add validation router)

from api.upload import router as upload_router
from api.validation import router as validation_router  # ADD THIS LINE

app = FastAPI(title="Sagrada Familia Parts Manager API")

# Register routers
app.include_router(upload_router)
app.include_router(validation_router)  # ADD THIS LINE
```

---

## 6. Test Cases Checklist

### 6.1 Unit Tests (`tests/unit/test_validation_service.py`)

**Total Tests:** 8

- [ ] **test_get_validation_status_success_validated_block()**
  - **Setup:** Mock Supabase response with validated block (validation_report filled, status=validated)
  - **Action:** Call `service.get_validation_status(known_uuid)`
  - **Assert:** `success=True`, `block_data` contains validation_report, `error=None`

- [ ] **test_get_validation_status_success_unvalidated_block()**
  - **Setup:** Mock Supabase response with uploaded block (validation_report=NULL, status=uploaded)
  - **Action:** Call `service.get_validation_status(known_uuid)`
  - **Assert:** `success=True`, `block_data['validation_report']=None`, `error=None`

- [ ] **test_get_validation_status_success_rejected_block()**
  - **Setup:** Mock Supabase response with rejected block (validation_report with errors, status=rejected)
  - **Action:** Call `service.get_validation_status(known_uuid)`
  - **Assert:** `success=True`, `block_data['validation_report']['is_valid']=False`, `errors` list not empty

- [ ] **test_get_validation_status_success_processing_block_with_job_id()**
  - **Setup:** Mock Supabase response with processing block (status=processing, event_id present)
  - **Action:** Call `service.get_validation_status(known_uuid)`
  - **Assert:** `success=True`, `extra['job_id']` is not None

- [ ] **test_get_validation_status_not_found()**
  - **Setup:** Mock Supabase response with empty data array (block not found)
  - **Action:** Call `service.get_validation_status(random_uuid)`
  - **Assert:** `success=False`, `block_data=None`, `error="Block not found"`

- [ ] **test_get_validation_status_db_connection_error()**
  - **Setup:** Mock Supabase client to raise `Exception("Connection timeout")`
  - **Action:** Call `service.get_validation_status(known_uuid)`
  - **Assert:** `success=False`, `error="Database connection failed"`, `extra['exception']` contains error details

- [ ] **test_get_validation_status_invalid_uuid_format()**
  - **Setup:** Pass malformed UUID string (e.g., `"invalid-uuid"`)
  - **Action:** Call `service.get_validation_status("invalid-uuid")`
  - **Assert:** Function raises `ValueError` or Pydantic validation error

- [ ] **test_get_validation_status_missing_validation_report_column()**
  - **Setup:** Mock Supabase response with block data missing `validation_report` key (simulates migration not run)
  - **Action:** Call `service.get_validation_status(known_uuid)`
  - **Assert:** `success=True`, handles missing column gracefully (default to None)

### 6.2 Integration Tests (`tests/integration/test_get_validation_status.py`)

**Total Tests:** 5

- [ ] **test_get_validation_status_endpoint_validated_block()**
  - **Setup:** Create block in Supabase with validation_report (use fixture from T-029-BACK tests)
  - **Action:** `GET /api/parts/{block_id}/validation`
  - **Assert:** HTTP 200, response JSON matches ValidationStatusResponse schema, validation_report not null

- [ ] **test_get_validation_status_endpoint_unvalidated_block()**
  - **Setup:** Create block in Supabase WITHOUT validation_report (status=uploaded)
  - **Action:** `GET /api/parts/{block_id}/validation`
  - **Assert:** HTTP 200, response JSON has `validation_report=null`

- [ ] **test_get_validation_status_endpoint_not_found()**
  - **Setup:** Use random UUID that doesn't exist in database
  - **Action:** `GET /api/parts/{random_uuid}/validation`
  - **Assert:** HTTP 404, error message "Block with ID ... not found"

- [ ] **test_get_validation_status_endpoint_invalid_uuid()**
  - **Setup:** None (direct request with invalid UUID)
  - **Action:** `GET /api/parts/invalid-uuid/validation`
  - **Assert:** HTTP 422, Pydantic validation error in response

- [ ] **test_get_validation_status_after_confirm_flow()**
  - **Setup:** Execute full US-002 flow: upload file → confirm upload → wait for validation
  - **Action:** `GET /api/parts/{block_id}/validation` after validation completes
  - **Assert:** HTTP 200, `status` transitions from `uploaded` → `processing` → `validated` or `rejected`

---

## 7. Files to Create/Modify

### 7.1 New Files

- [ ] `src/backend/services/validation_service.py`
  - **Lines:** ~80 lines
  - **Content:** ValidationService class with get_validation_status() method

- [ ] `src/backend/api/validation.py`
  - **Lines:** ~50 lines
  - **Content:** FastAPI router with GET /api/parts/{id}/validation endpoint

- [ ] `tests/unit/test_validation_service.py`
  - **Lines:** ~250 lines
  - **Content:** 8 unit tests covering service layer logic

- [ ] `tests/integration/test_get_validation_status.py`
  - **Lines:** ~200 lines
  - **Content:** 5 integration tests covering endpoint behavior

### 7.2 Files to Modify

- [ ] `src/backend/schemas.py`
  - **Changes:** Add BlockStatus ENUM + ValidationStatusResponse schema (~40 lines)
  - **Location:** After ValidationReport class (line ~108)

- [ ] `src/backend/main.py`
  - **Changes:** Import validation_router and register with app.include_router()
  - **Location:** After upload_router registration (~2 lines)

- [ ] `src/frontend/src/types/validation.ts`
  - **Changes:** Add BlockStatus type + ValidationStatusResponse interface (~20 lines)
  - **Location:** After ValidationReport interface

---

## 8. Reusable Components/Patterns

### 8.1 Existing Assets (DO NOT RECREATE)

- [x] **ValidationReport schema** (T-020-DB + T-028-BACK)
  - **File:** `src/backend/schemas.py` (lines 81-107)
  - **Reuse:** Import and embed in ValidationStatusResponse

- [x] **ValidationErrorItem schema** (T-028-BACK)
  - **File:** `src/backend/schemas.py` (lines 70-80)
  - **Reuse:** Part of ValidationReport.errors[] array

- [x] **TABLE_BLOCKS constant** (T-020-DB)
  - **File:** `src/backend/constants.py` (line 24)
  - **Reuse:** Use in ValidationService SQL query

- [x] **Supabase client singleton** (T-001-BACK)
  - **File:** `infra/supabase_client.py`
  - **Reuse:** Inject into ValidationService.__init__()

- [x] **Clean Architecture pattern** (T-029-BACK)
  - **Pattern:** Service layer returns 4-tuple `(success, data, error, extra)`
  - **Reuse:** Follow same pattern in ValidationService

- [x] **blocks table with validation_report JSONB** (T-020-DB + T-021-DB)
  - **Migrations:** 20260211155000 (table creation) + 20260211160000 (add validation_report column)
  - **Reuse:** Query existing table, do NOT create new migrations

### 8.2 New Patterns Introduced

- **BlockStatus ENUM in Pydantic:** Maps to PostgreSQL ENUM (8 values from T-021-DB)
- **Readonly Endpoint Pattern:** No mutations, pure query endpoint (first read-only endpoint in project)
- **job_id Tracking:** Placeholder for future Celery task monitoring (T-029-BACK integration)

---

## 9. Definition of Done (DoD)

### 9.1 Code Completeness

- [ ] ValidationService implemented with get_validation_status() method
- [ ] GET /api/parts/{id}/validation endpoint implemented in validation.py router
- [ ] BlockStatus ENUM + ValidationStatusResponse schema added to schemas.py
- [ ] Router registered in main.py
- [ ] TypeScript interfaces added to validation.ts (frontend)

### 9.2 Testing

- [ ] 8/8 unit tests passing (`tests/unit/test_validation_service.py`)
- [ ] 5/5 integration tests passing (`tests/integration/test_get_validation_status.py`)
- [ ] Full backend test suite passing (47+ tests total including regression)
- [ ] No new test files excluded from `make test-agent` (CI/CD compatibility)

### 9.3 Documentation

- [ ] API endpoint documented with docstrings (FastAPI auto-generates OpenAPI)
- [ ] Service method documented with Args/Returns/Examples
- [ ] TypeScript interfaces documented with JSDoc comments
- [ ] This technical spec committed to `docs/US-002/T-030-BACK-TechnicalSpec.md`

### 9.4 Quality Gates

- [ ] Code follows Clean Architecture pattern (API → Service → DB)
- [ ] Pydantic schemas 100% aligned with TypeScript interfaces
- [ ] Error handling covers all edge cases (404, 422, 500)
- [ ] Logging present at INFO level for all operations
- [ ] No hardcoded strings (all constants from constants.py)

### 9.5 Integration

- [ ] Endpoint accessible via cURL/Postman at `http://localhost:8000/api/parts/{id}/validation`
- [ ] OpenAPI docs updated at `http://localhost:8000/docs`
- [ ] Frontend can successfully fetch validation status (CORS enabled)
- [ ] End-to-end flow works: upload → confirm → validate → get status

---

## 10. Next Steps (Handoff to TDD-RED Phase)

### 10.1 Immediate Actions

1. **Create test file skeleton:**
   ```bash
   touch tests/unit/test_validation_service.py
   touch tests/integration/test_get_validation_status.py
   ```

2. **Implement 8 failing unit tests** in `test_validation_service.py`:
   - Follow test names from Section 6.1
   - Use pytest fixtures for Supabase mocking
   - Each test must FAIL initially (RED state)

3. **Verify RED state:**
   ```bash
   make test-backend
   # Expected: 0 passing, 8 failing (new tests)
   # Expected: 39 passing, 8 failing (total with regression)
   ```

4. **Commit TDD-RED state:**
   ```bash
   git add tests/unit/test_validation_service.py
   git commit -m "feat(T-030-BACK): TDD-RED - 8 failing unit tests for ValidationService"
   ```

### 10.2 TDD Workflow Phases

1. **Phase 1: TDD-RED** (Current handoff target)
   - Write 8 failing unit tests
   - Verify `make test-backend` shows RED state
   - Register prompt in prompts.md (#110)

2. **Phase 2: TDD-GREEN** (After RED approval)
   - Implement ValidationService.get_validation_status()
   - Implement GET /api/parts/{id}/validation endpoint
   - Add schemas to schemas.py
   - Verify all 8 tests pass (GREEN state)

3. **Phase 3: TDD-REFACTOR** (After GREEN approval)
   - Code review for Clean Architecture compliance
   - Extract duplicated code to helpers
   - Optimize SQL query if needed
   - Add integration tests (5 tests)

4. **Phase 4: TDD-AUDIT** (Final gate before merge)
   - Execute audit protocol (5 steps)
   - Run regression tests (47+ tests must pass)
   - Generate audit report
   - Mark T-030-BACK as DONE in backlog

### 10.3 Success Criteria

- **TDD-RED Success:** 8 unit tests written, all failing, committed to Git
- **TDD-GREEN Success:** 8 unit tests + 5 integration tests passing, endpoint functional
- **TDD-REFACTOR Success:** Code review passed, no duplication, Clean Architecture verified
- **TDD-AUDIT Success:** Audit score 100/100, regression tests passing, ready for merge

---

## 11. Risk Assessment

### 11.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| validation_report JSONB parsing fails | LOW | HIGH | Use Pydantic ValidationReport.parse_obj() with try/except |
| job_id tracking not implemented in T-029 | MEDIUM | MEDIUM | Return event_id as placeholder, document TODO for future |
| Frontend TypeScript interface mismatch | LOW | HIGH | Run `npm run type-check` before commit, validate with sample data |
| Migration 20260211160000 not run in test DB | LOW | CRITICAL | Add assertion in conftest.py to verify column exists |

### 11.2 Dependencies Risks

| Dependency | Status | Risk | Plan |
|------------|--------|------|------|
| T-020-DB (blocks table) | ✅ DONE | NONE | Table exists with all columns |
| T-021-DB (block_status ENUM) | ✅ DONE | NONE | ENUM has 8 values as expected |
| T-028-BACK (ValidationReport schema) | ✅ DONE | NONE | Schema reusable, tested in T-028 |
| T-029-BACK (validation_report population) | ✅ DONE | LOW | Assumes validation_report is populated by T-029 flow |

---

## 12. Appendix

### 12.1 SQL Schema Reference (T-020-DB)

```sql
-- blocks table structure (from migration 20260211155000)
CREATE TABLE blocks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    iso_code text NOT NULL UNIQUE,
    status block_status NOT NULL DEFAULT 'uploaded',
    event_id text,
    rhino_metadata jsonb DEFAULT '{}'::jsonb,
    zone_id text,
    workshop_id text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- validation_report column (from migration 20260211160000)
ALTER TABLE blocks ADD COLUMN validation_report jsonb DEFAULT NULL;

-- block_status ENUM (from migration 20260212100000)
CREATE TYPE block_status AS ENUM (
    'uploaded', 
    'processing', 
    'validated', 
    'rejected', 
    'error_processing', 
    'in_fabrication', 
    'completed', 
    'archived'
);
```

### 12.2 Example JSONB Structure (validation_report)

```json
{
  "is_valid": false,
  "validated_at": "2026-02-14T23:15:00Z",
  "validated_by": "librarian-v1.0.0",
  "errors": [
    {
      "type": "nomenclature",
      "severity": "error",
      "location": "layer:SAGR-INVALID",
      "message": "Layer name does not follow BIM standard"
    }
  ],
  "metadata": {
    "total_objects": 42,
    "valid_objects": 40,
    "invalid_objects": 2,
    "user_strings_extracted": 15,
    "processing_duration_ms": 342
  }
}
```

### 12.3 Constants Reference

```python
# From src/backend/constants.py
TABLE_BLOCKS = "blocks"
EVENT_TYPE_VALIDATION_PASSED = "validation.passed"
EVENT_TYPE_VALIDATION_FAILED = "validation.failed"
```

---

**END OF TECHNICAL SPECIFICATION**

**Status:** ✅ READY FOR TDD-RED  
**Next Action:** Create `tests/unit/test_validation_service.py` with 8 failing tests  
**Workflow:** T-030-BACK-TDD-RED → T-030-BACK-TDD-GREEN → T-030-BACK-TDD-REFACTOR → T-030-BACK-AUDIT
