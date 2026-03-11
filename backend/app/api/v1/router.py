"""
Main API router for version 1 endpoints.

This module aggregates all API v1 routes and provides the main router
for the FastAPI application.
"""

from fastapi import APIRouter
from typing import Dict, Any

from app.core.config import settings
from app.core.database import check_database_connection


# Create the main API router
api_router = APIRouter()


@api_router.get("/health", tags=["health"])
async def health_check() -> Dict[str, Any]:
    """Health check endpoint for monitoring and load balancers.
    
    Returns:
        Dict containing health status and system information
    """
    db_status = "connected" if check_database_connection() else "not_connected"
    
    return {
        "status": "healthy",
        "timestamp": settings.get_current_timestamp(),
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "database": db_status
    }


@api_router.get("/info", tags=["system"])
async def system_info() -> Dict[str, Any]:
    """System information endpoint.
    
    Returns:
        Dict containing system information and API details
    """
    return {
        "name": settings.APP_NAME,
        "version": settings.VERSION,
        "description": settings.DESCRIPTION,
        "environment": settings.ENVIRONMENT,
        "documentation_url": "/docs",
        "openapi_url": "/openapi.json"
    }


# Include endpoint routers
from app.api.v1.endpoints import auth, templates, comparisons, ingest, activity, metrics

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(templates.router, prefix="/templates", tags=["templates"])
api_router.include_router(ingest.router, prefix="/templates", tags=["template-ingestion"])
api_router.include_router(comparisons.router, prefix="/comparisons", tags=["comparisons"])
api_router.include_router(activity.router, prefix="/activity", tags=["activity"])
api_router.include_router(metrics.router, prefix="/metrics", tags=["metrics"])
