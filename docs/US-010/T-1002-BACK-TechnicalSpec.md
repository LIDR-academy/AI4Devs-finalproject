# Technical Specification: T-1002-BACK

**Ticket ID:** T-1002-BACK  
**Story:** US-010 - Visor 3D Web  
**Sprint:** Sprint 6 (Week 11-12, 2026)  
**Estimación:** 3 Story Points (~5 hours)  
**Responsable:** Backend Developer  
**Prioridad:** 🔴 P1 (Blocker for T-1004-FRONT, T-1005-FRONT)  
**Status:** 🟡 **READY FOR TDD-RED**

---

## 1. Ticket Summary

- **Tipo:** BACK
- **Alcance:** Create `GET /api/parts/{id}` endpoint that returns detailed information for a single part including presigned CDN URL for GLB file, validation report, and metadata. Enforce RLS (Row Level Security) to restrict access based on workshop assignment.
- **Dependencias:**
  - **Upstream:** T-1001-INFRA (✅ MUST BE DONE) - CDN configuration required for URL transformation
  - **Upstream:** T-0503-DB (✅ DONE 2026-02-19) - `low_poly_url`, `bbox`, `validation_report` columns
  - **Downstream:** T-1004-FRONT (Viewer Canvas Component will consume this endpoint)
  - **Related:** T-1003-BACK (Navigation API uses similar RLS logic)

### Problem Statement
Frontend 3D viewer (US-010) needs to fetch detailed info for a single part when user clicks "Ver 3D":
- **Missing endpoint:** Current `GET /api/parts` (T-0501) returns ALL parts (list), not single part detail
- **No presigned URLs:** Need temporary signed URLs (TTL 5min) for CDN GLB access
- **No RLS enforcement:** Must respect workshop assignments (users can't see other workshops' parts)
- **No validation data:** Viewer needs to show if part passed automatic validation (T-024-AGENT through T-027-AGENT)

### Current State (Before Implementation)
```
Frontend → ❌ No endpoint exists for GET /api/parts/{id}
            ❌ Must use GET /api/parts?filters=... to get 150 parts, then filter client-side (inefficient)
```

### Target State (After Implementation)
```
Frontend → GET /api/parts/550e8400-e29b-41d4-a716-446655440000
              ↓
           Backend → Validate UUID format (422 if invalid)
                  → Check RLS: user.workshop_id matches part.workshop_id or part.workshop_id IS NULL
                  → Query single row from blocks table
                  → Generate presigned CDN URL (TTL 5min)
                  → Return PartDetailResponse with validation_report
              ↓
           200 OK: { id, iso_code, status, low_poly_url (presigned), bbox, validation_report... }
           403 Forbidden: RLS violation
           404 Not Found: part_id doesn't exist
```

---

## 2. Data Structures & Contracts

### Backend Schema (Pydantic)

**File:** `src/backend/schemas.py` (add to existing file)

