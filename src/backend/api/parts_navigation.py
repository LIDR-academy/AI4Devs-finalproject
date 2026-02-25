"""
Part Navigation API Router (T-1003-BACK)

Endpoint:
- GET /api/parts/{id}/adjacent - Fetch prev/next part IDs for 3D viewer modal navigation

Features:
- Optional filters: workshop_id, status, tipologia
- X-Workshop-Id header support for RLS enforcement
- Redis caching (300s TTL)
- Returns 1-based pagination index (current_index, total_count)

Status Codes:
- 200: Success with PartNavigationResponse
- 400: Invalid UUID format
- 404: Part not found in filtered set
- 500: Internal database error
"""
from typing import Optional
from fastapi import APIRouter, HTTPException, Header, Query, status
from schemas import PartNavigationResponse
from services.navigation_service import NavigationService

router = APIRouter(
    prefix="/api/parts",
    tags=["parts"]
)

@router.get(
    "/{id}/adjacent",
    response_model=PartNavigationResponse,
    status_code=status.HTTP_200_OK,
    summary="Get adjacent parts for navigation",
    description=(
        "Returns prev/next part IDs for 3D viewer modal navigation. "
        "Applies optional filters (workshop_id, status, tipologia) and orders by created_at ASC. "
        "Uses Redis caching with 300s TTL for performance."
    ),
    responses={
        200: {
            "description": "Adjacent parts found",
            "content": {
                "application/json": {
                    "example": {
                        "prev_id": "123e4567-e89b-12d3-a456-426614174000",
                        "next_id": "123e4567-e89b-12d3-a456-426614174002",
                        "current_index": 42,
                        "total_count": 250
                    }
                }
            }
        },
        400: {"description": "Invalid UUID format"},
        404: {"description": "Part not found in filtered set"},
        500: {"description": "Internal database error"}
    }
)
async def get_adjacent_parts(
    id: str,
    workshop_id: Optional[str] = Query(None, description="Filter by workshop UUID"),
    status: Optional[str] = Query(None, description="Filter by status (e.g., 'validated')"),
    tipologia: Optional[str] = Query(None, description="Filter by tipologia (e.g., 'capitel')"),
    x_workshop_id: Optional[str] = Header(None, alias="X-Workshop-Id", description="Workshop UUID from header (alternative to query param)")
):
    """
    Fetch prev/next part IDs for navigation in 3D viewer modal.
    
    Query Parameters:
    - workshop_id (optional): Filter by workshop UUID
    - status (optional): Filter by status
    - tipologia (optional): Filter by tipologia
    
    Headers:
    - X-Workshop-Id (optional): Alternative way to pass workshop_id (query param takes precedence)
    
    Returns:
    - prev_id: UUID of previous part (null if first)
    - next_id: UUID of next part (null if last)
    - current_index: 1-based position in filtered set
    - total_count: Total parts in filtered set
    """
    # Priority: query param > header
    effective_workshop_id = workshop_id or x_workshop_id
    
    # Initialize service and fetch adjacent parts
    service = NavigationService()
    success, data, error = service.get_adjacent_parts(
        part_id=id,
        workshop_id=effective_workshop_id,
        status=status,
        tipologia=tipologia
    )
    
    # Handle errors
    if not success:
        if "Invalid UUID" in error:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error
            )
        elif "not found" in error.lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=error
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=error
            )
    
    # Success
    return data
