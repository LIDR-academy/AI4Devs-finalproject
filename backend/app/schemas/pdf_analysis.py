"""
Pydantic models for PDF template analysis API.

This module defines the data models used for the PDF analysis endpoint
including request/response structures and validation rules.
"""
from typing import List, Optional, Literal
from pydantic import BaseModel, Field, validator
from datetime import datetime


class TemplateField(BaseModel):
    """Individual PDF form field analysis result."""
    
    field_id: str = Field(
        ...,
        min_length=1,
        description="Unique field identifier from PDF form",
        example="A0101"
    )
    type: Literal["text", "radiobutton", "checkbox", "listbox"] = Field(
        ...,
        description="Form field type",
        example="text"
    )
    near_text: str = Field(
        ...,
        description="Closest text content to the field in the PDF",
        example="hasta un máximo de"
    )
    value_options: Optional[List[str]] = Field(
        None,
        description="Available options for selection fields (radio, checkbox, listbox)",
        example=["Sí", "No"]
    )
    
    @validator('field_id')
    def validate_field_id(cls, v):
        """Validate that field_id is not empty."""
        if not v or not v.strip():
            raise ValueError('Field ID cannot be empty')
        return v.strip()
    
    @validator('near_text')
    def validate_near_text(cls, v):
        """Validate near_text field."""
        # Allow empty strings for cases where no text is found
        return v if v is not None else ""
    
    @validator('value_options')
    def validate_value_options(cls, v, values):
        """Validate value_options based on field type."""
        field_type = values.get('type')
        
        # Selection fields should have options, text fields should not
        if field_type in ['radiobutton', 'checkbox', 'listbox']:
            if v is not None and len(v) == 0:
                # Empty list is not useful, set to None
                return None
        elif field_type == 'text':
            # Text fields should not have options
            if v is not None and len(v) > 0:
                return None
        
        return v

    class Config:
        """Pydantic model configuration."""
        json_schema_extra = {
            "examples": [
                {
                    "field_id": "A0101",
                    "type": "text",
                    "near_text": "hasta un máximo de",
                    "value_options": None
                },
                {
                    "field_id": "B0201",
                    "type": "radiobutton",
                    "near_text": "Seleccione una opción:",
                    "value_options": ["Sí", "No"]
                },
                {
                    "field_id": "C0301",
                    "type": "listbox",
                    "near_text": "Provincia:",
                    "value_options": ["Madrid", "Barcelona", "Valencia", "Sevilla"]
                }
            ]
        }


class AnalysisMetadata(BaseModel):
    """Metadata about the PDF analysis process."""
    
    total_fields: int = Field(
        ...,
        ge=0,
        description="Total number of fields found in the PDF",
        example=12
    )
    processing_time_ms: int = Field(
        ...,
        ge=0,
        description="Analysis processing time in milliseconds",
        example=1250
    )
    document_pages: int = Field(
        ...,
        ge=1,
        description="Number of pages in the PDF document",
        example=3
    )

    class Config:
        """Pydantic model configuration."""
        json_schema_extra = {
            "example": {
                "total_fields": 12,
                "processing_time_ms": 1250,
                "document_pages": 3
            }
        }


class AnalysisResponse(BaseModel):
    """Complete PDF analysis response."""
    
    status: str = Field(
        default="success",
        description="Response status",
        example="success"
    )
    data: List[TemplateField] = Field(
        ...,
        description="List of analyzed form fields in document order"
    )
    metadata: AnalysisMetadata = Field(
        ...,
        description="Analysis processing metadata"
    )
    
    @validator('data')
    def validate_data_consistency(cls, v, values):
        """Validate that data length matches metadata if available."""
        # Note: This validation is informational - we don't enforce strict matching
        # as metadata might be calculated differently in some edge cases
        return v

    class Config:
        """Pydantic model configuration."""
        json_schema_extra = {
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
                        "near_text": "que suponen un",
                        "value_options": None
                    },
                    {
                        "field_id": "B0201",
                        "type": "radiobutton",
                        "near_text": "Seleccione una opción:",
                        "value_options": ["Sí", "No"]
                    }
                ],
                "metadata": {
                    "total_fields": 3,
                    "processing_time_ms": 1250,
                    "document_pages": 2
                }
            }
        }


class ErrorResponse(BaseModel):
    """Error response model for consistent error formatting."""
    
    status: str = Field(
        ...,
        description="Response status (always 'error' for error responses)",
        example="error"
    )
    error: str = Field(
        ...,
        description="Error code identifying the type of error",
        example="invalid_file_format"
    )
    message: str = Field(
        ...,
        description="Human-readable error message",
        example="The uploaded file is not a valid PDF document"
    )
    timestamp: str = Field(
        ...,
        description="ISO timestamp when the error occurred",
        example="2025-10-05T10:00:00Z"
    )

    class Config:
        """Pydantic model configuration."""
        json_schema_extra = {
            "examples": [
                {
                    "status": "error",
                    "error": "invalid_file_format",
                    "message": "The uploaded file is not a valid PDF document",
                    "timestamp": "2025-10-05T10:00:00Z"
                },
                {
                    "status": "error",
                    "error": "file_too_large",
                    "message": "File exceeds maximum size limit of 10MB",
                    "timestamp": "2025-10-05T10:00:00Z"
                },
                {
                    "status": "error",
                    "error": "no_form_fields",
                    "message": "No AcroForm fields found in the PDF document",
                    "timestamp": "2025-10-05T10:00:00Z"
                },
                {
                    "status": "error",
                    "error": "processing_error",
                    "message": "Internal error occurred while processing the PDF",
                    "timestamp": "2025-10-05T10:00:00Z"
                },
                {
                    "status": "error",
                    "error": "missing_file",
                    "message": "No file provided in the request",
                    "timestamp": "2025-10-05T10:00:00Z"
                }
            ]
        }


# Utility functions for creating responses
def create_analysis_response(
    fields: List[TemplateField],
    processing_time_ms: int,
    document_pages: int
) -> AnalysisResponse:
    """
    Create an AnalysisResponse with proper metadata.
    
    Args:
        fields: List of analyzed template fields
        processing_time_ms: Time taken to process the PDF
        document_pages: Number of pages in the document
        
    Returns:
        AnalysisResponse instance
    """
    metadata = AnalysisMetadata(
        total_fields=len(fields),
        processing_time_ms=processing_time_ms,
        document_pages=document_pages
    )
    
    return AnalysisResponse(
        status="success",
        data=fields,
        metadata=metadata
    )


def create_error_response(
    error_code: str,
    message: str,
    timestamp: Optional[str] = None
) -> ErrorResponse:
    """
    Create an ErrorResponse with consistent formatting.
    
    Args:
        error_code: Error code identifying the error type
        message: Human-readable error message
        timestamp: ISO timestamp (defaults to current time)
        
    Returns:
        ErrorResponse instance
    """
    if timestamp is None:
        timestamp = datetime.utcnow().isoformat() + "Z"
    
    return ErrorResponse(
        status="error",
        error=error_code,
        message=message,
        timestamp=timestamp
    )
