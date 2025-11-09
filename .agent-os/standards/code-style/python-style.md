# Python Style Guide

## General Principles

### Code Quality Standards
- Follow PEP 8 Python style guide as the foundation
- Prioritize readability and maintainability over cleverness
- Use type hints for all function parameters and return values
- Write self-documenting code with clear variable and function names
- Maintain consistent code structure across the project

### Project-Specific Context
This style guide is tailored for the SEPE Templates Comparator application using FastAPI, SQLAlchemy, and PDF processing libraries.

## Naming Conventions

### Functions and Variables
- Use `snake_case` for functions, variables, and module names
- Use descriptive names that explain the purpose
- Avoid abbreviations unless they are widely understood

```python
# Good
def extract_pdf_fields(pdf_file_path: str) -> List[Dict[str, Any]]:
    template_metadata = get_template_metadata(pdf_file_path)
    return template_metadata

# Bad  
def extract_flds(pdf_fp: str) -> List[Dict]:
    tmpl_meta = get_tmpl_meta(pdf_fp)
    return tmpl_meta
```

### Classes and Types
- Use `PascalCase` for class names
- Use descriptive names that indicate the class purpose
- For SQLAlchemy models, use singular nouns

```python
# Good
class TemplateComparison:
    pass

class PDFTemplate(Base):
    __tablename__ = "pdf_templates"

# Bad
class template_comparison:
    pass

class PDFTemplates(Base):  # Should be singular
    pass
```

### Constants
- Use `UPPER_SNAKE_CASE` for constants
- Group related constants in dedicated modules

```python
# Good
MAX_FILE_SIZE_MB = 50
SUPPORTED_PDF_EXTENSIONS = ['.pdf']
SEPE_BASE_URL = "https://www.sepe.es"

# Configuration constants
class Config:
    DATABASE_URL = "postgresql://..."
    AZURE_STORAGE_CONNECTION_STRING = "..."
```

## Type Hints and Documentation

### Type Annotations
- Always use type hints for function parameters and return values
- Use `Optional` for nullable values
- Use specific types over generic ones when possible

```python
from typing import List, Dict, Optional, Union
from pathlib import Path

def compare_pdf_templates(
    template_a: Path,
    template_b: Path,
    comparison_options: Optional[Dict[str, bool]] = None
) -> Dict[str, Union[List[str], bool]]:
    """Compare two PDF templates and return differences.
    
    Args:
        template_a: Path to the first PDF template
        template_b: Path to the second PDF template  
        comparison_options: Optional configuration for comparison behavior
        
    Returns:
        Dictionary containing comparison results with field differences
        and metadata about the comparison process
        
    Raises:
        FileNotFoundError: If either template file doesn't exist
        PDFProcessingError: If PDF parsing fails
    """
    pass
```

### Docstring Standards
- Use Google-style docstrings for all public functions and classes
- Include Args, Returns, and Raises sections
- Provide clear examples for complex functions

```python
def extract_acroform_fields(pdf_path: Path) -> List[PDFField]:
    """Extract AcroForm fields from a PDF document.
    
    This function uses PyPDF2 to parse PDF forms and extract field
    information including names, types, and values.
    
    Args:
        pdf_path: Path to the PDF file to process
        
    Returns:
        List of PDFField objects containing field metadata
        
    Raises:
        PDFReadError: If the PDF cannot be read or parsed
        
    Example:
        >>> fields = extract_acroform_fields(Path("template.pdf"))
        >>> print(f"Found {len(fields)} fields")
        Found 25 fields
    """
    pass
```

## FastAPI Specific Standards

### Route Definitions
- Use clear, RESTful endpoint names
- Group related endpoints with tags
- Always include response models and status codes

```python
from fastapi import APIRouter, HTTPException, Depends
from typing import List

router = APIRouter(prefix="/api/v1/templates", tags=["templates"])

@router.post(
    "/",
    response_model=TemplateResponse,
    status_code=201,
    summary="Upload new PDF template"
)
async def create_template(
    template_file: UploadFile = File(...),
    metadata: TemplateMetadata = Depends(),
    db: Session = Depends(get_db)
) -> TemplateResponse:
    """Upload and process a new PDF template.
    
    This endpoint accepts a PDF file, extracts its structure,
    and stores it in the database for comparison purposes.
    """
    pass

@router.get(
    "/{template_id}/compare/{other_template_id}",
    response_model=ComparisonResponse,
    summary="Compare two templates"
)
async def compare_templates(
    template_id: int,
    other_template_id: int,
    db: Session = Depends(get_db)
) -> ComparisonResponse:
    """Compare two PDF templates and return differences."""
    pass
```

