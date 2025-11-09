"""
Template CRUD endpoints for SEPE Templates Comparator API.

This module handles Read, Update, and Delete operations for PDF templates.
For template ingestion (create with analysis), use the /ingest endpoint.
For temporary PDF analysis without persistence, use the /analyze endpoint.
"""

import os
import time
import re
from typing import Any, Optional
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
    UploadFile,
    File,
    Query
)
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc, or_
from pathlib import Path

from app.core.auth import get_current_active_user, get_optional_current_user
from app.core.database import get_db
from app.models.user import User
from app.models.template import (
    PDFTemplate,
    TemplateVersion,
    TemplateField as TemplateFieldModel
)
from app.schemas.template import (
    TemplateResponse,
    TemplateListResponse,
    TemplateUpdate,
    TemplateVersionResponse,
    TemplateVersionListResponse,
    TemplateVersionDetailResponse,
    TemplateBasicInfo,
    TemplateFieldResponse,
    TemplateFieldListResponse,
    VersionInfo,
    TemplateNameItem,
    TemplateNamesResponse,
)
from app.schemas.pdf_analysis import (
    TemplateField as TemplateFieldSchema,
    AnalysisResponse,
    create_analysis_response,
)
from app.services.pdf_analysis_service import (
    PDFAnalysisService,
    PDFProcessingError,
    InvalidPDFError,
    NoFormFieldsError
)
from app.services.activity_service import ActivityService
from app.schemas.activity import ActivityType

router = APIRouter()