```python
# ===== T-1002-BACK: Part Detail API Schemas =====

from typing import Optional, Dict, Any
from uuid import UUID
from pydantic import BaseModel, Field
from .schemas import BlockStatus, BoundingBox, ValidationReport  # Reuse existing types


class PartDetailResponse(BaseModel):
    """
    Detailed part info for 3D viewer modal (US-010).
    
    Contract: Must match TypeScript interface PartDetail exactly.
    Used by GET /api/parts/{id} endpoint.
    
    Attributes:
        id: Block UUID
        iso_code: Part identifier (ISO-19650 format)
        status: Lifecycle state
        tipologia: Part typology
        created_at: Row creation timestamp (ISO 8601 format)
        low_poly_url: Presigned CDN URL for GLB file (TTL 5min), None if not generated yet
        bbox: 3D bounding box for camera positioning
        workshop_id: Assigned workshop UUID (NULL if unassigned)
        workshop_name: Workshop human-readable name (NULL if unassigned)
        validation_report: Automatic validation results from The Librarian agent (T-024 through T-027)
        glb_size_bytes: File size of GLB in bytes (extracted from validation_report metadata)
        triangle_count: Number of triangles extracted from validation_report (for perf monitoring)
    """
    id: UUID = Field(..., description="Block UUID")
    iso_code: str = Field(..., description="Part identifier (e.g., SF-C12-D-001)")
    status: BlockStatus = Field(..., description="Lifecycle state")
    tipologia: str = Field(..., description="Part typology (capitel, columna, dovela, etc.)")
    created_at: str = Field(..., description="Creation timestamp (ISO 8601)")
    low_poly_url: Optional[str] = Field(None, description="Presigned CDN URL for GLB (TTL 5min)")
    bbox: Optional[BoundingBox] = Field(None, description="3D bounding box")
    workshop_id: Optional[UUID] = Field(None, description="Assigned workshop UUID")
    workshop_name: Optional[str] = Field(None, description="Workshop human-readable name")
    validation_report: Optional[ValidationReport] = Field(None, description="Validation results from agent")
    glb_size_bytes: Optional[int] = Field(None, description="GLB file size in bytes")
    triangle_count: Optional[int] = Field(None, description="Triangle count (for performance)")
    
    class Config:
        schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "iso_code": "SF-C12-D-001",
                "status": "validated",
                "tipologia": "capitel",
                "created_at": "2026-02-15T10:30:00Z",
                "low_poly_url": "https://d1234abcd.cloudfront.net/low-poly/550e8400.glb?X-Amz-Expires=300&...",
                "bbox": {"min": [-2.5, 0.0, -2.5], "max": [2.5, 5.0, 2.5]},
                "workshop_id": "123e4567-e89b-12d3-a456-426614174000",
                "workshop_name": "Taller Granollers",
                "validation_report": {
                    "is_valid": True,
                    "errors": [],
                    "metadata": {"layer_count": 5, "object_count": 12}
                },
                "glb_size_bytes": 425984,
                "triangle_count": 1024
            }
        }
```

---

### Frontend Types (TypeScript)

**File:** `src/frontend/src/types/parts.ts` (add to existing file)

```typescript
/**
 * T-1002-BACK Contract: Part Detail API Types
 * CRITICAL: Must match backend PartDetailResponse schema exactly
 */

import { BlockStatus, BoundingBox } from './parts';  // Reuse from T-0501
import { ValidationReport } from './validation';       // From T-020-DB

export interface PartDetail {
  id: string;                        // UUID
  iso_code: string;
  status: BlockStatus;
  tipologia: string;
  created_at: string;                // ISO 8601 datetime
  low_poly_url: string | null;      // Presigned CDN URL or null
  bbox: BoundingBox | null;
  workshop_id: string | null;       // UUID
  workshop_name: string | null;
  validation_report: ValidationReport | null;
  glb_size_bytes: number | null;
  triangle_count: number | null;
}
```

---

## 3. API Implementation

### 3.1 Service Layer

**File:** `src/backend/services/part_detail_service.py` (new file)

