"""
Comparison endpoints for SEPE Templates Comparator API.
"""

import logging
from typing import Any, Optional
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
    Query,
    BackgroundTasks
)
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc

from app.core.auth import (
    get_current_active_user,
    get_optional_current_user
)
from app.core.database import get_db
from app.models.user import User
from app.models.template import PDFTemplate, TemplateVersion
from app.models.comparison import Comparison, ComparisonField
from app.schemas.comparison import (
    ComparisonRequest,
    ComparisonResult,
    ComparisonIngestRequest,
    ComparisonIngestResponse,
    ComparisonSummary,
    ComparisonListResponse,
    ComparisonCheckResponse,
)
from app.services.comparison_service import ComparisonService
from app.services.activity_service import ActivityService
from app.schemas.activity import ActivityType

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post(
    "/analyze",
    response_model=ComparisonResult,
    status_code=status.HTTP_200_OK,
    summary="Analyze Template Version Differences",
    description="""
    Compare two template versions field-by-field.

    This endpoint performs an in-memory comparison using data from the
    database without re-processing PDF files. It identifies added,
    removed, and modified fields, and calculates global metrics.

    **Use Case:**
    When SEPE publishes a new version of a form, administrators need to
    understand what has changed to update documentation, training
    materials, and integration code.

    **Features:**
    - In-memory comparison (fast, no PDF processing)
    - Field-by-field analysis
    - Global metrics (page count, field count, % changed)
    - Position comparison with tolerance (5px)
    - Value options comparison (for select/radio fields)

    **Authentication Required:** Valid JWT token must be provided.

    **Validation:**
    - Both version IDs must exist in the database
    - Version IDs must be different (cannot compare a version with itself)
    - User must be authenticated

    **Response Includes:**
    - Global metrics (page counts, field counts, modification percentage)
    - Detailed field changes with status (ADDED/REMOVED/MODIFIED/UNCHANGED)
    - Field attribute comparisons (position, label text, value options)
    """,
    responses={
        200: {
            "description": "Comparison completed successfully",
            "content": {
                "application/json": {
                    "example": {
                        "source_version_id": 1,
                        "target_version_id": 2,
                        "global_metrics": {
                            "source_version_number": "2024-Q1",
                            "target_version_number": "2024-Q2",
                            "source_page_count": 5,
                            "target_page_count": 6,
                            "page_count_changed": True,
                            "source_field_count": 48,
                            "target_field_count": 52,
                            "field_count_changed": True,
                            "fields_added": 4,
                            "fields_removed": 0,
                            "fields_modified": 3,
                            "fields_unchanged": 45,
                            "modification_percentage": 14.58,
                            "source_created_at": "2024-01-15T10:30:00Z",
                            "target_created_at": "2024-04-20T14:25:00Z"
                        },
                        "field_changes": [
                            {
                                "field_id": "NEW_FIELD_01",
                                "status": "ADDED",
                                "field_type": "text",
                                "target_page_number": 6,
                                "near_text_diff": "NOT_APPLICABLE",
                                "target_near_text": "New field label"
                            }
                        ],
                        "analyzed_at": "2025-10-26T15:45:30Z"
                    }
                }
            }
        },
        400: {
            "description": "Validation error (same version IDs)",
            "content": {
                "application/json": {
                    "example": {
                        "detail": "Source and target versions must be different"
                    }
                }
            }
        },
        401: {
            "description": "Not authenticated",
            "content": {
                "application/json": {
                    "example": {
                        "detail": "Not authenticated"
                    }
                }
            }
        },
        404: {
            "description": "One or both versions not found",
            "content": {
                "application/json": {
                    "example": {
                        "detail": "Version with ID 999 not found"
                    }
                }
            }
        },
        422: {
            "description": "Invalid request parameters",
            "content": {
                "application/json": {
                    "example": {
                        "detail": [
                            {
                                "loc": ["body", "source_version_id"],
                                "msg": "ensure this value is greater than 0",
                                "type": "value_error.number.not_gt"
                            }
                        ]
                    }
                }
            }
        },
        500: {
            "description": "Internal server error",
            "content": {
                "application/json": {
                    "example": {
                        "detail": "Failed to analyze comparison"
                    }
                }
            }
        }
    },
    tags=["comparisons"]
)
async def analyze_comparison(
    request: ComparisonRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> ComparisonResult:
    """
    Analyze differences between two template versions.

    Args:
        request: Comparison request with source and target version IDs
        current_user: Current authenticated user
        db: Database session

    Returns:
        ComparisonResult: Complete comparison data with metrics and field
            changes

    Raises:
        HTTPException: For various error conditions (404, 400, 500)
    """
    logger.info(
        f"Comparison requested by user {current_user.id}: "
        f"source_version={request.source_version_id}, "
        f"target_version={request.target_version_id}"
    )

    try:
        # Create comparison service
        comparison_service = ComparisonService(db)

        # Perform comparison
        result = comparison_service.compare_versions(
            source_version_id=request.source_version_id,
            target_version_id=request.target_version_id
        )

        logger.info(
            f"Comparison completed: {result.global_metrics.fields_added} "
            f"added, {result.global_metrics.fields_removed} removed, "
            f"{result.global_metrics.fields_modified} modified"
        )

        # Get template and version info for readable activity description
        source_version = db.query(TemplateVersion).filter(
            TemplateVersion.id == request.source_version_id
        ).first()
        target_version = db.query(TemplateVersion).filter(
            TemplateVersion.id == request.target_version_id
        ).first()
        
        template_name = source_version.template.name if source_version else "Unknown"
        source_version_name = source_version.version_number if source_version else str(request.source_version_id)
        target_version_name = target_version.version_number if target_version else str(request.target_version_id)

        # Log COMPARISON_ANALYSIS activity
        activity_service = ActivityService(db)
        activity_service.log_activity(
            user_id=current_user.id,
            activity_type=ActivityType.COMPARISON_ANALYSIS.value,
            description=f"Comparison analyzed: {template_name} {source_version_name} vs {target_version_name} by {current_user.email}",
            entity_id=None
        )

        return result

    except ValueError as e:
        # Handle "not found" or validation errors
        error_msg = str(e)
        if "not found" in error_msg.lower():
            logger.warning(f"Version not found: {error_msg}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=error_msg
            )
        logger.warning(f"Validation error: {error_msg}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg
        )

    except Exception as e:
        logger.error(
            f"Comparison analysis error: {str(e)}",
            exc_info=True
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to analyze comparison"
        )



# ============================================================================
# Persistence Endpoints
# ============================================================================


@router.post(
    "/ingest",
    response_model=ComparisonIngestResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Save Comparison Result",
    description="""
    Persist a comparison result to the database for future reference.

    This endpoint accepts the same payload structure returned by the `/analyze`
    endpoint, ensuring seamless integration between analysis and persistence.

    **Use Case:**
    After analyzing differences between template versions, users can save
    the comparison results for:
    - Historical tracking
    - Audit trails
    - Sharing with team members
    - Avoiding duplicate analysis

    **Authentication Required:** Valid JWT token must be provided.

    **Validation:**
    - Source and target version IDs must exist
    - Source and target must be different versions
    - Global metrics and field changes must be provided

    **Note:** The endpoint automatically checks for duplicate comparisons
    before saving. If the same comparison already exists, it will succeed
    without creating a duplicate (idempotent operation).
    """,
    responses={
        201: {
            "description": "Comparison saved successfully",
            "content": {
                "application/json": {
                    "example": {
                        "comparison_id": 42,
                        "message": "Comparison saved successfully",
                        "created_at": "2025-10-27T10:30:00Z"
                    }
                }
            }
        },
        400: {"description": "Validation error (same versions)"},
        401: {"description": "Not authenticated"},
        404: {"description": "Version not found"},
        422: {"description": "Invalid request body"},
        500: {"description": "Internal server error"}
    },
    tags=["comparisons"]
)
async def ingest_comparison(
    request: ComparisonIngestRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> ComparisonIngestResponse:
    """
    Save a comparison result to the database.

    Args:
        request: Complete comparison data from analyze endpoint
        current_user: Current authenticated user
        db: Database session

    Returns:
        ComparisonIngestResponse: ID and metadata of saved comparison

    Raises:
        HTTPException: For various error conditions
    """
    logger.info(
        f"Ingesting comparison by user {current_user.id}: "
        f"source={request.source_version_id}, target={request.target_version_id}"
    )

    try:
        # Create comparison service
        comparison_service = ComparisonService(db)

        # Convert schema to ComparisonResult
        comparison_result = ComparisonResult(
            source_version_id=request.source_version_id,
            target_version_id=request.target_version_id,
            global_metrics=request.global_metrics,
            field_changes=request.field_changes,
        )

        # Save comparison
        comparison_id = comparison_service.save_comparison(
            user_id=current_user.id,
            comparison_result=comparison_result
        )

        # Get saved comparison to get created_at
        saved_comparison = db.query(Comparison).filter(
            Comparison.id == comparison_id
        ).first()

        logger.info(
            f"Comparison ingested successfully: id={comparison_id}"
        )

        # Get template and version info for readable activity description
        source_version = db.query(TemplateVersion).filter(
            TemplateVersion.id == request.source_version_id
        ).first()
        target_version = db.query(TemplateVersion).filter(
            TemplateVersion.id == request.target_version_id
        ).first()
        
        template_name = source_version.template.name if source_version else "Unknown"
        source_version_name = source_version.version_number if source_version else str(request.source_version_id)
        target_version_name = target_version.version_number if target_version else str(request.target_version_id)

        # Log COMPARISON_SAVED activity
        activity_service = ActivityService(db)
        activity_service.log_activity(
            user_id=current_user.id,
            activity_type=ActivityType.COMPARISON_SAVED.value,
            description=f"Comparison saved: {template_name} {source_version_name} vs {target_version_name} by {current_user.email}",
            entity_id=comparison_id
        )

        return ComparisonIngestResponse(
            comparison_id=comparison_id,
            message="Comparison saved successfully",
            created_at=saved_comparison.created_at
        )

    except ValueError as e:
        error_msg = str(e)
        if "not found" in error_msg.lower():
            logger.warning(f"Version not found: {error_msg}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=error_msg
            )
        logger.warning(f"Validation error: {error_msg}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg
        )

    except Exception as e:
        logger.error(
            f"Comparison ingest error: {str(e)}",
            exc_info=True
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save comparison"
        )


@router.get(
    "/check",
    response_model=ComparisonCheckResponse,
    status_code=status.HTTP_200_OK,
    summary="Check if Comparison Exists",
    description="""
    Check if a comparison already exists between two template versions.

    This endpoint is useful before calling `/ingest` to avoid saving
    duplicate comparisons. It performs a bidirectional check (finds
    comparisons regardless of source/target order).

    **Use Case:**
    - Show "Already compared" message in UI
    - Link to existing comparison instead of creating duplicate
    - Conditional save logic

    **Authentication Required:** Valid JWT token must be provided.
    """,
    responses={
        200: {
            "description": "Check completed successfully",
            "content": {
                "application/json": {
                    "examples": {
                        "exists": {
                            "value": {
                                "exists": True,
                                "comparison_id": 42,
                                "created_at": "2025-10-27T10:00:00Z"
                            }
                        },
                        "not_exists": {
                            "value": {
                                "exists": False,
                                "comparison_id": None,
                                "created_at": None
                            }
                        }
                    }
                }
            }
        },
        401: {"description": "Not authenticated"},
        422: {"description": "Invalid query parameters"},
        500: {"description": "Internal server error"}
    },
    tags=["comparisons"]
)
async def check_comparison_exists(
    source_version_id: int = Query(..., gt=0, description="Source version ID"),
    target_version_id: int = Query(..., gt=0, description="Target version ID"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> ComparisonCheckResponse:
    """
    Check if a comparison exists between two versions.

    Args:
        source_version_id: Source version ID
        target_version_id: Target version ID
        current_user: Current authenticated user
        db: Database session

    Returns:
        ComparisonCheckResponse: Existence status and comparison ID if found

    Raises:
        HTTPException: For various error conditions
    """
    logger.info(
        f"Checking comparison existence by user {current_user.id}: "
        f"source={source_version_id}, target={target_version_id}"
    )

    try:
        # Create comparison service
        comparison_service = ComparisonService(db)

        # Check if comparison exists
        existing_id = comparison_service.comparison_exists(
            source_version_id=source_version_id,
            target_version_id=target_version_id
        )

        if existing_id:
            # Get created_at
            comparison = db.query(Comparison).filter(
                Comparison.id == existing_id
            ).first()

            logger.info(f"Comparison exists: id={existing_id}")

            return ComparisonCheckResponse(
                exists=True,
                comparison_id=existing_id,
                created_at=comparison.created_at
            )
        else:
            logger.info("Comparison does not exist")

            return ComparisonCheckResponse(
                exists=False,
                comparison_id=None,
                created_at=None
            )

    except Exception as e:
        logger.error(
            f"Error checking comparison: {str(e)}",
            exc_info=True
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to check comparison"
        )


@router.get(
    "/{comparison_id}",
    response_model=ComparisonResult,
    status_code=status.HTTP_200_OK,
    summary="Get Saved Comparison",
    description="""
    Retrieve a saved comparison by its ID.

    Returns the complete comparison data including global metrics and all
    field-by-field changes, in the same format as the `/analyze` endpoint.

    **Use Case:**
    - View historical comparison results
    - Share comparison links with team members
    - Reuse comparison data without re-analyzing

    **Authentication Required:** Valid JWT token must be provided.
    """,
    responses={
        200: {
            "description": "Comparison retrieved successfully",
        },
        401: {"description": "Not authenticated"},
        404: {"description": "Comparison not found"},
        500: {"description": "Internal server error"}
    },
    tags=["comparisons"]
)
async def get_comparison(
    comparison_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> ComparisonResult:
    """
    Retrieve a saved comparison by ID.

    Args:
        comparison_id: ID of the comparison to retrieve
        current_user: Current authenticated user
        db: Database session

    Returns:
        ComparisonResult: Complete comparison data

    Raises:
        HTTPException: If comparison not found or other errors
    """
    logger.info(
        f"Retrieving comparison {comparison_id} by user {current_user.id}"
    )

    try:
        # Create comparison service
        comparison_service = ComparisonService(db)

        # Get comparison
        result = comparison_service.get_comparison(comparison_id)

        logger.info(f"Comparison {comparison_id} retrieved successfully")

        return result

    except ValueError as e:
        logger.warning(f"Comparison not found: {e}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )

    except Exception as e:
        logger.error(
            f"Error retrieving comparison {comparison_id}: {str(e)}",
            exc_info=True
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve comparison"
        )


@router.get(
    "/",
    response_model=ComparisonListResponse,
    status_code=status.HTTP_200_OK,
    summary="List Saved Comparisons",
    description="""
    List all saved comparisons with pagination, sorting, and optional search.

    Returns a lightweight summary of each comparison (without field details)
    to enable efficient browsing of comparison history.

    **Features:**
    - Pagination (page and page_size)
    - Sorting by any field (created_at, modification_percentage, etc.)
    - Search by template name
    - Total count for pagination UI

    **Authentication Required:** Valid JWT token must be provided.
    """,
    responses={
        200: {
            "description": "List retrieved successfully",
            "content": {
                "application/json": {
                    "example": {
                        "items": [
                            {
                                "id": 1,
                                "source_version_id": 10,
                                "target_version_id": 11,
                                "source_version_number": "1.0",
                                "target_version_number": "2.0",
                                "source_template_name": "Template A",
                                "target_template_name": "Template A",
                                "modification_percentage": 15.5,
                                "fields_added": 3,
                                "fields_removed": 1,
                                "fields_modified": 2,
                                "fields_unchanged": 44,
                                "created_at": "2025-10-27T10:00:00Z",
                                "created_by": 5
                            }
                        ],
                        "total": 25,
                        "page": 1,
                        "page_size": 20,
                        "total_pages": 2
                    }
                }
            }
        },
        401: {"description": "Not authenticated"},
        422: {"description": "Invalid query parameters"},
        500: {"description": "Internal server error"}
    },
    tags=["comparisons"]
)
async def list_comparisons(
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    sort_by: str = Query("created_at", description="Field to sort by"),
    sort_order: str = Query(
        "desc",
        regex="^(asc|desc)$",
        description="Sort order (asc or desc)"
    ),
    search: Optional[str] = Query(
        None,
        description="Search term for template names"
    ),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> ComparisonListResponse:
    """
    List saved comparisons with pagination and filtering.

    Args:
        page: Page number (1-indexed)
        page_size: Number of items per page
        sort_by: Field name to sort by
        sort_order: Sort direction (asc or desc)
        search: Optional search term
        current_user: Current authenticated user
        db: Database session

    Returns:
        ComparisonListResponse: Paginated list with metadata

    Raises:
        HTTPException: For various error conditions
    """
    logger.info(
        f"Listing comparisons by user {current_user.id}: "
        f"page={page}, page_size={page_size}"
    )

    try:
        # Create comparison service
        comparison_service = ComparisonService(db)

        # Get comparisons
        summaries, total = comparison_service.list_comparisons(
            page=page,
            page_size=page_size,
            sort_by=sort_by,
            sort_order=sort_order,
            search=search
        )

        # Calculate total pages
        from math import ceil
        total_pages = ceil(total / page_size) if total > 0 else 0

        logger.info(
            f"Found {total} comparisons, returning page {page}"
        )

        return ComparisonListResponse(
            items=summaries,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages
        )

    except Exception as e:
        logger.error(
            f"Error listing comparisons: {str(e)}",
            exc_info=True
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list comparisons"
        )


@router.delete(
    "/{comparison_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete Comparison",
    description="""
    Delete a comparison and all its associated field-level differences.
    
    **Authorization:** User must be the creator of the comparison.
    
    **Side Effects:**
    - Comparison record is deleted from database
    - All comparison_fields records are automatically deleted (CASCADE)
    - Activity log entry is created with type COMPARISON_DELETED
    
    **Returns:**
    - HTTP 204 No Content on success
    - HTTP 401 Unauthorized if not authenticated
    - HTTP 403 Forbidden if user is not the creator
    - HTTP 404 Not Found if comparison doesn't exist
    - HTTP 500 Internal Server Error on failure
    """,
    responses={
        204: {"description": "Comparison successfully deleted"},
        401: {"description": "Not authenticated"},
        403: {"description": "Not authorized to delete this comparison"},
        404: {"description": "Comparison not found"},
        500: {"description": "Failed to delete comparison"}
    },
    tags=["Comparisons"]
)
async def delete_comparison(
    comparison_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> None:
    """
    Delete a comparison by ID.
    
    Args:
        comparison_id: ID of the comparison to delete
        current_user: Authenticated user from JWT token
        db: Database session
        
    Raises:
        HTTPException: 404 if comparison not found
        HTTPException: 403 if user is not the creator
        HTTPException: 500 if deletion fails
    """
    try:
        # Fetch comparison with related data for logging
        comparison = db.query(Comparison).filter(
            Comparison.id == comparison_id
        ).first()
        
        if not comparison:
            logger.warning(f"Comparison {comparison_id} not found for deletion")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Comparison not found"
            )
        
        # Authorization check: user must be the creator
        if comparison.created_by != current_user.id:
            logger.warning(
                f"User {current_user.id} attempted to delete comparison "
                f"{comparison_id} owned by user {comparison.created_by}"
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to delete this comparison"
            )
        
        # Get template names and versions for activity log
        source_template_name = comparison.source_version.template.name
        source_version = comparison.source_version.version_number
        target_template_name = comparison.target_version.template.name
        target_version = comparison.target_version.version_number
        
        # Delete comparison (CASCADE will handle comparison_fields)
        db.delete(comparison)
        db.commit()
        
        logger.info(
            f"Comparison {comparison_id} deleted successfully by user {current_user.id}"
        )
        
        # Log activity
        activity_service = ActivityService(db)
        description = (
            f"Comparison deleted: {source_template_name} {source_version} "
            f"vs {target_template_name} {target_version} by {current_user.email}"
        )
        activity_service.log_activity(
            user_id=current_user.id,
            activity_type=ActivityType.COMPARISON_DELETED.value,
            description=description,
            entity_id=comparison_id
        )
        
        return None  # 204 No Content
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Rollback on any error
        db.rollback()
        logger.error(
            f"Error deleting comparison {comparison_id}: {str(e)}",
            exc_info=True
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete comparison"
        )
