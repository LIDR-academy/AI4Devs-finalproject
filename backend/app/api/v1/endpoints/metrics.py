"""
Metrics endpoints for dashboard statistics.

This module provides read-only endpoints for retrieving system metrics
including templates summary, comparisons count, and monthly activity.
"""

from datetime import datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import extract
from sqlalchemy.orm import Session

from app.core.auth import get_current_active_user
from app.core.database import get_db
from app.models.activity import Activity
from app.models.comparison import Comparison
from app.models.template import PDFTemplate, TemplateVersion
from app.models.user import User
from app.schemas.metrics import (
    ComparisonsCountResponse,
    MonthlyActivityResponse,
    TemplatesSummaryResponse,
)

router = APIRouter()


@router.get(
    "/templates/summary",
    response_model=TemplatesSummaryResponse,
    summary="Get templates summary",
    description="""
    Get summary of templates and versions in the system.

    Returns the count of unique templates and total versions across
    all templates for dashboard display.

    **Authentication:** Required (JWT Bearer token)

    **Response:**
    - total_templates: Number of unique templates
    - total_versions: Total number of versions across all templates
    """,
    responses={
        200: {
            "description": "Templates summary retrieved successfully",
            "content": {
                "application/json": {
                    "example": {
                        "total_templates": 15,
                        "total_versions": 45
                    }
                }
            }
        },
        401: {"description": "Not authenticated"},
        403: {"description": "Inactive user"},
        500: {"description": "Internal server error"}
    }
)
async def get_templates_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Get summary of templates and versions.

    Args:
        db: Database session
        current_user: Authenticated active user

    Returns:
        TemplatesSummaryResponse with total_templates and total_versions

    Raises:
        HTTPException: 500 if database query fails
    """
    try:
        # Count unique templates
        total_templates = db.query(PDFTemplate).count()

        # Count total versions
        total_versions = db.query(TemplateVersion).count()

        return {
            "total_templates": total_templates,
            "total_versions": total_versions
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch templates summary"
        )


@router.get(
    "/comparisons/count",
    response_model=ComparisonsCountResponse,
    summary="Get comparisons count",
    description="""
    Get total count of saved comparisons.

    Returns the number of comparisons stored in the database for
    dashboard display.

    **Authentication:** Required (JWT Bearer token)

    **Response:**
    - total_comparisons: Total number of saved comparisons
    """,
    responses={
        200: {
            "description": "Comparisons count retrieved successfully",
            "content": {
                "application/json": {
                    "example": {
                        "total_comparisons": 50
                    }
                }
            }
        },
        401: {"description": "Not authenticated"},
        403: {"description": "Inactive user"},
        500: {"description": "Internal server error"}
    }
)
async def get_comparisons_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Get total count of saved comparisons.

    Args:
        db: Database session
        current_user: Authenticated active user

    Returns:
        ComparisonsCountResponse with total_comparisons

    Raises:
        HTTPException: 500 if database query fails
    """
    try:
        # Count total comparisons
        total_comparisons = db.query(Comparison).count()

        return {
            "total_comparisons": total_comparisons
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch comparisons count"
        )


@router.get(
    "/activity/monthly",
    response_model=MonthlyActivityResponse,
    summary="Get monthly activity count",
    description="""
    Get activity count for the current calendar month.

    Returns the number of activities logged in the current month
    (excluding LOGIN events) along with the month identifier.

    **Authentication:** Required (JWT Bearer token)

    **Response:**
    - activities_this_month: Number of activities in current month
      (excluding LOGIN)
    - month: Current month in YYYY-MM format

    **Note:** LOGIN activities are excluded from the count as they
    are not relevant for dashboard display of user actions.
    """,
    responses={
        200: {
            "description": "Monthly activity count retrieved successfully",
            "content": {
                "application/json": {
                    "example": {
                        "activities_this_month": 120,
                        "month": "2025-11"
                    }
                }
            }
        },
        401: {"description": "Not authenticated"},
        403: {"description": "Inactive user"},
        500: {"description": "Internal server error"}
    }
)
async def get_monthly_activity(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Get activity count for current calendar month.

    Args:
        db: Database session
        current_user: Authenticated active user

    Returns:
        MonthlyActivityResponse with activities_this_month and month

    Raises:
        HTTPException: 500 if database query fails

    Note:
        LOGIN activities are excluded from the count to show only
        meaningful user actions in the dashboard.
    """
    try:
        # Get current month
        now = datetime.utcnow()
        current_year = now.year
        current_month = now.month

        # Count activities in current month (excluding LOGIN)
        activities_count = db.query(Activity).filter(
            extract('year', Activity.timestamp) == current_year,
            extract('month', Activity.timestamp) == current_month,
            Activity.activity_type != 'LOGIN'
        ).count()

        return {
            "activities_this_month": activities_count,
            "month": f"{current_year}-{current_month:02d}"
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch monthly activity"
        )
