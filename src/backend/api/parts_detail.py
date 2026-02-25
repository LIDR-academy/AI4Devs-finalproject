"""
T-1002-BACK: Part Detail API Endpoint
GET /api/parts/{id} - Fetch single part with RLS enforcement.
"""
from fastapi import APIRouter, HTTPException, Header
from uuid import UUID
from typing import Optional

from schemas import PartDetailResponse
from services.part_detail_service import PartDetailService


router = APIRouter(prefix="/api", tags=["parts"])
part_detail_service = PartDetailService()


@router.get("/parts/{part_id}", response_model=PartDetailResponse)
async def get_part_detail(
    part_id: str,
    x_workshop_id: Optional[str] = Header(None)
) -> PartDetailResponse:
    """
    Fetch a single part by ID with RLS enforcement.
    
    Args:
        part_id: UUID of the part
        x_workshop_id: User's workshop ID (from header). None for superuser.
    
    Returns:
        PartDetailResponse with part details
    
    Raises:
        HTTPException 400: Invalid UUID format
        HTTPException 403: RLS violation (access denied)
        HTTPException 404: Part not found
        HTTPException 500: Database error
    """
    # Validate UUID format
    try:
        UUID(part_id)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid UUID format"
        )
    
    # Fetch part with RLS
    success, data, error = part_detail_service.get_part_detail(
        part_id=part_id,
        workshop_id=x_workshop_id
    )
    
    if not success:
        # Determine appropriate status code
        if "Invalid UUID" in error:
            raise HTTPException(status_code=400, detail=error)
        elif "access denied" in error:
            # Return 404 for RLS violations (don't leak existence)
            raise HTTPException(status_code=404, detail="Part not found")
        elif "Database error" in error:
            raise HTTPException(status_code=500, detail=error)
        else:
            # Default to 404 for "not found"
            raise HTTPException(status_code=404, detail="Part not found")
    
    return PartDetailResponse(**data)