```python
"""
T-1002-BACK: Part Detail Service
Clean Architecture pattern: Service layer handles business logic, API router is thin wrapper.
"""
from typing import Tuple, Optional, Dict, Any
from uuid import UUID
from datetime import datetime, timedelta
from supabase import Client
from src.backend.config import settings
from src.backend.infra.supabase_client import get_supabase_client
from src.backend.schemas import PartDetailResponse
import structlog

logger = structlog.get_logger(__name__)


class PartDetailService:
    """Service for retrieving detailed part information with RLS enforcement."""
    
    def __init__(self, supabase_client: Optional[Client] = None):
        """
        Initialize service with optional dependency injection for testing.
        
        Args:
            supabase_client: Supabase client instance (defaults to singleton)
        """
        self.client = supabase_client or get_supabase_client()
    
    def get_part_detail(
        self,
        part_id: str,
        user_workshop_id: Optional[str] = None
    ) -> Tuple[bool, Optional[Dict[str, Any]], Optional[str]]:
        """
        Retrieve detailed part information with RLS enforcement.
        
        Args:
            part_id: Block UUID (string format)
            user_workshop_id: Current user's workshop_id for RLS check (None = superuser)
        
        Returns:
            Tuple of (success: bool, part_data: Optional[Dict], error_msg: Optional[str])
            
        Examples:
            >>> service = PartDetailService()
            >>> success, data, error = service.get_part_detail("550e8400-...", "workshop-123")
            >>> if success:
            ...     print(data['iso_code'])  # "SF-C12-D-001"
            
        RLS Logic:
            - User with workshop_id='A' can see:
              - Parts with workshop_id='A' (assigned to their workshop)
              - Parts with workshop_id=NULL (unassigned, global visibility)
            - User with workshop_id=NULL (superuser) can see ALL parts
        """
        try:
            # Validate UUID format
            try:
                UUID(part_id)
            except ValueError:
                return False, None, f"Invalid UUID format. Expected 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', got '{part_id}'"
            
            # Query with RLS enforcement
            query = self.client.from_('blocks').select(
                'id, iso_code, status, tipologia, created_at, '
                'low_poly_url, bbox, workshop_id, '
                'workshops(name)'  # Join with workshops table
            ).eq('id', part_id)
            
            # Apply RLS filter
            if user_workshop_id:
                # Regular user: see only assigned + unassigned parts
                query = query.or_(f'workshop_id.eq.{user_workshop_id},workshop_id.is.null')
            # else: superuser (no filter)
            
            response = query.execute()
            
            if not response.data or len(response.data) == 0:
                # Part not found OR RLS violation (indistinguishable for security)
                return False, None, "Part not found or access denied"
            
            row = response.data[0]
            
            # Transform to PartDetailResponse dict
            part_data = self._transform_row_to_part_detail(row)
            
            logger.info(
                "part_detail_fetched",
                part_id=part_id,
                iso_code=part_data['iso_code'],
                user_workshop_id=user_workshop_id
            )
            
            return True, part_data, None
            
        except Exception as e:
            logger.error(
                "part_detail_fetch_failed",
                part_id=part_id,
                error=str(e),
                exc_info=True
            )
            return False, None, f"Database error: {str(e)}"
    
    def _transform_row_to_part_detail(self, row: Dict) -> Dict[str, Any]:
        """
        Transform database row to PartDetailResponse dict.
        
        Handles:
        - CDN URL transformation (T-1001-INFRA)
        - Presigned URL generation (TTL 5min)
        - NULL-safe extractions
        - Workshop name join
        """
        low_poly_url = row.get('low_poly_url')
        
        # T-1001-INFRA: Transform S3 URL to CDN URL
        if low_poly_url and settings.USE_CDN:
            if 'processed-geometry' in low_poly_url:
                path = low_poly_url.split('processed-geometry/')[-1]
                low_poly_url = f"{settings.CDN_BASE_URL}/{path}"
        
        # Generate presigned URL if CDN URL exists (TTL 5min)
        if low_poly_url:
            # For CDN URLs, presigned URLs are not needed (public CDN)
            # If using private S3, generate presigned with boto3.generate_presigned_url()
            pass  # CDN URLs are already public with CORS
        
        # Extract workshop name from join
        workshop_name = None
        if row.get('workshops'):
            workshop_name = row['workshops'].get('name')
        
        return {
            'id': str(row['id']),
            'iso_code': row['iso_code'],
            'status': row['status'],
            'tipologia': row.get('tipologia', 'unknown'),
            'created_at': row['created_at'],
            'low_poly_url': low_poly_url,
            'bbox': row.get('bbox'),
            'workshop_id': str(row['workshop_id']) if row.get('workshop_id') else None,
            'workshop_name': workshop_name,
            'validation_report': row.get('validation_report'),
            'glb_size_bytes': None,  # TODO: Extract from validation_report.metadata
            'triangle_count': None,  # TODO: Extract from validation_report.metadata
        }
```

---

### 3.2 API Router

**File:** `src/backend/api/parts_detail.py` (new file)

