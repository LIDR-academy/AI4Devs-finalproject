"""
Main FastAPI application for SEPE Templates Comparator.

This module initializes the FastAPI application with proper configuration,
middleware, error handling, and API routing.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import logging
from typing import Dict, Any

from app.core.config import settings
from app.api.v1.router import api_router
from app.core.exceptions import SEPEComparatorError


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def create_application() -> FastAPI:
    """Create and configure the FastAPI application.
    
    Returns:
        FastAPI: Configured FastAPI application instance
    """
    app = FastAPI(
        title="SEPE Templates Comparator API",
        description="API for comparing SEPE PDF templates and managing template catalogs",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json"
    )
    
    # Add middleware
    setup_middleware(app)
    
    # Add exception handlers
    setup_exception_handlers(app)
    
    # Include API routes
    app.include_router(api_router, prefix="/api/v1")
    
    # Add startup and shutdown event handlers
    setup_event_handlers(app)
    
    return app


def setup_middleware(app: FastAPI) -> None:
    """Configure application middleware.
    
    Args:
        app: FastAPI application instance
    """
    # CORS middleware
    # In development, allow all origins for easier testing
    allowed_origins = settings.ALLOWED_HOSTS if not settings.is_development() else ["*"]
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allow_headers=["*"],
        expose_headers=["*"],
    )
    
    # Trusted host middleware (only in production)
    if not settings.is_development():
        app.add_middleware(
            TrustedHostMiddleware,
            allowed_hosts=settings.ALLOWED_HOSTS
        )


def setup_exception_handlers(app: FastAPI) -> None:
    """Configure custom exception handlers.
    
    Args:
        app: FastAPI application instance
    """
    
    @app.exception_handler(SEPEComparatorError)
    async def sepe_comparator_exception_handler(
        request, 
        exc: SEPEComparatorError
    ) -> JSONResponse:
        """Handle custom SEPE Comparator exceptions."""
        logger.error(f"SEPE Comparator error: {str(exc)}")
        return JSONResponse(
            status_code=400,
            content={
                "error": "sepe_comparator_error",
                "message": str(exc),
                "timestamp": settings.get_current_timestamp()
            }
        )
    
    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(
        request, 
        exc: StarletteHTTPException
    ) -> JSONResponse:
        """Handle HTTP exceptions with consistent format."""
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": "http_error",
                "message": exc.detail,
                "status_code": exc.status_code,
                "timestamp": settings.get_current_timestamp()
            }
        )
    
    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        request, 
        exc: RequestValidationError
    ) -> JSONResponse:
        """Handle request validation errors."""
        return JSONResponse(
            status_code=422,
            content={
                "error": "validation_error",
                "message": "Request validation failed",
                "details": exc.errors(),
                "timestamp": settings.get_current_timestamp()
            }
        )


def setup_event_handlers(app: FastAPI) -> None:
    """Configure application startup and shutdown event handlers.
    
    Args:
        app: FastAPI application instance
    """
    
    @app.on_event("startup")
    async def startup_event():
        """Application startup event handler."""
        logger.info("SEPE Templates Comparator API starting up...")
        logger.info(f"Environment: {settings.ENVIRONMENT}")
        logger.info(f"Debug mode: {settings.DEBUG}")
    
    @app.on_event("shutdown")
    async def shutdown_event():
        """Application shutdown event handler."""
        logger.info("SEPE Templates Comparator API shutting down...")


# Create the application instance
app = create_application()


@app.get("/", tags=["root"])
async def root() -> Dict[str, Any]:
    """Root endpoint providing basic API information.
    
    Returns:
        Dict containing API information and status
    """
    return {
        "name": "SEPE Templates Comparator API",
        "version": "1.0.0",
        "status": "healthy",
        "documentation": "/docs",
        "timestamp": settings.get_current_timestamp()
    }


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info" if not settings.DEBUG else "debug"
    )
