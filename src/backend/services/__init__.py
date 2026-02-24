"""
Services package - Business logic layer.

This package contains all business logic separated from the API routing layer.
"""

# Lazy imports to avoid circular dependencies and import errors
# when this package is accessed from agent-worker context
__all__ = ["UploadService", "ValidationReportService", "PartsService"]

def __getattr__(name):
    """Lazy import services to avoid import errors in agent-worker context."""
    if name == "UploadService":
        from services.upload_service import UploadService
        return UploadService
    elif name == "ValidationReportService":
        from services.validation_report_service import ValidationReportService
        return ValidationReportService
    elif name == "PartsService":
        from services.parts_service import PartsService
        return PartsService
    raise AttributeError(f"module '{__name__}' has no attribute '{name}'")
