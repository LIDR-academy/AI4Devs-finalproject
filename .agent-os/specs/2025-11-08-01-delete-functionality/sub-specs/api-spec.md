# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-11-08-01-delete-functionality/spec.md

## Overview

This specification defines three DELETE endpoints for removing Templates, Template Versions, and Comparisons. All endpoints require JWT authentication and implement proper authorization checks.

## Endpoints

### DELETE /api/v1/comparisons/{comparison_id}

**Purpose:** Delete a comparison and all its associated field-level differences.

**Authentication:** Required (JWT Bearer token)

**Authorization:** User must be the creator of the comparison (`created_by` matches authenticated user ID)

**Path Parameters:**

- `comparison_id` (integer, required): The ID of the comparison to delete

**Request Headers:**

```http
Authorization: Bearer {jwt_token}
```

**Success Response:**

- **Status Code:** 204 No Content
- **Body:** Empty

**Error Responses:**

**401 Unauthorized:**

```json
{
  "detail": "Not authenticated"
}
```

**403 Forbidden:**

```json
{
  "detail": "Not authorized to delete this comparison"
}
```

**404 Not Found:**

```json
{
  "detail": "Comparison not found"
}
```

**500 Internal Server Error:**

```json
{
  "detail": "Failed to delete comparison"
}
```

**Business Logic:**

1. Verify comparison exists in database
2. Verify authenticated user is the creator (`comparison.created_by == current_user.id`)
3. Delete comparison record (CASCADE handles comparison_fields deletion)
4. Log activity: `COMPARISON_DELETED` with description including template names and versions
5. Return 204 No Content

**Side Effects:**

- All associated `comparison_fields` records are automatically deleted via CASCADE
- Activity log entry is created with type `COMPARISON_DELETED`

**Example Request:**

```bash
curl -X DELETE \
  http://localhost:8000/api/v1/comparisons/42 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### DELETE /api/v1/templates/{template_id}/versions/{version_id}

**Purpose:** Delete a specific version of a template, with validation to prevent deletion of the current version.

**Authentication:** Required (JWT Bearer token)

**Authorization:** User must be the uploader of the template (`uploaded_by` matches authenticated user ID)

**Path Parameters:**

- `template_id` (integer, required): The ID of the template
- `version_id` (integer, required): The ID of the version to delete

**Request Headers:**

```http
Authorization: Bearer {jwt_token}
```

**Success Response:**

- **Status Code:** 204 No Content
- **Body:** Empty

**Error Responses:**

**400 Bad Request (Current Version):**

```json
{
  "detail": "Cannot delete current version. Please delete the entire template instead."
}
```

**401 Unauthorized:**

```json
{
  "detail": "Not authenticated"
}
```

**403 Forbidden:**

```json
{
  "detail": "Not authorized to delete this template version"
}
```

**404 Not Found (Template):**

```json
{
  "detail": "Template not found"
}
```

**404 Not Found (Version):**

```json
{
  "detail": "Version not found or does not belong to this template"
}
```

**500 Internal Server Error:**

```json
{
  "detail": "Failed to delete template version"
}
```

**Business Logic:**

1. Verify template exists in database
2. Verify version exists and belongs to the specified template
3. Verify authenticated user is the uploader (`template.uploaded_by == current_user.id`)
4. **CRITICAL VALIDATION:** Check if `version.is_current == True`
   - If True: Return 400 Bad Request with specific error message
   - If False: Proceed with deletion
5. Store `version.file_path` before deletion
6. Delete version record (CASCADE handles template_fields and comparisons)
7. Attempt to delete physical PDF file from file system
   - If file doesn't exist: Log warning but continue (don't fail)
   - If file deletion fails: Log error but continue (don't fail)
8. Log activity: `VERSION_DELETED` with description including template name and version number
9. Return 204 No Content

**Side Effects:**

- All associated `template_fields` records are automatically deleted via CASCADE
- All `comparisons` where this version is source or target are automatically deleted via CASCADE
- All `comparison_fields` related to affected comparisons are automatically deleted via CASCADE
- Physical PDF file is removed from the file system
- Activity log entry is created with type `VERSION_DELETED`

**Example Request:**

```bash
curl -X DELETE \
  http://localhost:8000/api/v1/templates/10/versions/23 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Example Use Case:**

