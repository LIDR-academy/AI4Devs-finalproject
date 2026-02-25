# Technical Specification: T-1003-BACK

## 1. Ticket Summary
- **Tipo:** BACK
- **Alcance:** Part Navigation API - Endpoint para obtener IDs de piezas adyacentes (prev/next) en un conjunto ordenado, permitiendo navegación modal sin recargar interfaz
- **Dependencias:** 
  - ✅ T-1002-BACK (Get Part Detail API) - DONE
  - ✅ T-0501-BACK (List Parts API) - DONE
  - Redis (Celery stack ya desplegado en T-022-INFRA)

## 2. Data Structures & Contracts

### Backend Schema (Pydantic)

**Location:** `src/backend/schemas.py` (añadir al final de la sección T-1002-BACK)

```python
# ===== T-1003-BACK: Part Navigation API Schemas =====

class PartNavigationResponse(BaseModel):
    """
    Response for GET /api/parts/{id}/adjacent endpoint.
    
    Provides prev/next IDs for sequential navigation between parts in the 3D viewer modal.
    Order is determined by created_at ASC (oldest first), with filters applied.
    
    Contract: Must match TypeScript interface PartNavigationResponse exactly.
    Used by US-010 for Prev/Next buttons in modal footer.
    
    Attributes:
        prev_id: UUID of previous part in sequence (None if current is first)
        next_id: UUID of next part in sequence (None if current is last)
        current_index: 1-based position of current part in filtered set (e.g., 42 of 150)
        total_count: Total number of parts in filtered set
    """
    prev_id: Optional[UUID] = Field(None, description="Previous part UUID (None if first)")
    next_id: Optional[UUID] = Field(None, description="Next part UUID (None if last)")
    current_index: int = Field(..., ge=1, description="1-based index of current part")
    total_count: int = Field(..., ge=0, description="Total parts in filtered set")
    
    class Config:
        json_schema_extra = {
            "example": {
                "prev_id": "123e4567-e89b-12d3-a456-426614174000",
                "next_id": "987fcdeb-51a2-43e7-9876-543210fedcba",
                "current_index": 42,
                "total_count": 150
            }
        }
```

### Frontend Types (TypeScript)

**Location:** `src/frontend/src/types/navigation.ts` (archivo nuevo)

```typescript
/**
 * T-1003-BACK: Part Navigation API Response
 * Contract must match backend Pydantic schema PartNavigationResponse exactly
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
```

### Database Changes (SQL)
**No se requieren cambios de esquema.** La funcionalidad utiliza campos existentes:
- `blocks.id` (UUID, PK)
- `blocks.created_at` (timestamp) - usado para ordenamiento ASC
- `blocks.status`, `blocks.tipologia`, `blocks.workshop_id` - usados para filtros
- `blocks.is_archived` (boolean) - siempre filtrado a `false`

---

## 3. API Implementation

### 3.1 Service Layer

**File:** `src/backend/services/part_navigation_service.py` (new file)