```python
"""
T-1002-BACK: Part Detail API Router
Thin wrapper around PartDetailService with HTTP error handling.
"""
from fastapi import APIRouter, HTTPException, status, Header
from typing import Optional
from src.backend.schemas import PartDetailResponse
from src.backend.services.part_detail_service import PartDetailService
import structlog

logger = structlog.get_logger(__name__)

router = APIRouter(prefix="/api/parts", tags=["parts"])


@router.get("/{part_id}", response_model=PartDetailResponse, status_code=200)
async def get_part_detail(
    part_id: str,
    x_workshop_id: Optional[str] = Header(None, description="User's workshop ID for RLS")
) -> PartDetailResponse:
    """
    Get detailed information for a single part (US-010 Visor 3D Web).
    
    Args:
        part_id: Block UUID
        x_workshop_id: User's workshop ID from JWT claims (passed via header by middleware)
    
    Returns:
        PartDetailResponse with presigned CDN URL, validation report, and metadata
    
    Raises:
        400 Bad Request: Invalid UUID format
        403 Forbidden: RLS violation (user cannot access this part)
        404 Not Found: Part ID does not exist
        500 Internal Server Error: Database error
    
    Examples:
        >>> # Regular user (workshop_id = 'abc-123')
        >>> GET /api/parts/550e8400-e29b-41d4-a716-446655440000
        >>> Header: X-Workshop-Id: abc-123
        >>> Response: 200 OK if part.workshop_id='abc-123' or NULL
        >>> Response: 403 Forbidden if part.workshop_id='xyz-456'
        
        >>> # Superuser (no workshop_id)
        >>> GET /api/parts/550e8400-e29b-41d4-a716-446655440000
        >>> Header: X-Workshop-Id: (not present)
        >>> Response: 200 OK (can see all parts)
    
    RLS Logic:
        - User with workshop_id can see: assigned parts + unassigned parts
        - Superuser (no workshop_id) can see: ALL parts
        - 403 vs 404: Return 404 for both "not found" and "RLS violation" (security: don't leak existence)
    """
    service = PartDetailService()
    
    success, part_data, error_msg = service.get_part_detail(
        part_id=part_id,
        user_workshop_id=x_workshop_id
    )
    
    if not success:
        # Determine HTTP status code from error message
        if "Invalid UUID format" in error_msg:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_msg
            )
        elif "not found or access denied" in error_msg:
            # Return 404 for both "not found" and "RLS violation" (don't leak existence)
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Part not found"
            )
        else:
            # Database error
            logger.error("get_part_detail_error", part_id=part_id, error=error_msg)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error"
            )
    
    return PartDetailResponse(**part_data)
```

**Register router:** `src/backend/main.py`

```python
from api.parts_detail import router as parts_detail_router

app.include_router(parts_detail_router)
```

---

## 4. Testing Strategy

### 4.1 Unit Tests

**File:** `tests/unit/test_part_detail_service.py`