@router.get(
    "/",
    response_model=TemplateListResponse,
    summary="List Templates",
    description="""
    Retrieve a paginated list of ingested PDF templates with filtering and sorting.
    
    This endpoint provides read-only access to the catalog of templates
    that have been successfully ingested and stored in the system.
    
    **Features:**
    - Pagination with configurable page size
    - Full-text search by template name or version
    - Flexible sorting by any template field
    - Public access (no authentication required)
    
    **Use Cases:**
    - Browse available templates for comparison
    - Search for specific template versions
    - Display template catalog in UI
    """,
    tags=["Templates - CRUD"]
)
def list_templates(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(10, ge=1, le=100, description="Number of records to return"),
    search: Optional[str] = Query(None, description="Search by name or version"),
    sort_by: str = Query("created_at", description="Sort field"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$", description="Sort order"),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    List PDF templates with pagination, filtering, and sorting.
    
    Args:
        skip: Number of records to skip for pagination
        limit: Maximum number of records to return (1-100)
        search: Optional search term for filtering by name or version
        sort_by: Field name to sort by (default: created_at)
        sort_order: Sort direction - 'asc' or 'desc' (default: desc)
        current_user: Optional authenticated user (for personalization)
        db: Database session
        
    Returns:
        TemplateListResponse: Paginated list with items, total count, and pagination info
    """
    # Join with current version to get file data
    query = db.query(PDFTemplate).outerjoin(
        TemplateVersion,
        (TemplateVersion.template_id == PDFTemplate.id) &
        (TemplateVersion.is_current == True)
    )
    
    # Apply search filter
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            PDFTemplate.name.ilike(search_term) |
            PDFTemplate.current_version.ilike(search_term)
        )
    
    # Apply sorting
    sort_column = getattr(PDFTemplate, sort_by, PDFTemplate.created_at)
    if sort_order == "desc":
        query = query.order_by(desc(sort_column))
    else:
        query = query.order_by(asc(sort_column))
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    templates = query.offset(skip).limit(limit).all()
    
    # Convert to response format
    template_responses = []
    for template in templates:
        # Get current version data
        current_version = template.current_version_record
        
        template_responses.append(TemplateResponse(
            id=template.id,
            name=template.name,
            current_version=template.current_version,
            comment=template.comment,
            uploaded_by=template.uploaded_by,
            created_at=template.created_at,
            updated_at=template.updated_at,
            # From current version
            file_path=current_version.file_path if current_version else None,
            file_size_bytes=current_version.file_size_bytes if current_version else None,
            field_count=current_version.field_count if current_version else None,
            sepe_url=current_version.sepe_url if current_version else None
        ))
    
    return TemplateListResponse(
        items=template_responses,
        total=total,
        limit=limit,
        offset=skip
    )


@router.get(
    "/names",
    response_model=TemplateNamesResponse,
    summary="Get Template Names",
    description="""
    Retrieve a lightweight list of template names for UI selectors (dropdowns, autocomplete).
    
    This endpoint provides minimal template data optimized for:
    - Version upload modal template selection
    - Dropdown/combobox components
    - Autocomplete/typeahead functionality
    
    **Features:**
    - Returns only ID, name, and current version
    - Case-insensitive search by template name
    - Flexible sorting (by name or creation date)
    - Pagination support (max 500 results)
    
    **Authentication Required:** Valid JWT token
    
    **Use Cases:**
    - Populate template selector in version upload modal
    - Quick template lookup by name
    - Template reference in other forms
    
    **Performance:**
    - Optimized query with minimal data
    - Uses database indexes for fast searching
    - Suitable for frequent requests (e.g., on every keystroke)
    """,
    tags=["Templates - CRUD"],
    responses={
        200: {
            "description": "Template names retrieved successfully",
            "content": {
                "application/json": {
                    "example": {
                        "items": [
                            {
                                "id": 1,
                                "name": "Solicitud Prestación Desempleo",
                                "current_version": "2024-Q1"
                            },
                            {
                                "id": 5,
                                "name": "Modificación Datos Personales",
                                "current_version": "v2.0"
                            },
                            {
                                "id": 10,
                                "name": "Certificado de Empresa",
                                "current_version": "1.5"
                            }
                        ],
                        "total": 3
                    }
                }
            }
        },
        401: {"description": "Not authenticated"},
        422: {"description": "Validation error (invalid parameters)"},
    }
)
def get_template_names(
    search: Optional[str] = Query(None, description="Search by template name (case-insensitive)"),
    limit: int = Query(100, ge=1, le=500, description="Maximum number of results (1-500)"),
    sort_by: str = Query("name", description="Sort field: 'name' or 'created_at'"),
    sort_order: str = Query("asc", pattern="^(asc|desc)$", description="Sort order: 'asc' or 'desc'"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Get lightweight list of template names for UI selectors.
    
    Returns minimal template data (id, name, current_version) optimized for
    dropdown and autocomplete components. Supports search and sorting.
    
    Args:
        search: Optional search term for filtering by name (case-insensitive)
        limit: Maximum number of results (1-500, default: 100)
        sort_by: Field to sort by - 'name' or 'created_at' (default: name)
        sort_order: Sort direction - 'asc' or 'desc' (default: asc)
        current_user: Authenticated user from JWT token
        db: Database session
        
    Returns:
        TemplateNamesResponse: List of template name items with total count
        
    Raises:
        HTTPException 401: If not authenticated
        HTTPException 422: If validation error in query parameters
    """
    # Build query - select only necessary fields for performance
    query = db.query(PDFTemplate)
    
    # Apply search filter if provided
    if search:
        search_term = f"%{search}%"
        query = query.filter(PDFTemplate.name.ilike(search_term))
    
    # Validate and apply sorting
    valid_sort_fields = ["name", "created_at"]
    if sort_by not in valid_sort_fields:
        sort_by = "name"
    
    sort_column = getattr(PDFTemplate, sort_by)
    if sort_order == "desc":
        query = query.order_by(desc(sort_column))
    else:
        query = query.order_by(asc(sort_column))
    
    # Get total count before pagination
    total = query.count()
    
    # Apply limit (pagination)
    templates = query.limit(limit).all()
    
    # Build lightweight response
    items = [
        TemplateNameItem(
            id=template.id,
            name=template.name,
            current_version=template.current_version
        )
        for template in templates
    ]
    
    return TemplateNamesResponse(
        items=items,
        total=total
    )


@router.get(
    "/versions/{version_id}",
    response_model=TemplateVersionDetailResponse,
    summary="Get Template Version by ID",
    description="""
    Retrieve detailed information about a specific template version.
    
    This endpoint returns complete version metadata along with associated 
    template information in a single response. It's designed for:
    - Success pages after template creation
    - Version detail views
    - Any scenario requiring both version and template data together
    
    **Returns:**
    - Complete version metadata (file info, PDF metadata)
    - Associated template information (name, current version, etc.)
    - All in one response to minimize API calls
    
    **Authentication Required:** Valid JWT token
    
    **Error Responses:**
    - 404: Version not found or associated template not found
    - 401: Not authenticated
    - 403: Insufficient permissions (if authorization is enabled)
    """,
    tags=["Templates - Versions"],
    responses={
        200: {
            "description": "Version details retrieved successfully",
            "content": {
                "application/json": {
                    "example": {
                        "id": 1,
                        "version_number": "1.0",
                        "change_summary": "Initial version",
                        "is_current": True,
                        "created_at": "2025-10-26T10:00:00Z",
                        "file_path": "/app/uploads/abc-123.pdf",
                        "file_size_bytes": 2621440,
                        "field_count": 48,
                        "sepe_url": "https://www.sepe.es/templates/solicitud",
                        "title": "Solicitud de Prestación",
                        "author": "SEPE",
                        "subject": "Formulario de Solicitud",
                        "creation_date": "2024-10-15T08:00:00Z",
                        "modification_date": "2024-10-20T14:30:00Z",
                        "page_count": 5,
                        "template": {
                            "id": 10,
                            "name": "Solicitud Prestación Desempleo",
                            "current_version": "1.0",
                            "comment": "Formulario oficial SEPE 2024",
                            "uploaded_by": 5,
                            "created_at": "2025-10-26T09:45:00Z"
                        }
                    }
                }
            }
        },
        404: {"description": "Version not found"},
        401: {"description": "Not authenticated"},
    }
)
def get_version_by_id(
    version_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Get detailed template version information by ID.
    
    Retrieves a specific template version with all its metadata and
    associated template information. Uses eager loading to fetch
    both version and template data in a single database query.
    
    Args:
        version_id: Unique version identifier
        current_user: Authenticated user from JWT token
        db: Database session
        
    Returns:
        TemplateVersionDetailResponse: Complete version data with template info
        
    Raises:
        HTTPException 404: If version or associated template not found
        HTTPException 403: If user lacks permission (optional, not implemented yet)
    """
    # Query version with its template relationship
    version = db.query(TemplateVersion).filter(
        TemplateVersion.id == version_id
    ).first()
    
    if not version:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Template version with ID {version_id} not found"
        )
    
    # Get associated template
    template = version.template
    
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Associated template not found for this version"
        )
    
    # Optional: Check permissions
    # Uncomment if you want to restrict access to template owners only
    # if template.uploaded_by and template.uploaded_by != current_user.id:
    #     if not current_user.is_superuser:
    #         raise HTTPException(
    #             status_code=status.HTTP_403_FORBIDDEN,
    #             detail="Not enough permissions to view this version"
    #         )
    
    # Build response with version and template data
    return TemplateVersionDetailResponse(
        # Version data
        id=version.id,
        version_number=version.version_number,
        change_summary=version.change_summary,
        is_current=version.is_current,
        created_at=version.created_at,
        # File information (version-specific)
        file_path=version.file_path,
        file_size_bytes=version.file_size_bytes,
        field_count=version.field_count,
        sepe_url=version.sepe_url,
        # PDF metadata
        title=version.title,
        author=version.author,
        subject=version.subject,
        creation_date=version.creation_date,
        modification_date=version.modification_date,
        page_count=version.page_count,
        # Template information
        template=TemplateBasicInfo(
            id=template.id,
            name=template.name,
            current_version=template.current_version,
            comment=template.comment,
            uploaded_by=template.uploaded_by,
            created_at=template.created_at
        )
    )


@router.get(
    "/versions/{version_id}/download",
    summary="Download Template Version PDF",
    description="""
    Download the PDF file for a specific template version.
    
    This endpoint allows downloading any version of a template, not just the current one.
    Useful for:
    - Success pages after template creation (download just-created version)
    - Version history comparison
    - Archival purposes
    
    **Authentication Required:** Valid JWT token
    
    **Response:** Binary PDF file with appropriate headers for download
    
    **Filename Format:** `{template_name}_v{version_number}.pdf`
    
    Special characters in filenames are sanitized for compatibility.
    """,
    tags=["Templates - Versions"],
    response_class=FileResponse
)
def download_template_version(
    version_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> FileResponse:
    """
    Download PDF file for a specific template version.
    
    Args:
        version_id: Unique version identifier
        current_user: Authenticated user
        db: Database session
        
    Returns:
        FileResponse: PDF file stream with download headers
        
    Raises:
        HTTPException 404: If version or file not found
        HTTPException 401: If not authenticated
    """
    # Get version
    version = db.query(TemplateVersion).filter(
        TemplateVersion.id == version_id
    ).first()
    
    if not version:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Template version with ID {version_id} not found"
        )
    
    # Get template for filename
    template = version.template
    
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Associated template not found for this version"
        )
    
    # Check if file exists
    if not os.path.exists(version.file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"PDF file not found at path: {version.file_path}"
        )
    
    # Sanitize filename
    safe_name = re.sub(r'[^\w\s-]', '', template.name).strip().replace(' ', '_')
    safe_version = re.sub(r'[^\w.-]', '', version.version_number)
    filename = f"{safe_name}_v{safe_version}.pdf"
    
    # Return file response with download headers
    return FileResponse(
        path=version.file_path,
        media_type="application/pdf",
        filename=filename,
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )


@router.get(
    "/{template_id}",
    response_model=TemplateResponse,
    summary="Get Template by ID",
    description="Retrieve detailed information about a specific template.",
    tags=["Templates - CRUD"]
)
def get_template(
    template_id: int,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Get a specific template by ID.
    
    Args:
        template_id: Unique template identifier
        current_user: Optional authenticated user
        db: Database session
        
    Returns:
        TemplateResponse: Complete template data including metadata
        
    Raises:
        HTTPException 404: If template not found
    """
    template = db.query(PDFTemplate).filter(PDFTemplate.id == template_id).first()
    
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    
    # Get current version data
    current_version = template.current_version_record
    
    return TemplateResponse(
        id=template.id,
        name=template.name,
        current_version=template.current_version,
        comment=template.comment,
        uploaded_by=template.uploaded_by,
        created_at=template.created_at,
        updated_at=template.updated_at,
        # From current version
        file_path=current_version.file_path if current_version else None,
        file_size_bytes=current_version.file_size_bytes if current_version else None,
        field_count=current_version.field_count if current_version else None,
        sepe_url=current_version.sepe_url if current_version else None
    )


@router.put(
    "/{template_id}",
    response_model=TemplateResponse,
    summary="Update Template Metadata",
    description="""
    Update metadata for an existing template.
    
    **Authentication Required:** Only the template owner or superuser can update.
    
    **Updatable Fields:**
    - name
    - version  
    - sepe_url
    
    **Note:** The PDF file itself cannot be updated. To change the PDF,
    ingest a new version using the /ingest endpoint.
    """,
    tags=["Templates - CRUD"]
)
def update_template(
    template_id: int,
    template_data: TemplateUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Update template metadata (name, version, sepe_url).
    
    Args:
        template_id: Unique template identifier
        template_data: Fields to update (only non-null fields are updated)
        current_user: Authenticated user (must be owner or superuser)
        db: Database session
        
    Returns:
        TemplateResponse: Updated template data
        
    Raises:
        HTTPException 404: If template not found
        HTTPException 403: If user lacks permission to update
    """
    template = db.query(PDFTemplate).filter(PDFTemplate.id == template_id).first()
    
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    
    # Check permissions (only owner or superuser can update)
    if template.uploaded_by != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to update this template"
        )
    
    # Update fields (only template-level fields, not version-specific ones)
    update_data = template_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(template, field, value)
    
    db.commit()
    db.refresh(template)
    
    # Get current version data for response
    current_version = template.current_version_record
    
    return TemplateResponse(
        id=template.id,
        name=template.name,
        current_version=template.current_version,
        comment=template.comment,
        uploaded_by=template.uploaded_by,
        created_at=template.created_at,
        updated_at=template.updated_at,
        # From current version
        file_path=current_version.file_path if current_version else None,
        file_size_bytes=current_version.file_size_bytes if current_version else None,
        field_count=current_version.field_count if current_version else None,
        sepe_url=current_version.sepe_url if current_version else None
    )


@router.delete(
    "/{template_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete Template",
    description="""
    Permanently delete a template and all its associated data and files.
    
    **Authentication Required:** Only the template owner or superuser can delete.
    
    **Warning:** This action is irreversible. All related data will be permanently removed:
    - Template record
    - All versions
    - All template fields
    - All comparisons using any version of this template
    - All physical PDF files
    
    **Side Effects:**
    - All template_versions records are deleted (CASCADE)
    - All template_fields records are deleted (CASCADE)
    - All comparisons using any version are deleted (CASCADE)
    - All comparison_fields from affected comparisons are deleted (CASCADE)
    - All physical PDF files for all versions are removed from file system
    - Activity log entry is created with type TEMPLATE_DELETED
    
    **Returns:**
    - HTTP 204 No Content on success
    - HTTP 401 Unauthorized if not authenticated
    - HTTP 403 Forbidden if user lacks permission
    - HTTP 404 Not Found if template doesn't exist
    - HTTP 500 Internal Server Error on failure
    """,
    responses={
        204: {"description": "Template successfully deleted"},
        401: {"description": "Not authenticated"},
        403: {"description": "Not authorized to delete this template"},
        404: {"description": "Template not found"},
        500: {"description": "Failed to delete template"}
    },
    tags=["Templates - CRUD"]
)
def delete_template(
    template_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> None:
    """
    Permanently delete a template and all its associated data and files.
    
    Args:
        template_id: Unique template identifier
        current_user: Authenticated user (must be owner or superuser)
        db: Database session
        
    Raises:
        HTTPException 404: If template not found
        HTTPException 403: If user lacks permission to delete
        HTTPException 500: If deletion fails
    """
    import logging
    logger = logging.getLogger(__name__)
    
    template = db.query(PDFTemplate).filter(PDFTemplate.id == template_id).first()
    
    if not template:
        logger.warning(f"Template {template_id} not found for deletion")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    
    # Check permissions (only owner or superuser can delete)
    if template.uploaded_by != current_user.id and not current_user.is_superuser:
        logger.warning(
            f"User {current_user.id} attempted to delete template {template_id} "
            f"owned by user {template.uploaded_by}"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to delete this template"
        )
    
    try:
        # Collect file paths and template info before deletion
        file_paths = [v.file_path for v in template.versions if v.file_path]
        template_name = template.name
        version_count = len(template.versions)
        
        # Delete database record (CASCADE will delete versions, fields, and comparisons)
        db.delete(template)
        db.commit()
        
        logger.info(
            f"Template {template_id} deleted successfully by user {current_user.id}. "
            f"Deleted {version_count} versions."
        )
        
        # Delete all physical PDF files
        files_deleted = 0
        files_failed = 0
        for file_path in file_paths:
            if os.path.exists(file_path):
                try:
                    os.remove(file_path)
                    files_deleted += 1
                    logger.info(f"Physical file deleted: {file_path}")
                except Exception as file_error:
                    files_failed += 1
                    logger.error(f"Failed to delete physical file {file_path}: {str(file_error)}")
            else:
                logger.warning(f"Physical file not found: {file_path}")
        
        logger.info(
            f"File cleanup for template {template_id}: "
            f"{files_deleted} deleted, {files_failed} failed, "
            f"{len(file_paths) - files_deleted - files_failed} not found"
        )
        
        # Log activity
        activity_service = ActivityService(db)
        description = f"Template deleted: {template_name} by {current_user.email}"
        activity_service.log_activity(
            user_id=current_user.id,
            activity_type=ActivityType.TEMPLATE_DELETED.value,
            description=description,
            entity_id=template_id
        )
        
        return None  # 204 No Content
        
    except Exception as e:
        db.rollback()
        logger.error(
            f"Error deleting template {template_id}: {str(e)}",
            exc_info=True
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete template: {str(e)}"
        )


@router.get(
    "/{template_id}/download",
    summary="Download Template PDF",
    description="""
    Download the PDF file of a template's current version.
    
    **Authentication Required:** JWT Bearer token
    
    **Response:** Binary PDF file with appropriate headers for download
    
    **Filename Format:** `{template_name}_v{version}.pdf`
    
    Special characters in filenames are sanitized for compatibility.
    """,
    tags=["Templates - CRUD"],
    response_class=FileResponse
)
def download_template(
    template_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> FileResponse:
    """
    Download template PDF file.
    
    Args:
        template_id: Unique template identifier
        current_user: Authenticated user
        db: Database session
        
    Returns:
        FileResponse: PDF file stream with download headers
        
    Raises:
        HTTPException 404: If template or file not found
        HTTPException 401: If not authenticated
    """
    # Get template
    template = db.query(PDFTemplate).filter(PDFTemplate.id == template_id).first()
    
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    
    # Get current version to access file_path
    current_version = template.current_version_record
    
    if not current_version:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template has no current version"
        )
    
    # Check if file exists
    if not os.path.exists(current_version.file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="PDF file not found on disk"
        )
    
    # Sanitize filename for download
    # Replace spaces with underscores and remove special characters
    safe_name = re.sub(r'[^\w\s-]', '', template.name)
    safe_name = re.sub(r'[\s]+', '_', safe_name)
    safe_version = re.sub(r'[^\w.-]', '', template.current_version)
    filename = f"{safe_name}_v{safe_version}.pdf"
    
    return FileResponse(
        path=current_version.file_path,
        media_type="application/pdf",
        filename=filename,
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )


@router.get(
    "/{template_id}/versions",
    response_model=TemplateVersionListResponse,
    summary="Get Template Versions",
    description="""
    Retrieve all versions of a specific template with pagination and sorting.
    
    Returns version history with full PDF metadata including title, author,
    subject, page count, and document dates.
    
    **Features:**
    - Pagination support
    - Sorting by created_at, version_number, or page_count
    - Ascending or descending order
    - Current version highlighted
    """,
    tags=["Templates - CRUD"]
)
def get_template_versions(
    template_id: int,
    limit: int = Query(20, ge=1, le=100, description="Results per page"),
    offset: int = Query(0, ge=0, description="Number of results to skip"),
    sort_by: str = Query("created_at", description="Sort field: created_at, version_number, page_count"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$", description="Sort order"),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Get all versions of a template with pagination and sorting.
    
    Args:
        template_id: Unique template identifier
        limit: Maximum number of results (1-100)
        offset: Number of results to skip
        sort_by: Field to sort by
        sort_order: Sort direction (asc/desc)
        current_user: Optional authenticated user
        db: Database session
        
    Returns:
        TemplateVersionListResponse: Paginated list of versions with metadata
        
    Raises:
        HTTPException 404: If template not found
        HTTPException 422: If invalid sort parameters
    """
    # Check if template exists
    template = db.query(PDFTemplate).filter(PDFTemplate.id == template_id).first()
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    
    # Build query
    query = db.query(TemplateVersion).filter(
        TemplateVersion.template_id == template_id
    )
    
    # Apply sorting
    valid_sort_fields = ["created_at", "version_number", "page_count"]
    if sort_by not in valid_sort_fields:
        sort_by = "created_at"
    
    sort_column = getattr(TemplateVersion, sort_by)
    if sort_order == "desc":
        query = query.order_by(desc(sort_column))
    else:
        query = query.order_by(asc(sort_column))
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    versions = query.offset(offset).limit(limit).all()
    
    return TemplateVersionListResponse(
        items=[
            TemplateVersionResponse(
                id=version.id,
                template_id=version.template_id,
                version_number=version.version_number,
                change_summary=version.change_summary,
                is_current=version.is_current,
                created_at=version.created_at,
                # File information (version-specific)
                file_path=version.file_path,
                file_size_bytes=version.file_size_bytes,
                field_count=version.field_count,
                sepe_url=version.sepe_url,
                # PDF metadata
                title=version.title,
                author=version.author,
                subject=version.subject,
                creation_date=version.creation_date,
                modification_date=version.modification_date,
                page_count=version.page_count
            )
            for version in versions
        ],
        total=total,
        limit=limit,
        offset=offset
    )


@router.delete(
    "/{template_id}/versions/{version_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete Template Version",
    description="""
    Delete a specific version of a template.
    
    **Authentication Required:** User must be the uploader of the template.
    
    **Business Rule:** Cannot delete the current version (is_current=True).
    If you need to delete the current version, delete the entire template instead.
    
    **Side Effects:**
    - Version record is deleted from database
    - All template_fields records are automatically deleted (CASCADE)
    - All comparisons using this version are automatically deleted (CASCADE)
    - All comparison_fields from affected comparisons are deleted (CASCADE)
    - Physical PDF file is removed from file system
    - Activity log entry is created with type VERSION_DELETED
    
    **Returns:**
    - HTTP 204 No Content on success
    - HTTP 400 Bad Request if trying to delete current version
    - HTTP 401 Unauthorized if not authenticated
    - HTTP 403 Forbidden if user is not the uploader
    - HTTP 404 Not Found if template or version doesn't exist
    - HTTP 500 Internal Server Error on failure
    """,
    responses={
        204: {"description": "Version successfully deleted"},
        400: {"description": "Cannot delete current version"},
        401: {"description": "Not authenticated"},
        403: {"description": "Not authorized to delete this template version"},
        404: {"description": "Template or version not found"},
        500: {"description": "Failed to delete version"}
    },
    tags=["Templates - CRUD"]
)
async def delete_template_version(
    template_id: int,
    version_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> None:
    """
    Delete a specific version of a template.
    
    Args:
        template_id: ID of the template
        version_id: ID of the version to delete
        current_user: Authenticated user from JWT token
        db: Database session
        
    Raises:
        HTTPException: 404 if template or version not found
        HTTPException: 400 if trying to delete current version
        HTTPException: 403 if user is not the uploader
        HTTPException: 500 if deletion fails
    """
    import logging
    logger = logging.getLogger(__name__)
    
    try:
        # Fetch template
        template = db.query(PDFTemplate).filter(
            PDFTemplate.id == template_id
        ).first()
        
        if not template:
            logger.warning(f"Template {template_id} not found for version deletion")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Template not found"
            )
        
        # Authorization check: user must be the uploader
        if template.uploaded_by != current_user.id:
            logger.warning(
                f"User {current_user.id} attempted to delete version of template "
                f"{template_id} uploaded by user {template.uploaded_by}"
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to delete this template version"
            )
        
        # Fetch version and verify it belongs to this template
        version = db.query(TemplateVersion).filter(
            TemplateVersion.id == version_id,
            TemplateVersion.template_id == template_id
        ).first()
        
        if not version:
            logger.warning(
                f"Version {version_id} not found or does not belong to template {template_id}"
            )
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Version not found or does not belong to this template"
            )
        
        # CRITICAL VALIDATION: Cannot delete current version
        if version.is_current:
            logger.warning(
                f"User {current_user.id} attempted to delete current version "
                f"{version_id} of template {template_id}"
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete current version. Please delete the entire template instead."
            )
        
        # Store file path and version info before deletion
        file_path = version.file_path
        version_number = version.version_number
        template_name = template.name
        
        # Delete version (CASCADE will handle template_fields and comparisons)
        db.delete(version)
        db.commit()
        
        logger.info(
            f"Version {version_id} of template {template_id} deleted successfully "
            f"by user {current_user.id}"
        )
        
        # Delete physical PDF file
        if file_path and os.path.exists(file_path):
            try:
                os.remove(file_path)
                logger.info(f"Physical file deleted: {file_path}")
            except Exception as file_error:
                # Log error but don't fail the operation
                logger.error(f"Failed to delete physical file {file_path}: {str(file_error)}")
        else:
            logger.warning(f"Physical file not found or already deleted: {file_path}")
        
        # Log activity
        activity_service = ActivityService(db)
        description = (
            f"Version deleted: {template_name} {version_number} by {current_user.email}"
        )
        activity_service.log_activity(
            user_id=current_user.id,
            activity_type=ActivityType.VERSION_DELETED.value,
            description=description,
            entity_id=version_id
        )
        
        return None  # 204 No Content
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Rollback on any error
        db.rollback()
        logger.error(
            f"Error deleting version {version_id} of template {template_id}: {str(e)}",
            exc_info=True
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete template version"
        )


@router.post(
    "/analyze",
    response_model=AnalysisResponse,
    summary="Analyze PDF Template Fields (Temporary)",
    description="""
    Analyze an uploaded PDF template and extract its AcroForm field structure.
    
    **Important:** This endpoint performs temporary analysis without persisting data.
    - For permanent storage with analysis, use the `/ingest` endpoint instead.
    - This endpoint is ideal for preview/validation before ingestion.
    
    This endpoint processes PDF files containing form fields (such as SEPE templates) 
    and returns a structured analysis of all form fields found in the document.
    
    **Features:**
    - Extracts all AcroForm fields with their unique identifiers
    - Determines field types (text, radiobutton, checkbox, listbox)
    - Finds meaningful Spanish descriptive text near each field
    - Preserves document field ordering (top-to-bottom, left-to-right)
    - Handles encrypted PDFs and various PDF formats
    - Returns processing metadata including timing information
    
    **Supported Field Types:**
    - `text`: Text input fields
    - `radiobutton`: Radio button selections
    - `checkbox`: Checkbox inputs  
    - `listbox`: Dropdown/selection lists
    
    **File Requirements:**
    - Format: PDF files only (.pdf extension)
    - Size: Maximum 10MB
    - Content: Must contain AcroForm fields
    - Encoding: Supports encrypted PDFs
    
    **Response Format:**
    The response includes:
    - `status`: Success/error indicator
    - `data`: Array of field objects with ID, type, nearby text, and options
    - `metadata`: Processing information (field count, timing, page count)
    
    **Example Response:**
    ```json
    {
      "status": "success",
      "data": [
        {
          "field_id": "A0101",
          "type": "text", 
          "near_text": "hasta un máximo de",
          "value_options": null
        }
      ],
      "metadata": {
        "total_fields": 12,
        "processing_time_ms": 850,
        "document_pages": 1
      }
    }
    ```
    """,
    response_description="Structured analysis of PDF form fields with metadata",
    responses={
        200: {
            "description": "PDF analysis completed successfully",
            "content": {
                "application/json": {
                    "example": {
                        "status": "success",
                        "data": [
                            {
                                "field_id": "A0101",
                                "type": "text",
                                "near_text": "hasta un máximo de",
                                "value_options": None
                            },
                            {
                                "field_id": "A0102", 
                                "type": "text",
                                "near_text": "que suponen",
                                "value_options": None
                            }
                        ],
                        "metadata": {
                            "total_fields": 12,
                            "processing_time_ms": 850,
                            "document_pages": 1
                        }
                    }
                }
            }
        },
        400: {
            "description": "Invalid file format or empty file",
            "content": {
                "application/json": {
                    "example": {
                        "detail": "File must be a PDF (.pdf extension required)"
                    }
                }
            }
        },
        413: {
            "description": "File too large",
            "content": {
                "application/json": {
                    "example": {
                        "detail": "File size exceeds 10MB limit"
                    }
                }
            }
        },
        422: {
            "description": "Missing or invalid file parameter",
            "content": {
                "application/json": {
                    "example": {
                        "detail": [
                            {
                                "loc": ["body", "file"],
                                "msg": "field required",
                                "type": "value_error.missing"
                            }
                        ]
                    }
                }
            }
        },
        500: {
            "description": "PDF processing error",
            "content": {
                "application/json": {
                    "example": {
                        "detail": "PDF processing failed: Unable to extract form fields"
                    }
                }
            }
        }
    },
    tags=["PDF Analysis"],
    operation_id="analyze_pdf_template"
)
async def analyze_pdf_template(
    file: UploadFile = File(..., description="PDF file to analyze"),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Optional[Session] = Depends(get_db)
) -> Any:
    """
    Analyze uploaded PDF template and extract AcroForm field structure.
    
    This endpoint accepts a PDF file upload and returns a structured analysis
    of all form fields found in the document, including field IDs, types,
    nearby text, and available options for selection fields.
    
    Args:
        file: PDF file to analyze (max 10MB)
        
    Returns:
        AnalysisResponse: Structured analysis results with field data and metadata
        
    Raises:
        HTTPException: Various HTTP errors for validation and processing failures
    """
    # Start timing for processing metadata
    start_time = time.time()
    
    try:
        # Validate file is provided
        if not file.filename:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="No file provided in the request"
            )
        
        # Validate file extension
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only PDF files are allowed. Please upload a valid PDF document."
            )
        
        # Read file content for size validation
        file_content = await file.read()
        file_size = len(file_content)
        
        # Validate file size (10MB limit as specified)
        max_size_bytes = 10 * 1024 * 1024  # 10MB
        if file_size > max_size_bytes:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File exceeds maximum size limit of 10MB. File size: {file_size / (1024*1024):.1f}MB"
            )
        
        # Validate file is not empty
        if file_size == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file is empty. Please provide a valid PDF document."
            )
        
        # Create temporary file for processing
        import tempfile
        with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as temp_file:
            temp_file.write(file_content)
            temp_file_path = Path(temp_file.name)
        
        try:
            # Initialize PDF analysis service
            pdf_service = PDFAnalysisService()
            
            # Analyze the PDF
            analysis_results = pdf_service.analyze_pdf(temp_file_path)
            
            # Get the actual number of pages from the PDF
            document_pages = pdf_service.get_page_count(temp_file_path)
            
            # Convert service results to Pydantic models
            template_fields = []
            for field_data in analysis_results:
                template_field = TemplateFieldSchema(
                    field_id=field_data.field_id,
                    type=field_data.type,
                    near_text=field_data.near_text,
                    value_options=field_data.value_options
                )
                template_fields.append(template_field)
            
            # Calculate processing time
            processing_time_ms = int((time.time() - start_time) * 1000)
            
            # Create response using utility function
            response = create_analysis_response(
                fields=template_fields,
                processing_time_ms=processing_time_ms,
                document_pages=document_pages
            )
            
            # Log TEMPLATE_ANALYSIS activity (if user is authenticated)
            if current_user and db:
                activity_service = ActivityService(db)
                activity_service.log_activity(
                    user_id=current_user.id,
                    activity_type=ActivityType.TEMPLATE_ANALYSIS.value,
                    description=f"Template analyzed: '{file.filename}' ({len(template_fields)} fields) by {current_user.email}",
                    entity_id=None
                )
            
            return response
            
        finally:
            # Clean up temporary file
            if temp_file_path.exists():
                temp_file_path.unlink()
    
    except HTTPException:
        # Re-raise HTTPExceptions to let FastAPI handle them properly
        raise
    
    except InvalidPDFError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid or corrupted PDF file: {str(e)}"
        )
    
    except NoFormFieldsError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No AcroForm fields found in the PDF document: {str(e)}"
        )
    
    except PDFProcessingError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process PDF: {str(e)}"
        )
    
    except FileNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Temporary file processing error. Please try again."
        )
    
    except Exception as e:
        # Log the unexpected error for debugging
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Unexpected error in PDF analysis endpoint: {str(e)}", exc_info=True)
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while processing the PDF. Please try again."
        )