```python
"""
T-1003-BACK: Part Navigation Service
Calculate adjacent part IDs respecting filters + RLS.
"""
from typing import Tuple, Optional, Dict, Any
from uuid import UUID
from supabase import Client
from src.backend.config import settings
from src.backend.infra.supabase_client import get_supabase_client
from src.backend.services.parts_service import PartsService  # Reuse filter logic from T-0501
import structlog

logger = structlog.get_logger(__name__)


class PartNavigationService:
    """Service for calculating adjacent part IDs in filtered lists."""
    
    def __init__(self, supabase_client: Optional[Client] = None):
        self.client = supabase_client or get_supabase_client()
        self.parts_service = PartsService(supabase_client=self.client)
    
    def get_adjacent_parts(
        self,
        current_part_id: str,
        user_workshop_id: Optional[str],
        filters: Optional[Dict[str, Any]] = None
    ) -> Tuple[bool, Optional[Dict[str, Any]], Optional[str]]:
        """
        Calculate prev/next part IDs respecting filters and RLS.
        
        Args:
            current_part_id: Current part UUID
            user_workshop_id: User's workshop ID for RLS (None = superuser)
            filters: Same filters from GET /api/parts (status, tipologia, workshop_id)
        
        Returns:
            Tuple of (success, adjacent_data, error_msg)
            
        Algorithm:
            1. Fetch ALL filtered part IDs (respecting RLS) ordered by created_at
            2. Find index of current_part_id in list
            3. Return prev_id = list[index-1], next_id = list[index+1]
            
        Example:
            >>> service = PartNavigationService()
            >>> filters = {"status": "validated", "tipologia": "capitel"}
            >>> success, data, _ = service.get_adjacent_parts("part-5-id", "workshop-123", filters)
            >>> print(data)  # {"current_id": "...", "prev_id": "part-4-id", "next_id": "part-6-id", ...}
        """
        try:
            # Validate UUID format
            try:
                UUID(current_part_id)
            except ValueError:
                return False, None, f"Invalid UUID format: {current_part_id}"
            
            # Fetch ALL filtered part IDs using same logic as GET /api/parts (T-0501)
            query = self.client.from_('blocks').select('id, created_at')
            
            # Apply RLS
            if user_workshop_id:
                query = query.or_(f'workshop_id.eq.{user_workshop_id},workshop_id.is.null')
            
            # Apply filters (reuse logic from T-0501)
            if filters:
                if 'status' in filters:
                    query = query.eq('status', filters['status'])
                if 'tipologia' in filters:
                    query = query.eq('tipologia', filters['tipologia'])
                if 'workshop_id' in filters:
                    query = query.eq('workshop_id', filters['workshop_id'])
            
            # Order by created_at (same as dashboard)
            query = query.order('created_at', desc=False)
            
            response = query.execute()
            
            if not response.data:
                return False, None, "No parts found with given filters"
            
            # Find current part index
            part_ids = [str(row['id']) for row in response.data]
            
            try:
                current_index = part_ids.index(current_part_id)
            except ValueError:
                return False, None, "Current part not found in filtered list (RLS violation or invalid ID)"
            
            # Calculate adjacent IDs
            prev_id = part_ids[current_index - 1] if current_index > 0 else None
            next_id = part_ids[current_index + 1] if current_index < len(part_ids) - 1 else None
            
            adjacent_data = {
                'current_id': current_part_id,
                'prev_id': prev_id,
                'next_id': next_id,
                'current_index': current_index + 1,  # 1-based for UI
                'total_count': len(part_ids)
            }
            
            logger.info(
                "adjacent_parts_calculated",
                current_id=current_part_id,
                current_index=adjacent_data['current_index'],
                total_count=adjacent_data['total_count']
            )
            
            return True, adjacent_data, None
            
        except Exception as e:
            logger.error("adjacent_parts_calculation_failed", error=str(e), exc_info=True)
            return False, None, f"Database error: {str(e)}"
```

---

### 3.2 API Router

**File:** `src/backend/api/parts_detail.py` (add to existing file)