```
Scenario: Template "Form 036" has 3 versions: v1, v2, v3 (current)
- DELETE versions/1 → Success (old version)
- DELETE versions/2 → Success (old version)
- DELETE versions/3 → Error 400 (current version - must delete entire template)
```

---

### DELETE /api/v1/templates/{template_id}

**Purpose:** Delete an entire template including all versions, fields, comparisons, and physical PDF files.

**Authentication:** Required (JWT Bearer token)

**Authorization:** User must be the uploader of the template (`uploaded_by` matches authenticated user ID)

**Path Parameters:**

- `template_id` (integer, required): The ID of the template to delete

**Request Headers:**

```http
Authorization: Bearer {jwt_token}
```

**Success Response:**

- **Status Code:** 204 No Content
- **Body:** Empty

**Error Responses:**

**401 Unauthorized:**

```json
{
  "detail": "Not authenticated"
}
```

**403 Forbidden:**

```json
{
  "detail": "Not authorized to delete this template"
}
```

**404 Not Found:**

```json
{
  "detail": "Template not found"
}
```

**500 Internal Server Error:**

```json
{
  "detail": "Failed to delete template"
}
```

**Business Logic:**

1. Verify template exists in database
2. Verify authenticated user is the uploader (`template.uploaded_by == current_user.id`)
3. Collect all file paths from `template.versions` before deletion
4. Delete template record (CASCADE handles all related data)
5. Attempt to delete all physical PDF files from file system
   - Iterate through collected file paths
   - If file doesn't exist: Log warning but continue
   - If file deletion fails: Log error but continue
6. Log activity: `TEMPLATE_DELETED` with description including template name
7. Return 204 No Content

**Side Effects:**

- All associated `template_versions` records are automatically deleted via CASCADE
- All `template_fields` records are automatically deleted via CASCADE (through versions)
- All `comparisons` where any version of this template is source or target are automatically deleted via CASCADE
- All `comparison_fields` related to affected comparisons are automatically deleted via CASCADE
- All physical PDF files for all versions are removed from the file system
- Activity log entry is created with type `TEMPLATE_DELETED`

**Example Request:**

```bash
curl -X DELETE \
  http://localhost:8000/api/v1/templates/10 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Example Use Case:**

```
Scenario: Deleting template "Form 036" with 3 versions
- Deletes: 1 pdf_templates record
- CASCADE deletes: 3 template_versions records
- CASCADE deletes: 45 template_fields records (across all versions)
- CASCADE deletes: 8 comparisons records (involving any version)
- CASCADE deletes: 120 comparison_fields records (from 8 comparisons)
- File system: Removes 3 PDF files
```

---

## Common Response Headers

All successful DELETE operations (204 No Content) include:

```http
Content-Length: 0
Date: {timestamp}
Server: uvicorn
```

All error responses include:

```http
Content-Type: application/json
Date: {timestamp}
Server: uvicorn
```

## Authentication

All endpoints use JWT Bearer token authentication:

**Header Format:**

```http
Authorization: Bearer {access_token}
```

**Token Validation:**

- Token must be valid (not expired, correct signature)
- Token must contain user information (user_id, email)
- User must exist in database and be active

**Obtaining a Token:**

```bash
# Login to get access token
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# Response includes access_token
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

## Authorization Logic

### Ownership Verification

**For Templates and Versions:**

```python
# User must be the uploader
if template.uploaded_by != current_user.id:
    raise HTTPException(
        status_code=403,
        detail="Not authorized to delete this template"
    )
```

**For Comparisons:**

```python
# User must be the creator
if comparison.created_by != current_user.id:
    raise HTTPException(
        status_code=403,
        detail="Not authorized to delete this comparison"
    )
```

**Future Enhancement:** Add admin role that can delete any resource

## File System Operations

### File Path Resolution

**Templates stored in:** `./uploads/` (relative to backend root)

**File naming pattern:** Various patterns may exist:

- `{template_id}_{version_number}_{timestamp}.pdf`
- `{template_name}_{version_number}.pdf`
- Direct file paths stored in `template_versions.file_path`

