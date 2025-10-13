"""
Main entry point for the Personal Finance Tracker API.

This module contains the FastAPI application instance with configuration
loaded from environment variables.
"""

from fastapi import FastAPI, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import ValidationError
from sqlalchemy.orm import Session
from sqlalchemy import text
import time

from app.core.config import get_settings
from app.core.exceptions import BaseAPIException
from app.core.logging import get_logger
from app.core.database import get_db

# Get application settings and logger
settings = get_settings()
logger = get_logger("api")

# Create FastAPI application instance
app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description="Backend API for personal finance tracking and management",
    debug=settings.debug
)

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=settings.cors_allow_credentials,
    allow_methods=settings.cors_allow_methods,
    allow_headers=settings.cors_allow_headers,
)


# ============================================================
# Global Exception Handlers
# ============================================================

@app.exception_handler(BaseAPIException)
async def base_api_exception_handler(request: Request, exc: BaseAPIException) -> JSONResponse:
    """
    Handle BaseAPIException and all its subclasses.
    
    Logs client errors (4xx) at WARNING level and server errors (5xx) at ERROR level.
    Returns consistent JSON error response format.
    """
    # Log the error with request context
    log_message = f"{request.method} {request.url.path} - {exc}"
    
    if exc.status_code >= 500:
        # Server errors - log at ERROR level with stack trace
        logger.error(log_message, exc_info=True)
    else:
        # Client errors - log at WARNING level
        logger.warning(log_message)
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": str(exc),
            "status_code": exc.status_code
        }
    )


@app.exception_handler(ValidationError)
async def pydantic_validation_exception_handler(request: Request, exc: ValidationError) -> JSONResponse:
    """
    Handle Pydantic ValidationError (from request validation).
    
    Returns 422 status with detailed field-level validation errors.
    """
    # Log validation error with request context
    log_message = f"{request.method} {request.url.path} - Validation error: {len(exc.errors())} errors"
    logger.warning(log_message)
    
    return JSONResponse(
        status_code=422,
        content={
            "detail": exc.errors()
        }
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Handle all unhandled exceptions.
    
    Logs the full exception with stack trace and returns generic 500 error
    without exposing internal details to the client.
    """
    # Log the full exception with stack trace and request context
    log_message = f"{request.method} {request.url.path} - Unhandled exception: {type(exc).__name__}: {exc}"
    logger.error(log_message, exc_info=True)
    
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "status_code": 500
        }
    )


@app.get("/health")
async def health_check():
    """
    Health check endpoint to verify the API is running.
    
    Returns:
        dict: Status information about the API
    """
    return {
        "status": "healthy",
        "message": f"{settings.app_name} is running",
        "version": "0.1.0",
        "debug": settings.debug,
        "log_level": settings.log_level
    }


@app.get("/health/db")
async def health_check_db(db: Session = Depends(get_db)):
    """
    Database health check endpoint to verify database connectivity.
    
    This endpoint tests the database connection by executing a simple query
    and measuring the response time. It returns appropriate status codes:
    - 200: Database is accessible and responding
    - 503: Database is unavailable or connection failed
    
    Args:
        db: Database session dependency
        
    Returns:
        dict: Database status information including connection state and query time
        
    Raises:
        JSONResponse: 503 status if database is unavailable
    """
    try:
        # Record start time for performance measurement
        start_time = time.time()
        
        # Execute simple query to test database connection
        # Using text() for SQLAlchemy 2.0 compatibility
        result = db.execute(text("SELECT 1"))
        result.fetchone()
        
        # Calculate query execution time
        query_time = time.time() - start_time
        
        # Log successful health check
        logger.info(f"Database health check successful - query time: {query_time:.4f}s")
        
        return {
            "status": "healthy",
            "message": "Database connection is operational",
            "database": {
                "connected": True,
                "query_time_seconds": round(query_time, 4),
                "database_url": settings.database_url.split("///")[-1] if "///" in settings.database_url else "configured"
            }
        }
        
    except Exception as e:
        # Log database connection failure
        logger.error(f"Database health check failed: {str(e)}", exc_info=True)
        
        # Return 503 Service Unavailable
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "message": "Database connection failed",
                "database": {
                    "connected": False,
                    "error": str(e)
                }
            }
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app, 
        host=settings.host, 
        port=settings.port,
        log_level=settings.log_level.lower()
    )