### Pydantic Models
- Use clear field names and validation
- Include examples in field definitions
- Separate request and response models

```python
from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime

class TemplateCreateRequest(BaseModel):
    """Request model for creating a new template."""
    
    name: str = Field(..., min_length=1, max_length=255, example="SEPE Form 2024-v1")
    description: Optional[str] = Field(None, max_length=1000)
    version: str = Field(..., example="1.0.0")
    sepe_url: Optional[str] = Field(None, example="https://www.sepe.es/...")
    
    @validator('name')
    def validate_name(cls, v):
        if not v.strip():
            raise ValueError('Template name cannot be empty')
        return v.strip()

class TemplateResponse(BaseModel):
    """Response model for template data."""
    
    id: int
    name: str
    version: str
    created_at: datetime
    field_count: int
    file_size_bytes: int
    
    class Config:
        orm_mode = True
```

## SQLAlchemy Models

### Model Structure
- Use singular table names
- Include created_at and updated_at timestamps
- Use meaningful foreign key names

```python
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

class PDFTemplate(Base):
    """SQLAlchemy model for PDF templates."""
    
    __tablename__ = "pdf_templates"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    version = Column(String(50), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size_bytes = Column(Integer, nullable=False)
    field_count = Column(Integer, default=0)
    sepe_url = Column(String(1000), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    comparisons_as_source = relationship(
        "TemplateComparison",
        foreign_keys="TemplateComparison.source_template_id",
        back_populates="source_template"
    )
    
    def __repr__(self) -> str:
        return f"<PDFTemplate(id={self.id}, name='{self.name}', version='{self.version}')>"
```

### Database Operations
- Use dependency injection for database sessions
- Handle transactions explicitly
- Include proper error handling

```python
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

def create_template(
    db: Session,
    template_data: TemplateCreateRequest,
    file_path: str
) -> PDFTemplate:
    """Create a new PDF template in the database.
    
    Args:
        db: Database session
        template_data: Validated template creation data
        file_path: Path where the uploaded file was stored
        
    Returns:
        Created PDFTemplate instance
        
    Raises:
        DatabaseError: If template creation fails
    """
    try:
        db_template = PDFTemplate(
            name=template_data.name,
            version=template_data.version,
            file_path=file_path,
            sepe_url=template_data.sepe_url
        )
        
        db.add(db_template)
        db.commit()
        db.refresh(db_template)
        
        return db_template
        
    except SQLAlchemyError as e:
        db.rollback()
        raise DatabaseError(f"Failed to create template: {str(e)}")
```

## Error Handling

### Exception Hierarchy
- Create custom exception classes for different error types
- Use specific exceptions rather than generic ones
- Include helpful error messages

```python
class SEPEComparatorError(Exception):
    """Base exception for SEPE Comparator application."""
    pass

class PDFProcessingError(SEPEComparatorError):
    """Raised when PDF processing fails."""
    pass

class TemplateNotFoundError(SEPEComparatorError):
    """Raised when a template cannot be found."""
    pass

class ComparisonError(SEPEComparatorError):
    """Raised when template comparison fails."""
    pass

# Usage
def process_pdf_template(pdf_path: Path) -> Dict[str, Any]:
    try:
        # PDF processing logic
        pass
    except FileNotFoundError:
        raise TemplateNotFoundError(f"Template file not found: {pdf_path}")
    except Exception as e:
        raise PDFProcessingError(f"Failed to process PDF: {str(e)}")
```

### FastAPI Error Handlers
- Create custom exception handlers for consistent error responses
- Return meaningful error messages to clients

```python
from fastapi import HTTPException

@app.exception_handler(TemplateNotFoundError)
async def template_not_found_handler(request: Request, exc: TemplateNotFoundError):
    return JSONResponse(
        status_code=404,
        content={
            "error": "template_not_found",
            "message": str(exc),
            "timestamp": datetime.utcnow().isoformat()
        }
    )
```

## File and Path Handling

### Path Management
- Use `pathlib.Path` for all file operations
- Validate file paths and extensions
- Handle file operations safely