```python
# T-1003-BACK: Add to existing parts_detail.py router

from src.backend.services.part_navigation_service import PartNavigationService
from src.backend.schemas import AdjacentPartsResponse
from fastapi import Query


@router.get("/{part_id}/adjacent", response_model=AdjacentPartsResponse, status_code=200)
async def get_adjacent_parts(
    part_id: str,
    x_workshop_id: Optional[str] = Header(None),
    status: Optional[str] = Query(None, description="Filter by status (validated, uploaded, etc.)"),
    tipologia: Optional[str] = Query(None, description="Filter by tipologia (capitel, columna, etc.)"),
    workshop_id: Optional[str] = Query(None, description="Filter by workshop ID")
) -> AdjacentPartsResponse:
    """
    Get previous and next part IDs for modal navigation (US-010 T-1007).
    
    Args:
        part_id: Current part UUID
        x_workshop_id: User's workshop ID for RLS (from JWT)
        status: Filter by status (same as GET /api/parts)
        tipologia: Filter by tipologia
        workshop_id: Filter by workshop ID
    
    Returns:
        AdjacentPartsResponse with prev_id, next_id, current_index, total_count
    
    Raises:
        400 Bad Request: Invalid UUID format
        404 Not Found: Part not found in filtered list (or RLS violation)
        500 Internal Server Error: Database error
    
    Example:
        >>> GET /api/parts/550e8400-e29b-41d4-a716-446655440000/adjacent?status=validated&tipologia=capitel
        >>> Response: {"prev_id": "...", "next_id": "...", "current_index": 5, "total_count": 20}
    """
    service = PartNavigationService()
    
    # Build filters dict
    filters = {}
    if status:
        filters['status'] = status
    if tipologia:
        filters['tipologia'] = tipologia
    if workshop_id:
        filters['workshop_id'] = workshop_id
    
    success, adjacent_data, error_msg = service.get_adjacent_parts(
        current_part_id=part_id,
        user_workshop_id=x_workshop_id,
        filters=filters if filters else None
    )
    
    if not success:
        if "Invalid UUID format" in error_msg:
            raise HTTPException(status_code=400, detail=error_msg)
        elif "not found" in error_msg:
            raise HTTPException(status_code=404, detail="Part not found in filtered list")
        else:
            logger.error("get_adjacent_parts_error", part_id=part_id, error=error_msg)
            raise HTTPException(status_code=500, detail="Internal server error")
    
    return AdjacentPartsResponse(**adjacent_data)
```

---

## 4. Testing Strategy

### 4.1 Unit Tests

**File:** `tests/unit/test_part_navigation_service.py`

```python
"""T-1003-BACK: Part Navigation Service Unit Tests"""
import pytest
from unittest.mock import Mock
from src.backend.services.part_navigation_service import PartNavigationService


class TestPartNavigationService:
    def test_get_adjacent_parts_middle_of_list(self):
        """UNIT-01: Part in middle has both prev and next."""
        mock_client = Mock()
        mock_client.from_().select().or_().order().execute.return_value = Mock(
            data=[
                {'id': 'part-1-id'},
                {'id': 'part-2-id'},
                {'id': 'part-3-id'},
                {'id': 'part-4-id'},
                {'id': 'part-5-id'},
            ]
        )
        
        service = PartNavigationService(supabase_client=mock_client)
        success, data, error = service.get_adjacent_parts('part-3-id', 'workshop-123')
        
        assert success is True
        assert data['prev_id'] == 'part-2-id'
        assert data['next_id'] == 'part-4-id'
        assert data['current_index'] == 3
        assert data['total_count'] == 5
    
    def test_get_adjacent_parts_first_in_list(self):
        """UNIT-02: First part has no prev_id."""
        mock_client = Mock()
        mock_client.from_().select().or_().order().execute.return_value = Mock(
            data=[{'id': 'part-1-id'}, {'id': 'part-2-id'}]
        )
        
        service = PartNavigationService(supabase_client=mock_client)
        success, data, error = service.get_adjacent_parts('part-1-id', 'workshop-123')
        
        assert success is True
        assert data['prev_id'] is None
        assert data['next_id'] == 'part-2-id'
    
    def test_get_adjacent_parts_last_in_list(self):
        """UNIT-03: Last part has no next_id."""
        mock_client = Mock()
        mock_client.from_().select().or_().order().execute.return_value = Mock(
            data=[{'id': 'part-1-id'}, {'id': 'part-2-id'}]
        )
        
        service = PartNavigationService(supabase_client=mock_client)
        success, data, error = service.get_adjacent_parts('part-2-id', 'workshop-123')
        
        assert success is True
        assert data['prev_id'] == 'part-1-id'
        assert data['next_id'] is None
    
    def test_get_adjacent_parts_not_in_filtered_list(self):
        """UNIT-04: Part not in filtered list returns error."""
        mock_client = Mock()
        mock_client.from_().select().or_().order().execute.return_value = Mock(
            data=[{'id': 'part-1-id'}, {'id': 'part-2-id'}]
        )
        
        service = PartNavigationService(supabase_client=mock_client)
        success, data, error = service.get_adjacent_parts('part-999-id', 'workshop-123')
        
        assert success is False
        assert "not found in filtered list" in error
```