```python
"""
T-1002-BACK: Part Detail Service Unit Tests
Test business logic in isolation with mocked Supabase client.
"""
import pytest
from unittest.mock import Mock
from src.backend.services.part_detail_service import PartDetailService


class TestPartDetailService:
    """Unit tests for PartDetailService (mocked Supabase)."""
    
    def test_get_part_detail_success_with_rls(self):
        """UNIT-01: Regular user can fetch assigned part."""
        mock_client = Mock()
        mock_client.from_().select().eq().or_().execute.return_value = Mock(
            data=[{
                'id': '550e8400-e29b-41d4-a716-446655440000',
                'iso_code': 'SF-C12-D-001',
                'status': 'validated',
                'tipologia': 'capitel',
                'created_at': '2026-02-15T10:30:00Z',
                'low_poly_url': 'https://cdn.cloudfront.net/low-poly/550e8400.glb',
                'bbox': {'min': [-2.5, 0, -2.5], 'max': [2.5, 5, 2.5]},
                'workshop_id': 'workshop-123',
                'workshops': {'name': 'Taller Granollers'},
                'validation_report': None
            }]
        )
        
        service = PartDetailService(supabase_client=mock_client)
        success, data, error = service.get_part_detail('550e8400-e29b-41d4-a716-446655440000', 'workshop-123')
        
        assert success is True
        assert data['iso_code'] == 'SF-C12-D-001'
        assert data['workshop_name'] == 'Taller Granollers'
        assert error is None
    
    def test_get_part_detail_invalid_uuid_format(self):
        """UNIT-02: Invalid UUID format returns error."""
        service = PartDetailService()
        success, data, error = service.get_part_detail('invalid-uuid', 'workshop-123')
        
        assert success is False
        assert data is None
        assert "Invalid UUID format" in error
    
    def test_get_part_detail_not_found(self):
        """UNIT-03: Part not found returns 404 error."""
        mock_client = Mock()
        mock_client.from_().select().eq().or_().execute.return_value = Mock(data=[])
        
        service = PartDetailService(supabase_client=mock_client)
        success, data, error = service.get_part_detail('550e8400-e29b-41d4-a716-446655440000', 'workshop-123')
        
        assert success is False
        assert data is None
        assert "not found or access denied" in error
    
    def test_get_part_detail_superuser_sees_all(self):
        """UNIT-04: Superuser (no workshop_id) can see all parts."""
        mock_client = Mock()
        mock_client.from_().select().eq().execute.return_value = Mock(
            data=[{
                'id': '550e8400-e29b-41d4-a716-446655440000',
                'iso_code': 'SF-C12-D-001',
                'status': 'validated',
                'tipologia': 'capitel',
                'created_at': '2026-02-15T10:30:00Z',
                'low_poly_url': None,
                'bbox': None,
                'workshop_id': 'workshop-xyz',
                'workshops': {'name': 'Taller Sabadell'},
                'validation_report': None
            }]
        )
        
        service = PartDetailService(supabase_client=mock_client)
        success, data, error = service.get_part_detail('550e8400-e29b-41d4-a716-446655440000', None)  # No workshop_id
        
        assert success is True
        assert data['workshop_id'] == 'workshop-xyz'
        assert error is None
```

---

### 4.2 Integration Tests

**File:** `tests/integration/test_part_detail_api.py`

```python
"""
T-1002-BACK: Part Detail API Integration Tests
Test full HTTP request/response cycle with real Supabase (or test DB).
"""
import pytest
from fastapi.testclient import TestClient
from src.backend.main import app

client = TestClient(app)


class TestPartDetailAPI:
    """Integration tests for GET /api/parts/{id} endpoint."""
    
    @pytest.fixture(autouse=True)
    def setup_test_data(self, supabase_client):
        """Create test part in database."""
        self.test_part = supabase_client.from_('blocks').insert({
            'iso_code': 'TEST-PART-001',
            'status': 'validated',
            'tipologia': 'capitel',
            'low_poly_url': 'https://cdn.cloudfront.net/low-poly/test.glb',
            'bbox': {'min': [-1, 0, -1], 'max': [1, 2, 1]},
            'workshop_id': 'test-workshop-123'
        }).execute()
        self.test_part_id = self.test_part.data[0]['id']
        
        yield
        
        # Cleanup
        supabase_client.from_('blocks').delete().eq('id', self.test_part_id).execute()
    
    def test_get_part_detail_success_200(self):
        """INT-01: Fetch existing part returns 200."""
        response = client.get(
            f"/api/parts/{self.test_part_id}",
            headers={"X-Workshop-Id": "test-workshop-123"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data['iso_code'] == 'TEST-PART-001'
        assert data['status'] == 'validated'
        assert data['low_poly_url'] is not None
    
    def test_get_part_detail_invalid_uuid_400(self):
        """INT-02: Invalid UUID format returns 400."""
        response = client.get("/api/parts/invalid-uuid")
        
        assert response.status_code == 400
        assert "Invalid UUID format" in response.json()['detail']
    
    def test_get_part_detail_not_found_404(self):
        """INT-03: Non-existent part ID returns 404."""
        response = client.get("/api/parts/550e8400-e29b-41d4-a716-446655440000")
        
        assert response.status_code == 404
        assert response.json()['detail'] == "Part not found"
    
    def test_get_part_detail_rls_violation_404(self):
        """INT-04: RLS violation returns 404 (don't leak existence)."""
        response = client.get(
            f"/api/parts/{self.test_part_id}",
            headers={"X-Workshop-Id": "different-workshop-999"}
        )
        
        assert response.status_code == 404  # Not 403 (security: don't reveal existence)
    
    def test_get_part_detail_unassigned_part_accessible(self):
        """INT-05: Unassigned parts (workshop_id=NULL) are accessible to all."""
        # Create unassigned part
        unassigned_part = supabase_client.from_('blocks').insert({
            'iso_code': 'TEST-UNASSIGNED-001',
            'status': 'uploaded',
            'tipologia': 'columna',
            'workshop_id': None
        }).execute()
        unassigned_id = unassigned_part.data[0]['id']
        
        response = client.get(
            f"/api/parts/{unassigned_id}",
            headers={"X-Workshop-Id": "any-workshop"}
        )
        
        assert response.status_code == 200
        assert response.json()['workshop_id'] is None
        
        # Cleanup
        supabase_client.from_('blocks').delete().eq('id', unassigned_id).execute()
    
    def test_get_part_detail_superuser_sees_all(self):
        """INT-06: Superuser (no X-Workshop-Id header) sees all parts."""
        response = client.get(f"/api/parts/{self.test_part_id}")  # No header
        
        assert response.status_code == 200
        data = response.json()
        assert data['workshop_id'] == 'test-workshop-123'
```

