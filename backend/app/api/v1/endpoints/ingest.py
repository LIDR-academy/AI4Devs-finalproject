"""
Template ingestion endpoint for SEPE Templates Comparator API.

This module handles the complete template ingestion workflow following
SOLID principles (Single Responsibility).
"""
import logging
from typing import Any
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
    UploadFile,
    File,
    Form
)
from sqlalchemy.orm import Session

from app.core.auth import get_current_active_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.template import (
    TemplateIngestResponse,
    TemplateVersionIngestResponse
)
from app.services.template_service import (
    TemplateService,
    TemplateIngestionError
)
from app.services.pdf_analysis_service import (
    InvalidPDFError,
    NoFormFieldsError
)
from app.services.activity_service import ActivityService
from app.schemas.activity import ActivityType


logger = logging.getLogger(__name__)
router = APIRouter()


@router.post(
    "/ingest",
    response_model=TemplateIngestResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Ingest PDF Template",
    description="""
    Complete template ingestion workflow: upload PDF, analyze fields,
    and persist to database.

    This endpoint performs the following operations:
    1. Validates and stores the uploaded PDF file
    2. Analyzes the PDF to extract all AcroForm fields
    3. Persists template metadata, version, and fields to the database
    4. Returns template details with unique ID

    **Authentication Required:** Valid JWT token must be provided.

    **File Requirements:**
    - Format: PDF files only (.pdf extension)
    - Size: Maximum 10MB
    - Content: Must contain AcroForm fields

    **Request Fields:**
    - `file`: PDF template file (required)
    - `name`: Template name, 1-255 characters (required)
    - `version`: Version identifier, 1-50 characters (required)
    - `sepe_url`: Optional SEPE source URL (must be valid URL)
    """,
    responses={
        201: {
            "description": "Template ingested successfully",
            "content": {
                "application/json": {
                    "example": {
                        "id": 1,
                        "name": "Solicitud de Prestación",
                        "version": "2024-Q1",
                        "file_path": "/app/uploads/abc-123.pdf",
                        "file_size_bytes": 245760,
                        "field_count": 48,
                        "checksum": "e3b0c442...",
                        "message": "Template ingested successfully"
                    }
                }
            }
        },
        400: {
            "description": "Bad Request - Invalid file or PDF error",
            "content": {
                "application/json": {
                    "examples": {
                        "invalid_file": {
                            "summary": "Invalid file type",
                            "value": {
                                "detail": "Only PDF files are allowed"
                            }
                        },
                        "empty_file": {
                            "summary": "Empty file",
                            "value": {
                                "detail": "File is empty"
                            }
                        },
                        "no_fields": {
                            "summary": "No form fields",
                            "value": {
                                "detail": "No AcroForm fields found"
                            }
                        },
                        "invalid_pdf": {
                            "summary": "Corrupted PDF",
                            "value": {
                                "detail": "Invalid or corrupted PDF file"
                            }
                        }
                    }
                }
            }
        },
        401: {
            "description": "Unauthorized - Authentication required",
            "content": {
                "application/json": {
                    "example": {"detail": "Not authenticated"}
                }
            }
        },
        413: {
            "description": "Payload Too Large - File exceeds 10MB",
            "content": {
                "application/json": {
                    "example": {
                        "detail": "File exceeds maximum size limit of 10MB"
                    }
                }
            }
        },
        422: {
            "description": "Validation Error - Invalid request parameters",
            "content": {
                "application/json": {
                    "example": {
                        "detail": [
                            {
                                "loc": ["body", "name"],
                                "msg": "field required",
                                "type": "value_error.missing"
                            }
                        ]
                    }
                }
            }
        },
        500: {
            "description": "Internal Server Error",
            "content": {
                "application/json": {
                    "example": {
                        "detail": "Failed to ingest template"
                    }
                }
            }
        }
    },
    tags=["Template Ingestion"]
)
async def ingest_template(
    file: UploadFile = File(..., description="PDF template file (max 10MB)"),
    name: str = Form(
        ...,
        min_length=1,
        max_length=255,
        description="Template name"
    ),
    version: str = Form(
        ...,
        min_length=1,
        max_length=50,
        description="Version identifier"
    ),
    sepe_url: str = Form(
        None,
        max_length=1000,
        description="Optional SEPE source URL"
    ),
    comment: str = Form(
        None,
        description="Optional comment about the template"
    ),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Ingest a new PDF template with complete analysis and persistence.

    Args:
        file: PDF template file (max 10MB)
        name: Template name (1-255 characters)
        version: Version identifier (1-50 characters)
        sepe_url: Optional SEPE source URL (max 1000 characters)
        current_user: Authenticated user (from JWT)
        db: Database session

    Returns:
        TemplateIngestResponse: Created template details

    Raises:
        HTTPException 400: Invalid file, no fields, or corrupted PDF
        HTTPException 401: Not authenticated
        HTTPException 413: File exceeds 10MB limit
        HTTPException 422: Validation error
        HTTPException 500: Internal server error
    """
    logger.info(
        f"Template ingestion request: user={current_user.id}, "
        f"name={name}, version={version}"
    )

    try:
        # Validate file is provided
        if not file or not file.filename:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No file provided in the request"
            )

        # Validate file extension
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only PDF files are allowed. Please upload a valid PDF."
            )

        # Read and validate file content
        file_content = await file.read()
        file_size = len(file_content)

        # Validate file size (10MB limit)
        max_size_bytes = 10 * 1024 * 1024  # 10MB
        if file_size > max_size_bytes:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=(
                    f"File exceeds maximum size limit of 10MB. "
                    f"File size: {file_size / (1024*1024):.1f}MB"
                )
            )

        # Validate file is not empty
        if file_size == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File is empty. Please provide a valid PDF document."
            )

        # Reset file pointer for service to read
        await file.seek(0)

        # Initialize template service
        template_service = TemplateService(db)

        # Perform complete ingestion workflow
        template = await template_service.ingest_template(
            file=file,
            name=name,
            version=version,
            sepe_url=sepe_url,
            comment=comment,
            user_id=int(current_user.id)  # type: ignore
        )

        logger.info(
            f"Template ingestion successful: template_id={template.id}"
        )

        # Log TEMPLATE_SAVED activity
        activity_service = ActivityService(db)
        activity_service.log_activity(
            user_id=int(current_user.id),
            activity_type=ActivityType.TEMPLATE_SAVED.value,
            description=f"Template ingested: '{name}' v{version} by {current_user.email}",
            entity_id=template.id
        )

        # Calculate checksum (should come from service)
        # For now, we'll use a placeholder or get it from file_path
        import hashlib
        checksum = hashlib.sha256(file_content).hexdigest()

        # Get current version data for response
        current_version = template.current_version_record

        # Return success response with version_id for navigation
        return TemplateIngestResponse(
            id=int(template.id),  # type: ignore
            name=str(template.name),
            current_version=str(template.current_version),
            comment=str(template.comment) if template.comment else None,
            file_path=(
                str(current_version.file_path) if current_version else ""
            ),
            file_size_bytes=(
                int(current_version.file_size_bytes)  # type: ignore
                if current_version else 0
            ),
            field_count=(
                int(current_version.field_count)  # type: ignore
                if current_version else 0
            ),
            sepe_url=current_version.sepe_url if current_version else None,
            checksum=checksum,
            message="Template ingested successfully",
            version_id=(
                int(current_version.id)  # type: ignore
                if current_version else 0
            )
        )

    except HTTPException:
        # Re-raise HTTP exceptions to let FastAPI handle them
        raise

    except ValueError as e:
        # Handle validation errors from service
        logger.warning(
            f"Validation error during ingestion: {str(e)}"
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

    except InvalidPDFError as e:
        # Handle invalid PDF errors
        logger.warning(
            f"Invalid PDF during ingestion: {str(e)}"
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid or corrupted PDF file: {str(e)}"
        )

    except NoFormFieldsError as e:
        # Handle PDFs without form fields
        logger.warning(
            f"No form fields found during ingestion: {str(e)}"
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No AcroForm fields found in PDF: {str(e)}"
        )

    except TemplateIngestionError as e:
        # Handle template ingestion errors (database, filesystem, etc.)
        logger.error(
            f"Template ingestion error: {str(e)}", exc_info=True
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to ingest template. Please try again."
        )

    except Exception as e:
        # Handle unexpected errors
        logger.error(
            f"Unexpected error during template ingestion: {str(e)}",
            exc_info=True
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred. Please try again."
        )


@router.post(
    "/ingest/version",
    response_model=TemplateVersionIngestResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Ingest New Template Version",
    description="""
    Create a new version of an existing PDF template.

    This endpoint performs the following operations:
    1. Validates that the template exists in the system
    2. Validates and stores the uploaded PDF file
    3. Analyzes the PDF to extract all AcroForm fields
    4. Creates a new version record with fields
    5. Marks the new version as current and old versions as non-current
    6. Updates the parent template's current_version reference

    **Authentication Required:** Valid JWT token must be provided.

    **File Requirements:**
    - Format: PDF files only (.pdf extension)
    - Size: Maximum 10MB
    - Content: Must contain AcroForm fields

    **Request Fields:**
    - `file`: PDF template file (required)
    - `template_id`: Existing template ID (required, positive integer)
    - `version`: Version identifier, 1-50 characters (required)
    - `change_summary`: Optional description of changes in this version
    - `sepe_url`: Optional SEPE source URL (must be valid URL)

    **Use Case:**
    When SEPE publishes an updated version of a form
    (e.g., fields added/removed), use this endpoint to add
    a new version while maintaining version history.
    """,
    responses={
        201: {
            "description": "Version ingested successfully",
            "content": {
                "application/json": {
                    "example": {
                        "template_id": 10,
                        "version_id": 42,
                        "version_number": "2024-Q2",
                        "change_summary": (
                            "Added new fields for RGPD compliance"
                        ),
                        "file_path": "/app/uploads/def-456.pdf",
                        "file_size_bytes": 267890,
                        "field_count": 52,
                        "is_current": True,
                        "message": "Version ingested successfully"
                    }
                }
            }
        },
        400: {
            "description": "Bad Request - Invalid file or PDF error",
            "content": {
                "application/json": {
                    "examples": {
                        "invalid_file": {
                            "summary": "Invalid file type",
                            "value": {"detail": "Only PDF files are allowed"}
                        },
                        "empty_file": {
                            "summary": "Empty file",
                            "value": {"detail": "File is empty"}
                        },
                        "no_fields": {
                            "summary": "No form fields",
                            "value": {
                                "detail": "No AcroForm fields found in PDF"
                            }
                        },
                        "invalid_pdf": {
                            "summary": "Corrupted PDF",
                            "value": {
                                "detail": "Invalid or corrupted PDF file"
                            }
                        }
                    }
                }
            }
        },
        401: {
            "description": "Unauthorized - Authentication required",
            "content": {
                "application/json": {
                    "example": {"detail": "Not authenticated"}
                }
            }
        },
        404: {
            "description": "Not Found - Template does not exist",
            "content": {
                "application/json": {
                    "example": {
                        "detail": "Template with ID 999 not found"
                    }
                }
            }
        },
        413: {
            "description": "Payload Too Large - File exceeds 10MB",
            "content": {
                "application/json": {
                    "example": {
                        "detail": "File exceeds maximum size limit of 10MB"
                    }
                }
            }
        },
        422: {
            "description": "Validation Error - Invalid request parameters",
            "content": {
                "application/json": {
                    "example": {
                        "detail": [
                            {
                                "loc": ["body", "template_id"],
                                "msg": "ensure this value is greater than 0",
                                "type": "value_error.number.not_gt"
                            }
                        ]
                    }
                }
            }
        },
        500: {
            "description": "Internal Server Error",
            "content": {
                "application/json": {
                    "example": {
                        "detail": "Failed to ingest template version"
                    }
                }
            }
        }
    },
    tags=["Template Ingestion"]
)
async def ingest_template_version(
    file: UploadFile = File(
        ...,
        description="PDF template file (max 10MB)"
    ),
    template_id: int = Form(
        ...,
        gt=0,
        description="Existing template ID (must be a positive integer)"
    ),
    version: str = Form(
        ...,
        min_length=1,
        max_length=50,
        description="Version identifier (e.g., '2024-Q2', 'v2.0')"
    ),
    change_summary: str = Form(
        None,
        description="Optional description of changes in this version"
    ),
    sepe_url: str = Form(
        None,
        max_length=1000,
        description="Optional SEPE source URL"
    ),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Ingest a new version of an existing PDF template.

    Args:
        file: PDF template file (max 10MB)
        template_id: Existing template ID (positive integer)
        version: Version identifier (1-50 characters)
        change_summary: Optional description of changes
        sepe_url: Optional SEPE source URL (max 1000 characters)
        current_user: Authenticated user (from JWT)
        db: Database session

    Returns:
        TemplateVersionIngestResponse: Created version details

    Raises:
        HTTPException 400: Invalid file, no fields, or corrupted PDF
        HTTPException 401: Not authenticated
        HTTPException 404: Template not found
        HTTPException 413: File exceeds 10MB limit
        HTTPException 422: Validation error
        HTTPException 500: Internal server error
    """
    logger.info(
        f"Version ingestion request: user={current_user.id}, "
        f"template_id={template_id}, version={version}"
    )

    try:
        # Validate file is provided
        if not file or not file.filename:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No file provided in the request"
            )

        # Validate file extension
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only PDF files are allowed. Please upload a valid PDF."
            )

        # Read and validate file content
        file_content = await file.read()
        file_size = len(file_content)

        # Validate file size (10MB limit)
        max_size_bytes = 10 * 1024 * 1024  # 10MB
        if file_size > max_size_bytes:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=(
                    f"File exceeds maximum size limit of 10MB. "
                    f"File size: {file_size / (1024*1024):.1f}MB"
                )
            )

        # Validate file is not empty
        if file_size == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File is empty. Please provide a valid PDF document."
            )

        # Reset file pointer for service to read
        await file.seek(0)

        # Initialize template service
        template_service = TemplateService(db)

        # Perform version ingestion workflow
        version_record = await template_service.ingest_template_version(
            file=file,
            template_id=template_id,
            version=version,
            change_summary=change_summary,
            sepe_url=sepe_url,
            user_id=int(current_user.id)  # type: ignore
        )

        logger.info(
            f"Version ingestion successful: version_id={version_record.id}, "
            f"template_id={template_id}"
        )

        # Log VERSION_SAVED activity
        activity_service = ActivityService(db)
        activity_service.log_activity(
            user_id=int(current_user.id),
            activity_type=ActivityType.VERSION_SAVED.value,
            description=f"New template version ingested: v{version} for template {template_id} by {current_user.email}",
            entity_id=version_record.id
        )

        # Return success response
        return TemplateVersionIngestResponse(
            template_id=int(version_record.template_id),  # type: ignore
            version_id=int(version_record.id),  # type: ignore
            version_number=str(version_record.version_number),
            change_summary=(
                str(version_record.change_summary)
                if version_record.change_summary else None
            ),
            file_path=str(version_record.file_path),
            file_size_bytes=(
                int(version_record.file_size_bytes)  # type: ignore
            ),
            field_count=int(version_record.field_count),  # type: ignore
            is_current=bool(version_record.is_current),
            message="Version ingested successfully"
        )

    except HTTPException:
        # Re-raise HTTP exceptions to let FastAPI handle them
        raise

    except ValueError as e:
        # Handle validation errors (e.g., template not found)
        error_msg = str(e).lower()
        if "not found" in error_msg:
            logger.warning(
                f"Template not found during version ingestion: {str(e)}"
            )
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=str(e)
            )
        else:
            logger.warning(
                f"Validation error during version ingestion: {str(e)}"
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )

    except InvalidPDFError as e:
        # Handle invalid PDF errors
        logger.warning(
            f"Invalid PDF during version ingestion: {str(e)}"
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid or corrupted PDF file: {str(e)}"
        )

    except NoFormFieldsError as e:
        # Handle PDFs without form fields
        logger.warning(
            f"No form fields found during version ingestion: {str(e)}"
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No AcroForm fields found in PDF: {str(e)}"
        )

    except TemplateIngestionError as e:
        # Handle template ingestion errors (database, filesystem, etc.)
        logger.error(
            f"Version ingestion error: {str(e)}", exc_info=True
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to ingest template version. Please try again."
        )

    except Exception as e:
        # Handle unexpected errors
        logger.error(
            f"Unexpected error during version ingestion: {str(e)}",
            exc_info=True
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred. Please try again."
        )