---

### 4.2 Integration Tests

**File:** `tests/integration/test_part_navigation_api.py`

```python
"""T-1003-BACK: Part Navigation API Integration Tests"""
import pytest
from fastapi.testclient import TestClient
from src.backend.main import app

client = TestClient(app)


class TestPartNavigationAPI:
    @pytest.fixture(autouse=True)
    def setup_test_data(self, supabase_client):
        """Create 5 test parts."""
        self.parts = []
        for i in range(1, 6):
            part = supabase_client.from_('blocks').insert({
                'iso_code': f'TEST-PART-{i:03d}',
                'status': 'validated',
                'tipologia': 'capitel',
                'workshop_id': 'test-workshop-123'
            }).execute()
            self.parts.append(part.data[0])
        
        yield
        
        # Cleanup
        for part in self.parts:
            supabase_client.from_('blocks').delete().eq('id', part['id']).execute()
    
    def test_get_adjacent_parts_success_200(self):
        """INT-01: Middle part returns prev and next IDs."""
        part_id = self.parts[2]['id']  # 3rd part
        
        response = client.get(
            f"/api/parts/{part_id}/adjacent",
            headers={"X-Workshop-Id": "test-workshop-123"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data['prev_id'] == str(self.parts[1]['id'])
        assert data['next_id'] == str(self.parts[3]['id'])
        assert data['current_index'] == 3
        assert data['total_count'] == 5
    
    def test_get_adjacent_parts_with_filters(self):
        """INT-02: Filters applied correctly (status filter)."""
        # Update first 2 parts to 'uploaded' status
        for part in self.parts[:2]:
            supabase_client.from_('blocks').update({'status': 'uploaded'}).eq('id', part['id']).execute()
        
        part_id = self.parts[2]['id']  # 3rd part (status='validated')
        
        response = client.get(
            f"/api/parts/{part_id}/adjacent?status=validated",
            headers={"X-Workshop-Id": "test-workshop-123"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data['total_count'] == 3  # Only 3 'validated' parts
        assert data['current_index'] == 1  # First in filtered list
```

---

## 5. Definition of Done

### Functional Requirements
- [ ] Endpoint `GET /api/parts/{id}/adjacent` created
- [ ] `PartNavigationService` calculates prev/next IDs respecting filters + RLS
- [ ] Pydantic schema `AdjacentPartsResponse` matches TypeScript interface
- [ ] Filter parameters (status, tipologia, workshop_id) applied correctly

### Testing Requirements
- [ ] Unit tests: 6/6 passing (`test_part_navigation_service.py`)
- [ ] Integration tests: 8/8 passing (`test_part_navigation_api.py`)
- [ ] Coverage: >85%

### Performance Requirements
- [ ] Endpoint response time <300ms p95 (fetches IDs only, not full part data)
- [ ] Consider Redis caching for frequently accessed filtered lists (optional optimization)

### Documentation Requirements
- [ ] OpenAPI schema auto-generated (`/docs#/parts/get_adjacent_parts`)
- [ ] JSDoc added to TypeScript `AdjacentParts` interface

---

## 6. Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|-----------|
| **Performance: Fetching ALL IDs slow for 10k+ parts** | Medium | Low | Add pagination limit (max 1000 parts), use Redis cache, optimize with indexes |
| **Race condition: Filters change while navigating** | Low | Medium | Frontend passes same filter params with each request, backend recalculates |
| **User navigates faster than API responds** | Low | Medium | Frontend debounces navigation (300ms), shows loading state |

---

## 7. References

- T-0501-BACK: GET /api/parts (filter logic reused)
- T-1002-BACK: GET /api/parts/{id} (detail endpoint)
- T-1007-FRONT: PartDetailModal with prev/next navigation (consumer of this endpoint)
