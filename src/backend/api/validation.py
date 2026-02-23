"""
Validation API endpoints - Routes for block validation status queries.

This module provides FastAPI endpoints for retrieving validation status and reports
for uploaded .3dm blocks. Follows Clean Architecture pattern with thin controller layer.
"""
from uuid import UUID
from fastapi import APIRouter, HTTPException, status
from schemas import ValidationStatusResponse, ValidationReport, BlockStatus
from infra.supabase_client import get_supabase_client
from services.validation_service import ValidationService

router = APIRouter(prefix="/api/parts", tags=["validation"])


@router.get("/{id}/validation", response_model=ValidationStatusResponse, status_code=status.HTTP_200_OK)
async def get_validation_status(id: UUID) -> ValidationStatusResponse:
    """
    Retrieve validation status and report for a specific block.

    This endpoint queries the validation status of a block (piece) identified by its UUID.
    Returns the current status, ISO code, and validation report if available. Used by
    frontend to display validation results after async processing by The Librarian agent.

    Path Parameters:
        id (UUID): Block identifier (auto-validated by FastAPI)

    Response Model:
        ValidationStatusResponse:
            - block_id: UUID of the queried block
            - iso_code: ISO-19650 identifier (e.g., "PENDING-a1b2c3d4" or "SF-C12-M-001")
            - status: Current lifecycle stage (uploaded/processing/validated/rejected/error_processing)
            - validation_report: Detailed validation results (null if not yet validated)
            - job_id: Async task identifier (null - not implemented, see schema limitations)

    Status Codes:
        200: Block found, status retrieved successfully
        404: Block with given UUID not found in database
        422: Invalid UUID format (auto-handled by FastAPI validation)
        500: Database connection error or internal server error

    Error Responses:
        404 Not Found:
            {"detail": "Block with ID {uuid} not found"}

        500 Internal Server Error:
            {"detail": "Database connection failed. Please try again later."}

    Example Requests:
        GET /api/parts/550e8400-e29b-41d4-a716-446655440000/validation

        Response 200 (validated block):
        {
          "block_id": "550e8400-e29b-41d4-a716-446655440000",
          "iso_code": "SF-C12-M-001",
          "status": "validated",
          "validation_report": {
            "is_valid": true,
            "errors": [],
            "metadata": {
              "total_objects": 42,
              "valid_objects": 42
            },
            "validated_at": "2026-02-15T10:30:00Z",
            "validated_by": "librarian-v1.0.0"
          },
          "job_id": null
        }

        Response 200 (unvalidated block):
        {
          "block_id": "660f9510-f30c-52e5-b827-557766551111",
          "iso_code": "PENDING-a1b2c3d4",
          "status": "uploaded",
          "validation_report": null,
          "job_id": null
        }

    Integration:
        - Frontend: Real-time status updates via Supabase realtime (T-031-FRONT)
        - Agent: Validation orchestrated by The Librarian (T-024-AGENT)
        - Database: Validation reports stored as JSONB in blocks.validation_report (T-020-DB)

    See Also:
        - Validation schemas: src/backend/schemas.py (ValidationStatusResponse)
        - Validation service: src/backend/services/validation_service.py
        - US-002: The Librarian validation workflow
    """
    # Service layer handles business logic and logging
    supabase = get_supabase_client()
    service = ValidationService(supabase)
    success, block_data, error_msg, extra = service.get_validation_status(id)

    # Map service errors to HTTP responses
    if not success:
        if error_msg and "not found" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Block with ID {id} not found"
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database connection failed. Please try again later."
            )

    # Build Pydantic response model
    return ValidationStatusResponse(
        block_id=block_data["id"],
        iso_code=block_data["iso_code"],
        status=BlockStatus(block_data["status"]),
        validation_report=ValidationReport(**block_data["validation_report"]) if block_data.get("validation_report") else None,
        job_id=extra.get("job_id") if extra else None
    )