**File Deletion Logic:**

```python
import os
from pathlib import Path

def delete_pdf_file(file_path: str) -> None:
    """
    Safely delete a PDF file from the file system.
    Logs warnings/errors but doesn't raise exceptions.
    """
    try:
        full_path = Path(file_path)
        if full_path.exists():
            full_path.unlink()
            logger.info(f"Deleted file: {file_path}")
        else:
            logger.warning(f"File not found: {file_path}")
    except Exception as e:
        logger.error(f"Failed to delete file {file_path}: {str(e)}")
```

## Activity Logging Integration

### Activity Types

**Enum Values (add to `ActivityType`):**

```python
class ActivityType(str, Enum):
    # ... existing types ...
    TEMPLATE_DELETED = "TEMPLATE_DELETED"
    VERSION_DELETED = "VERSION_DELETED"
    COMPARISON_DELETED = "COMPARISON_DELETED"
```

### Activity Descriptions

**Template Deleted:**

```python
description = f"Template deleted: {template.name} by {current_user.email}"
entity_id = str(template.id)
```

**Version Deleted:**

```python
description = f"Version deleted: {template.name} {version.version_number} by {current_user.email}"
entity_id = str(version.id)
```

**Comparison Deleted:**

```python
# Get template names and version numbers from related versions
source_template_name = comparison.source_version.template.name
source_version = comparison.source_version.version_number
target_template_name = comparison.target_version.template.name
target_version = comparison.target_version.version_number

description = (
    f"Comparison deleted: {source_template_name} {source_version} "
    f"vs {target_template_name} {target_version} by {current_user.email}"
)
entity_id = str(comparison.id)
```

### Activity Logging Call

```python
from app.services.activity_service import ActivityService
from app.schemas.activity import ActivityType

activity_service = ActivityService()
activity_service.log_activity(
    db=db,
    user_id=current_user.id,
    activity_type=ActivityType.TEMPLATE_DELETED,
    description=description,
    entity_id=entity_id
)
```

## Database Transaction Handling

All delete operations should be wrapped in database transactions:

```python
try:
    # Collect file paths before deletion
    file_paths = [v.file_path for v in template.versions]

    # Delete from database (CASCADE handles related records)
    db.delete(template)
    db.commit()

    # Delete physical files (after successful DB commit)
    for file_path in file_paths:
        delete_pdf_file(file_path)

    # Log activity
    activity_service.log_activity(...)

except Exception as e:
    db.rollback()
    logger.error(f"Failed to delete template: {str(e)}")
    raise HTTPException(status_code=500, detail="Failed to delete template")
```

## Rate Limiting and Performance

**Considerations:**

- Delete operations are not expensive (single record deletion)
- CASCADE is handled efficiently by PostgreSQL at database level
- File system operations are fast (local disk I/O)
- No rate limiting required for DELETE endpoints
- Expected response time: < 500ms for single template deletion

**Future Enhancement:** If bulk deletion is added, implement rate limiting

## API Documentation (OpenAPI/Swagger)

All endpoints should include comprehensive OpenAPI documentation:

```python
@router.delete(
    "/comparisons/{comparison_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a comparison",
    description="Delete a comparison and all its associated field-level differences. "
                "User must be the creator of the comparison.",
    responses={
        204: {"description": "Comparison successfully deleted"},
        401: {"description": "Not authenticated"},
        403: {"description": "Not authorized to delete this comparison"},
        404: {"description": "Comparison not found"},
        500: {"description": "Failed to delete comparison"}
    },
    tags=["Comparisons"]
)
```

## Testing Checklist

### Manual Testing via Swagger UI

1. Navigate to http://localhost:8000/docs
2. Authenticate using "Authorize" button
3. Test each DELETE endpoint:
   - DELETE comparison (should succeed)
   - DELETE non-current version (should succeed)
   - DELETE current version (should fail with 400)
   - DELETE template (should succeed and remove all files)

### cURL Testing

See example requests in each endpoint section above.

### Integration Testing

Test CASCADE deletion by:

1. Create template with 2 versions
2. Create comparison using version 1
3. Delete version 1 → Verify comparison is also deleted
4. Delete template → Verify all versions and files are deleted
