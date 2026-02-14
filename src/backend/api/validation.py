"""
Validation API endpoints - Routes for validation status queries.

This module contains FastAPI routes for querying block validation status.
"""
from uuid import UUID
from fastapi import APIRouter, HTTPException, status
from schemas import ValidationStatusResponse, ValidationReport, BlockStatus
from infra.supabase_client import get_supabase_client
from services.validation_service import ValidationService
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/parts", tags=["validation"])


@router.get("/{id}/validation", response_model=ValidationStatusResponse, status_code=status.HTTP_200_OK)
async def get_validation_status(id: UUID) -> ValidationStatusResponse:
    """
    Retrieve validation status for a specific block (part).
    
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
    
    # Get service instance
    supabase = get_supabase_client()
    service = ValidationService(supabase)
    
    # Query validation status
    success, block_data, error_msg, extra = service.get_validation_status(id)
    
    # Handle errors
    if not success:
        if error_msg and "not found" in error_msg.lower():
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
