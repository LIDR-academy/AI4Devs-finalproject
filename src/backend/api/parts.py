"""
FastAPI router for parts listing endpoints.

Handles HTTP layer for GET /api/parts (T-0501-BACK).
Optimized for 3D canvas rendering in Dashboard (US-005).
"""

from typing import Optional
from uuid import UUID
from fastapi import APIRouter, HTTPException, Query

from schemas import PartsListResponse, BlockStatus
from infra.supabase_client import get_supabase_client
from services.parts_service import PartsService
from constants import ERROR_MSG_INVALID_STATUS, ERROR_MSG_INVALID_UUID, ERROR_MSG_FETCH_PARTS_FAILED


def _validate_status_enum(status: Optional[str]) -> None:
    """
    Validate status parameter against BlockStatus enum values.
    
    Args:
        status: Status value to validate
    
    Raises:
        HTTPException: 400 if status is invalid
    """
    if status is not None:
        valid_statuses = [s.value for s in BlockStatus]
        if status not in valid_statuses:
            raise HTTPException(
                status_code=400,
                detail=ERROR_MSG_INVALID_STATUS.format(valid_values=', '.join(valid_statuses))
            )


def _validate_uuid_format(workshop_id: Optional[str]) -> None:
    """
    Validate workshop_id parameter as valid UUID.
    
    Args:
        workshop_id: UUID string to validate
    
    Raises:
        HTTPException: 400 if UUID format is invalid
    """
    if workshop_id is not None:
        try:
            UUID(workshop_id)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=ERROR_MSG_INVALID_UUID
            )


router = APIRouter()


@router.get("", response_model=PartsListResponse)
async def list_parts(
    status: Optional[str] = Query(None, description="Filter by lifecycle status (validated, in_fabrication, etc.)"),
    tipologia: Optional[str] = Query(None, description="Filter by part type (capitel, columna, dovela, etc.)"),
    workshop_id: Optional[str] = Query(None, description="Filter by assigned workshop UUID")
) -> PartsListResponse:
    """
    List all non-archived parts with optional filtering.
    
    Query Parameters:
        - status: Filter by lifecycle status
        - tipologia: Filter by part typology
        - workshop_id: Filter by assigned workshop UUID
    
    Returns:
        PartsListResponse with:
        - parts: Array of PartCanvasItem (id, iso_code, status, tipologia, low_poly_url, bbox, workshop_id)
        - count: Total number of parts returned
        - filters_applied: Echo of applied filters for transparency
    
    Performance:
        - Query optimized with composite index idx_blocks_canvas_query
        - Target latency: <500ms (validated at 28ms in T-0503-DB)
        - Target response size: <200KB gzipped
    
    Security:
        - RLS policies enforce workshop-level access control
        - Service role key bypasses RLS (admin context)
    
    Errors:
        - 500: Database query failure
    """
    try:
        # Validate input parameters
        _validate_status_enum(status)
        _validate_uuid_format(workshop_id)

        # Get dependencies
        supabase = get_supabase_client()
        service = PartsService(supabase)

        # Call service layer
        result = service.list_parts(
            status=status,
            tipologia=tipologia,
            workshop_id=workshop_id
        )

        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=ERROR_MSG_FETCH_PARTS_FAILED.format(error=str(e))
        )
