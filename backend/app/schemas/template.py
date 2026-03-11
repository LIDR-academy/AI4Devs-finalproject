"""
Template-related Pydantic schemas.
"""

from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, field_validator, HttpUrl


class TemplateBase(BaseModel):
    """Base template schema with refactored structure."""

    name: str = Field(..., max_length=255)
    current_version: str = Field(..., max_length=50)
    comment: Optional[str] = Field(
        None, description="Optional comment about the template"
    )


class TemplateCreate(TemplateBase):
    """Schema for template creation."""

    pass


class TemplateUpdate(BaseModel):
    """Schema for template update."""

    name: Optional[str] = Field(None, max_length=255)
    current_version: Optional[str] = Field(None, max_length=50)
    comment: Optional[str] = Field(
        None, description="Optional comment about the template"
    )


class TemplateResponse(TemplateBase):
    """
    Schema for template response.

    Note: file_path, file_size_bytes, field_count, and sepe_url are now
    fetched from the current version relationship, not directly from the template.
    """

    id: int
    uploaded_by: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    # These fields come from the current version relationship
    file_path: Optional[str] = Field(None, description="From current version")
    file_size_bytes: Optional[int] = Field(None, description="From current version")
    field_count: Optional[int] = Field(None, description="From current version")
    sepe_url: Optional[str] = Field(None, description="From current version")

    class Config:
        from_attributes = True


class TemplateListResponse(BaseModel):
    """Schema for template list response."""

    items: List[TemplateResponse]
    total: int
    limit: int
    offset: int


class TemplateVersionResponse(BaseModel):
    """
    Schema for template version response with full metadata.

    Includes file information (file_path, file_size_bytes, field_count, sepe_url)
    as these are now stored at the version level for atomicity.
    """

    id: int
    template_id: int
    version_number: str
    change_summary: Optional[str] = None
    is_current: bool
    created_at: datetime

    # File Information (version-specific)
    file_path: str
    file_size_bytes: int
    field_count: int
    sepe_url: Optional[str] = None

    # PDF Document Metadata
    title: Optional[str] = None
    author: Optional[str] = None
    subject: Optional[str] = None
    creation_date: Optional[datetime] = None
    modification_date: Optional[datetime] = None
    page_count: int

    class Config:
        from_attributes = True


class TemplateVersionListResponse(BaseModel):
    """Schema for paginated template version list response."""

    items: List[TemplateVersionResponse]
    total: int
    limit: int
    offset: int


class TemplateFieldResponse(BaseModel):
    """Schema for template field response."""

    id: int
    version_id: int
    field_id: str
    field_type: str
    raw_type: Optional[str] = None
    page_number: int
    field_page_order: int
    near_text: Optional[str] = None
    value_options: Optional[List[str]] = None
    position_data: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True


class VersionInfo(BaseModel):
    """Schema for version metadata included in fields response."""

    version_id: int
    version_number: str
    field_count: int


class TemplateFieldListResponse(BaseModel):
    """Schema for paginated template field list response."""

    items: List[TemplateFieldResponse]
    total: int
    limit: int
    offset: int
    version_info: VersionInfo


class TemplateUploadResponse(BaseModel):
    """
    Schema for template upload response.

    Returns template information along with current version data.
    """

    id: int
    name: str
    current_version: str
    comment: Optional[str] = None
    file_path: str  # From current version
    file_size_bytes: int  # From current version
    field_count: int  # From current version
    sepe_url: Optional[str] = None  # From current version
    message: str = "Template uploaded successfully"


# Template Ingestion Schemas


class TemplateIngestRequest(BaseModel):
    """Schema for template ingestion request."""

    name: str = Field(..., min_length=1, max_length=255, description="Template name")
    version: str = Field(
        ...,
        min_length=1,
        max_length=50,
        description="Version identifier (will be set as current_version)",
    )
    sepe_url: Optional[HttpUrl] = Field(
        None, description="SEPE source URL (stored in template version)"
    )
    comment: Optional[str] = Field(
        None, description="Optional comment about the template"
    )

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        """Validate name is not empty after stripping."""
        if not v or not v.strip():
            raise ValueError("Template name cannot be empty")
        return v.strip()

    @field_validator("version")
    @classmethod
    def validate_version(cls, v: str) -> str:
        """Validate version is not empty after stripping."""
        if not v or not v.strip():
            raise ValueError("Template version cannot be empty")
        return v.strip()