@router.get(
    "/{template_id}/fields/current",
    response_model=TemplateFieldListResponse,
    summary="Get Current Version Fields",
    description="""
    Retrieve all AcroForm fields from the current version of a template.
    
    **Features:**
    - Pagination support (default 20 items per page)
    - Search by field_id or near_text (case-insensitive)
    - Filter by page_number
    - Fields ordered by page_number, then field_page_order
    - Includes version metadata in response
    
    **Use Cases:**
    - Display template structure in UI
    - Field mapping and comparison
    - Form generation and validation
    """,
    tags=["Templates - Fields"]
)
def get_current_version_fields(
    template_id: int,
    limit: int = Query(20, ge=1, le=100, description="Results per page"),
    offset: int = Query(0, ge=0, description="Number of results to skip"),
    page_number: Optional[int] = Query(None, ge=1, description="Filter by page number"),
    search: Optional[str] = Query(None, description="Search in field_id or near_text"),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Get all fields from the current version of a template.
    
    Args:
        template_id: Unique template identifier
        limit: Maximum number of results (1-100)
        offset: Number of results to skip
        page_number: Optional page filter
        search: Optional search term
        current_user: Optional authenticated user
        db: Database session
        
    Returns:
        TemplateFieldListResponse: Paginated list of fields with version info
        
    Raises:
        HTTPException 404: If template or current version not found
    """
    # Check if template exists
    template = db.query(PDFTemplate).filter(PDFTemplate.id == template_id).first()
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    
    # Find current version
    current_version = db.query(TemplateVersion).filter(
        TemplateVersion.template_id == template_id,
        TemplateVersion.is_current == True
    ).first()
    
    if not current_version:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No current version found for this template"
        )
    
    # Build query for fields
    query = db.query(TemplateFieldModel).filter(
        TemplateFieldModel.version_id == current_version.id
    )
    
    # Apply page filter if provided
    if page_number is not None:
        query = query.filter(TemplateFieldModel.page_number == page_number)
    
    # Apply search filter if provided
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                TemplateFieldModel.field_id.ilike(search_term),
                TemplateFieldModel.near_text.ilike(search_term)
            )
        )
    
    # Order by page and field order
    query = query.order_by(
        asc(TemplateFieldModel.page_number),
        asc(TemplateFieldModel.field_page_order)
    )
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    fields = query.offset(offset).limit(limit).all()
    
    # Build version info
    version_info = VersionInfo(
        version_id=current_version.id,
        version_number=current_version.version_number,
        field_count=total
    )
    
    return TemplateFieldListResponse(
        items=[
            TemplateFieldResponse(
                id=field.id,
                version_id=field.version_id,
                field_id=field.field_id,
                field_type=field.field_type,
                raw_type=field.raw_type,
                page_number=field.page_number,
                field_page_order=field.field_page_order,
                near_text=field.near_text,
                value_options=field.value_options,
                position_data=field.position_data,
                created_at=field.created_at
            )
            for field in fields
        ],
        total=total,
        limit=limit,
        offset=offset,
        version_info=version_info
    )


@router.get(
    "/{template_id}/versions/{version_id}/fields",
    response_model=TemplateFieldListResponse,
    summary="Get Specific Version Fields",
    description="""
    Retrieve all AcroForm fields from a specific version of a template.
    
    **Features:**
    - Same features as current version endpoint
    - Useful for historical analysis and version comparison
    - Validates that version belongs to template
    
    **Use Cases:**
    - Compare field changes between versions
    - Historical analysis of template evolution
    - Audit trail and documentation
    """,
    tags=["Templates - Fields"]
)
def get_version_fields(
    template_id: int,
    version_id: int,
    limit: int = Query(20, ge=1, le=100, description="Results per page"),
    offset: int = Query(0, ge=0, description="Number of results to skip"),
    page_number: Optional[int] = Query(None, ge=1, description="Filter by page number"),
    search: Optional[str] = Query(None, description="Search in field_id or near_text"),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Get all fields from a specific version of a template.
    
    Args:
        template_id: Unique template identifier
        version_id: Unique version identifier
        limit: Maximum number of results (1-100)
        offset: Number of results to skip
        page_number: Optional page filter
        search: Optional search term
        current_user: Optional authenticated user
        db: Database session
        
    Returns:
        TemplateFieldListResponse: Paginated list of fields with version info
        
    Raises:
        HTTPException 404: If template or version not found
        HTTPException 400: If version doesn't belong to template
    """
    # Check if template exists
    template = db.query(PDFTemplate).filter(PDFTemplate.id == template_id).first()
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    
    # Find specific version
    version = db.query(TemplateVersion).filter(
        TemplateVersion.id == version_id
    ).first()
    
    if not version:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Version not found"
        )
    
    # Verify version belongs to template
    if version.template_id != template_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Version {version_id} does not belong to template {template_id}"
        )
    
    # Build query for fields
    query = db.query(TemplateFieldModel).filter(
        TemplateFieldModel.version_id == version_id
    )
    
    # Apply page filter if provided
    if page_number is not None:
        query = query.filter(TemplateFieldModel.page_number == page_number)
    
    # Apply search filter if provided
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                TemplateFieldModel.field_id.ilike(search_term),
                TemplateFieldModel.near_text.ilike(search_term)
            )
        )
    
    # Order by page and field order
    query = query.order_by(
        asc(TemplateFieldModel.page_number),
        asc(TemplateFieldModel.field_page_order)
    )
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    fields = query.offset(offset).limit(limit).all()
    
    # Build version info
    version_info = VersionInfo(
        version_id=version.id,
        version_number=version.version_number,
        field_count=total
    )
    
    return TemplateFieldListResponse(
        items=[
            TemplateFieldResponse(
                id=field.id,
                version_id=field.version_id,
                field_id=field.field_id,
                field_type=field.field_type,
                raw_type=field.raw_type,
                page_number=field.page_number,
                field_page_order=field.field_page_order,
                near_text=field.near_text,
                value_options=field.value_options,
                position_data=field.position_data,
                created_at=field.created_at
            )
            for field in fields
        ],
        total=total,
        limit=limit,
        offset=offset,
        version_info=version_info
    )
