"""
Activity endpoints for SEPE Templates Comparator API.

This module provides HTTP endpoints for retrieving activity audit trail data.
All endpoints require authentication and follow RESTful conventions.

Endpoints:
    GET /recent - Get recent system activities (excludes LOGIN by default)

Architecture:
    - Uses ActivityService for business logic
    - Endpoints handle only HTTP concerns (validation, status codes)
    - Follows SOLID principles (Single Responsibility)
    - No direct database queries in endpoint handlers

Security:
    - JWT-based authentication required
    - All endpoints require active user
"""

import logging
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_active_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.activity import ActivityListResponse, ActivityType
from app.services.activity_service import ActivityService


router = APIRouter()
logger = logging.getLogger(__name__)


@router.get(
    "/recent",
    response_model=ActivityListResponse,
    summary="Get Recent Activities",
    description="""
Retrieve recent system activities for dashboard display.

Activities are ordered by timestamp (most recent first) and exclude
LOGIN events for cleaner UI display. Each activity includes user
attribution (email and full name) joined from the users table.

**Features:**
- Pagination support via `limit` parameter
- Automatic exclusion of LOGIN events
- User attribution with email and full name
- Ordered by most recent first

**Use Cases:**
- Homepage "Recent Activity" dashboard widget
- Audit trail for administrators
""",
    responses={
        200: {
            "description": "Recent activities retrieved successfully",
            "content": {
                "application/json": {
                    "example": {
                        "items": [
                            {
                                "id": 123,
                                "timestamp": "2025-11-02T14:30:00Z",
                                "user_id": 5,
                                "user_email": "user@example.com",
                                "user_full_name": "John Doe",
                                "activity_type": "TEMPLATE_SAVED",
                                "description": "Template ingested: SEPE Form v2.0",
                                "entity_id": 42
                            }
                        ],
                        "total": 156
                    }
                }
            }
        },
        401: {"description": "Not authenticated - JWT token missing or invalid"},
        422: {"description": "Validation error for query parameters"},
        500: {"description": "Internal server error - database query failed"},
    },
    tags=["Activity"]
)
async def get_recent_activities(
    limit: int = Query(
        10,
        ge=1,
        le=100,
        description="Number of activities to return (1-100)",
        example=10
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Get recent system activities for dashboard display.

    This endpoint retrieves the most recent activities from the system,
    excluding LOGIN events, with user attribution via JOIN query.

    Args:
        limit: Maximum number of activities to return (1-100, default: 10)
        db: Database session (injected)
        current_user: Authenticated active user (injected)

    Returns:
        ActivityListResponse with items and total count

    Raises:
        HTTPException 401: If user is not authenticated
        HTTPException 422: If query parameters are invalid
        HTTPException 500: If database query fails
    """
    try:
        # Initialize service
        activity_service = ActivityService(db)

        # Get recent activities (excluding LOGIN)
        result = activity_service.get_recent_activities(
            limit=limit,
            exclude_types=[ActivityType.LOGIN.value]
        )

        logger.info(
            f"Retrieved {len(result.items)} recent activities "
            f"(total: {result.total}) for user {current_user.email}"
        )

        return result

    except Exception as e:
        logger.error(
            f"Failed to fetch recent activities for user {current_user.email}: {str(e)}"
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch recent activities"
        )