class TemplateIngestResponse(BaseModel):
    """
    Schema for template ingestion response.

    Returns template information with current version data.
    Includes version_id to allow direct navigation to success page.
    """

    id: int
    name: str
    current_version: str
    comment: Optional[str] = None
    file_path: str  # From current version
    file_size_bytes: int = Field(
        ..., gt=0, description="File size in bytes (from version)"
    )
    field_count: int = Field(
        ..., ge=0, description="Number of fields extracted (from version)"
    )
    sepe_url: Optional[str] = None  # From current version
    checksum: str = Field(..., description="SHA256 checksum of file")
    message: str = "Template ingested successfully"
    version_id: int = Field(
        ..., description="ID of the created version for navigation to success page"
    )


class TemplateFieldData(BaseModel):
    """Schema for template field data matching database structure."""

    field_id: str = Field(..., max_length=255, description="Field identifier")
    field_type: str = Field(..., max_length=50, description="Field type")
    raw_type: Optional[str] = Field(
        None, max_length=50, description="Raw PDF field type"
    )
    page_number: int = Field(..., ge=1, description="Page number (1-indexed)")
    field_page_order: int = Field(
        ..., ge=0, description="Order within page (0-indexed)"
    )
    near_text: Optional[str] = Field(None, description="Nearby text label")
    value_options: Optional[List[str]] = Field(
        None, description="Available options for selection fields"
    )
    position_data: Optional[Dict[str, Any]] = Field(
        None, description="Field position coordinates"
    )


# Version Detail Response (for success pages)


class TemplateBasicInfo(BaseModel):
    """
    Basic template information for version detail response.
    
    Used when we need to include template context in version responses,
    such as success pages after template creation.
    """

    id: int
    name: str
    current_version: str
    comment: Optional[str] = None
    uploaded_by: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


class TemplateVersionDetailResponse(BaseModel):
    """
    Detailed template version response with associated template info.

    Used for success pages and version detail views where we need
    both version and template information in one response.
    
    This combines TemplateVersion data with basic template information
    to minimize API calls from the frontend.
    """

    # Version information
    id: int
    version_number: str
    change_summary: Optional[str] = None
    is_current: bool
    created_at: datetime

    # File information (version-specific)
    file_path: str
    file_size_bytes: int
    field_count: int
    sepe_url: Optional[str] = None

    # PDF metadata
    title: Optional[str] = None
    author: Optional[str] = None
    subject: Optional[str] = None
    creation_date: Optional[datetime] = None
    modification_date: Optional[datetime] = None
    page_count: int

    # Associated template
    template: TemplateBasicInfo

    class Config:
        from_attributes = True


# Template Names Schemas (for version ingestion modal)


class TemplateNameItem(BaseModel):
    """
    Lightweight template item for selectors/dropdowns.
    
    Used in version upload modal to select existing templates.
    """
    
    id: int
    name: str
    current_version: str
    
    class Config:
        from_attributes = True


class TemplateNamesResponse(BaseModel):
    """
    Response schema for template names endpoint.
    
    Returns minimal template data for efficient dropdown/selector population.
    """
    
    items: List[TemplateNameItem]
    total: int


# Version Ingestion Schemas


class TemplateVersionIngestRequest(BaseModel):
    """
    Schema for version ingestion request.
    
    Used when uploading a new version of an existing template.
    """
    
    template_id: int = Field(..., gt=0, description="Existing template ID")
    version: str = Field(
        ...,
        min_length=1,
        max_length=50,
        description="Version identifier"
    )
    change_summary: Optional[str] = Field(
        None,
        description="Description of changes in this version"
    )
    sepe_url: Optional[HttpUrl] = Field(
        None,
        description="SEPE source URL"
    )
    
    @field_validator("version")
    @classmethod
    def validate_version(cls, v: str) -> str:
        """Validate version is not empty after stripping."""
        if not v or not v.strip():
            raise ValueError("Version cannot be empty")
        return v.strip()


class TemplateVersionIngestResponse(BaseModel):
    """
    Schema for version ingestion response.
    
    Returns the created version details for navigation to success page.
    """
    
    template_id: int
    version_id: int = Field(
        ..., description="New version ID for navigation"
    )
    version_number: str
    change_summary: Optional[str] = None
    file_path: str
    file_size_bytes: int
    field_count: int
    is_current: bool = True
    message: str = "Version ingested successfully"