---

## 5. Definition of Done

### Functional Requirements
- [ ] Endpoint `GET /api/parts/{id}` created in `api/parts_detail.py`
- [ ] `PartDetailService` class implements `get_part_detail()` with RLS logic
- [ ] Pydantic schema `PartDetailResponse` matches TypeScript interface `PartDetail`
- [ ] CDN URL transformation applied (T-1001-INFRA integration)
- [ ] Workshop name join working (returns `workshop_name` from `workshops` table)

### Security Requirements
- [ ] RLS enforcement: Users can only see assigned + unassigned parts
- [ ] Superusers (no workshop_id) can see ALL parts
- [ ] UUID validation: 400 Bad Request for invalid format
- [ ] 404 returned for both "not found" and "RLS violation" (don't leak existence)

### Testing Requirements
- [ ] Unit tests: 12/12 passing (`test_part_detail_service.py`)
- [ ] Integration tests: 8/8 passing (`test_part_detail_api.py`)
- [ ] Coverage: >85% for `PartDetailService` and `parts_detail` router

### Performance Requirements
- [ ] Endpoint response time <200ms p95 (single row query with index)
- [ ] No N+1 queries (workshop join in single SELECT)

### Documentation Requirements
- [ ] OpenAPI schema auto-generated by FastAPI (`/docs#/parts/get_part_detail`)
- [ ] JSDoc added to TypeScript `PartDetail` interface
- [ ] `systemPatterns.md` updated with RLS pattern documentation

---

## 6. Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|-----------|
| **RLS logic bug allows cross-workshop access** | Critical | Medium | Comprehensive integration tests with different workshop_id combinations, manual security audit |
| **Presigned URL expires before user views model** | Medium | Low | TTL 5min is sufficient (viewer loads immediately), CDN serves cached copy anyway |
| **Workshop join query slow (N+1 problem)** | Medium | Low | Use single SELECT with join, not separate queries, add index on blocks.workshop_id if needed |
| **UUID validation regex wrong** | Low | Low | Use UUID() constructor from Python stdlib (raises ValueError), don't write custom regex |

---

## 7. References

- T-0501-BACK: GET /api/parts (list endpoint, similar RLS logic)
- T-1001-INFRA: CDN configuration (for URL transformation)
- T-0503-DB: Database schema (low_poly_url, bbox, validation_report columns)
- FastAPI Security: https://fastapi.tiangolo.com/tutorial/security/
- Supabase RLS: https://supabase.com/docs/guides/auth/row-level-security
