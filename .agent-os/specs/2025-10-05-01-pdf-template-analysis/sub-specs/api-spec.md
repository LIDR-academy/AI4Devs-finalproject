# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-10-05-pdf-template-analysis/spec.md

## API Endpoint

### POST /api/v1/templates/analyze

**Purpose:** Analyze uploaded PDF template and extract AcroForm field structure in document order
**Authentication:** None (open endpoint)
**Parameters:**

- `file` (UploadFile, required): PDF file to analyze
  **Content-Type:** `multipart/form-data`
  **Response:**

```json
{
  "status": "success",
  "data": [
    {
      "field_id": "A0101",
      "type": "text",
      "near_text": "hasta un máximo de",
      "value_options": null
    },
    {
      "field_id": "A0102",
      "type": "text",
      "near_text": "que suponen un",
      "value_options": null
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
  ],
  "metadata": {
    "total_fields": 4,
    "processing_time_ms": 1250,
    "document_pages": 3
  }
}
```

**Errors:**

- 400: Invalid file format or corrupted PDF
- 413: File too large (exceeds 50MB limit)
- 422: File validation error or missing file
- 500: PDF processing error

## Response Models

### TemplateField Model

```python
class TemplateField(BaseModel):
    """Individual PDF form field analysis result."""

    field_id: str = Field(
        ...,
        description="Unique field identifier from PDF form",
        example="A0101"
    )
    tipo: str = Field(
        ...,
        description="Form field type",
        example="text"
    )
    near_text: str = Field(
        ...,
        description="Closest text content to the field in the PDF",
        example="hasta un máximo de"
    )
    opciones_valores: Optional[List[str]] = Field(
        None,
        description="Available options for selection fields (radio, checkbox, listbox)",
        example=["Sí", "No"]
    )
```

### AnalysisResponse Model

```python
class AnalysisResponse(BaseModel):
    """Complete PDF analysis response."""

    status: str = Field(default="success", example="success")
    data: List[TemplateField] = Field(
        ...,
        description="List of analyzed form fields in document order"
    )
    metadata: AnalysisMetadata = Field(
        ...,
        description="Analysis processing metadata"
    )

class AnalysisMetadata(BaseModel):
    """Metadata about the analysis process."""

    total_fields: int = Field(..., description="Total number of fields found")
    processing_time_ms: int = Field(..., description="Analysis processing time in milliseconds")
    document_pages: int = Field(..., description="Number of pages in the PDF document")
```

## Field Type Support

### Supported Field Types

- **text** - Single-line and multi-line text input fields
- **radiobutton** - Radio button groups with mutually exclusive options
- **checkbox** - Individual checkboxes and checkbox groups
- **listbox** - Dropdown lists and combo boxes with predefined options

### Field Ordering

Fields are returned in the order they appear in the PDF document, determined by:

1. Page number (ascending)
2. Vertical position on page (top to bottom)
3. Horizontal position on page (left to right)

### Text Proximity Algorithm

The `near_text` field contains the closest text element to each form field (on the left side), determined by:

1. Calculate distance from field center to all text elements
2. Select text element with minimum Euclidean distance
3. Return the complete text content of the nearest element
4. Handle edge cases where no text is found within reasonable proximity

## Error Handling

### Error Response Format

```json
{
  "status": "error",
  "error": "invalid_file_format",
  "message": "The uploaded file is not a valid PDF document",
  "timestamp": "2025-10-05T10:00:00Z"
}
```

### Error Codes

- `invalid_file_format` - File is not a PDF or is corrupted
- `file_too_large` - File exceeds maximum size limit
- `no_form_fields` - PDF contains no AcroForm fields
- `processing_error` - Internal error during PDF analysis
- `missing_file` - No file provided in request