```python
from pathlib import Path
from typing import List

ALLOWED_EXTENSIONS = {'.pdf'}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB

def validate_pdf_file(file_path: Path) -> bool:
    """Validate that a file is a valid PDF for processing.
    
    Args:
        file_path: Path to the file to validate
        
    Returns:
        True if file is valid, False otherwise
        
    Raises:
        FileNotFoundError: If file doesn't exist
        ValidationError: If file fails validation
    """
    if not file_path.exists():
        raise FileNotFoundError(f"File not found: {file_path}")
    
    if file_path.suffix.lower() not in ALLOWED_EXTENSIONS:
        raise ValidationError(f"Invalid file extension: {file_path.suffix}")
    
    if file_path.stat().st_size > MAX_FILE_SIZE:
        raise ValidationError(f"File too large: {file_path.stat().st_size} bytes")
    
    return True
```

## Testing Standards

### Test Structure
- Use pytest for all testing
- Follow AAA pattern (Arrange, Act, Assert)
- Use descriptive test names

```python
import pytest
from pathlib import Path
from unittest.mock import Mock, patch

class TestPDFProcessing:
    """Test cases for PDF processing functionality."""
    
    def test_extract_acroform_fields_success(self, sample_pdf_path):
        """Test successful extraction of AcroForm fields from valid PDF."""
        # Arrange
        expected_field_count = 10
        
        # Act
        fields = extract_acroform_fields(sample_pdf_path)
        
        # Assert
        assert len(fields) == expected_field_count
        assert all(isinstance(field, PDFField) for field in fields)
    
    def test_extract_acroform_fields_invalid_file(self):
        """Test extraction fails gracefully with invalid PDF file."""
        # Arrange
        invalid_path = Path("nonexistent.pdf")
        
        # Act & Assert
        with pytest.raises(TemplateNotFoundError):
            extract_acroform_fields(invalid_path)
    
    @patch('app.services.pdf_service.PyPDF2.PdfReader')
    def test_extract_acroform_fields_processing_error(self, mock_reader):
        """Test handling of PDF processing errors."""
        # Arrange
        mock_reader.side_effect = Exception("PDF parsing failed")
        sample_path = Path("sample.pdf")
        
        # Act & Assert
        with pytest.raises(PDFProcessingError):
            extract_acroform_fields(sample_path)
```

## Logging Standards

### Logging Configuration
- Use structured logging with consistent format
- Include contextual information in log messages
- Use appropriate log levels

```python
import logging
from typing import Any, Dict

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

def compare_templates_with_logging(
    template_a_id: int,
    template_b_id: int
) -> Dict[str, Any]:
    """Compare templates with comprehensive logging."""
    
    logger.info(
        f"Starting template comparison",
        extra={
            "template_a_id": template_a_id,
            "template_b_id": template_b_id,
            "operation": "template_comparison"
        }
    )
    
    try:
        # Comparison logic
        result = perform_comparison(template_a_id, template_b_id)
        
        logger.info(
            f"Template comparison completed successfully",
            extra={
                "template_a_id": template_a_id,
                "template_b_id": template_b_id,
                "differences_found": len(result.get("differences", [])),
                "operation": "template_comparison"
            }
        )
        
        return result
        
    except Exception as e:
        logger.error(
            f"Template comparison failed: {str(e)}",
            extra={
                "template_a_id": template_a_id,
                "template_b_id": template_b_id,
                "error": str(e),
                "operation": "template_comparison"
            },
            exc_info=True
        )
        raise
```

## Code Organization

### Module Structure
- Organize code into logical modules
- Use clear import statements
- Avoid circular imports

```python
# Directory structure
app/
├── __init__.py
├── main.py                 # FastAPI application setup
├── config.py              # Configuration management
├── models/                 # SQLAlchemy models
│   ├── __init__.py
│   ├── template.py
│   └── comparison.py
├── schemas/               # Pydantic schemas
│   ├── __init__.py
│   ├── template.py
│   └── comparison.py
├── services/              # Business logic
│   ├── __init__.py
│   ├── pdf_service.py
│   ├── comparison_service.py
│   └── scraping_service.py
├── api/                   # API routes
│   ├── __init__.py
│   ├── dependencies.py
│   └── v1/
│       ├── __init__.py
│       ├── templates.py
│       └── comparisons.py
└── utils/                 # Utility functions
    ├── __init__.py
    ├── file_utils.py
    └── validation.py
```

### Import Organization
- Group imports logically
- Use absolute imports
- Avoid wildcard imports

```python
# Standard library imports
import logging
from pathlib import Path
from typing import List, Dict, Optional

# Third-party imports
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import PyPDF2

# Local application imports
from app.models.template import PDFTemplate
from app.schemas.template import TemplateResponse
from app.services.pdf_service import extract_acroform_fields
from app.utils.validation import validate_pdf_file
```
