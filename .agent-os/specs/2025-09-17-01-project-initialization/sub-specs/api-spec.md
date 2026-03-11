# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-09-17-project-initialization/spec.md

## API Structure

### Base Configuration
- **Base URL**: `/api/v1`
- **Authentication**: JWT Bearer token authentication
- **Content Type**: `application/json`
- **Error Format**: Consistent error response structure with error codes and messages
- **Documentation**: Automatic OpenAPI/Swagger documentation at `/docs`

### Response Format Standards
- **Success Responses**: Include data, status, and metadata when applicable
- **Error Responses**: Include error code, message, and timestamp
- **Pagination**: Cursor-based pagination for list endpoints with limit and offset parameters
- **Filtering**: Query parameter filtering for list endpoints with standardized parameter names

## Authentication Endpoints

### POST /api/v1/auth/login

**Purpose:** Authenticate user and return JWT access token
**Parameters:** 
- `email` (string, required): User email address
- `password` (string, required): User password
**Response:** 
```json
{
  "access_token": "jwt_token_string",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "User Name"
  }
}
```
**Errors:** 
- 401: Invalid credentials
- 422: Validation error

### POST /api/v1/auth/register

**Purpose:** Register new user account
**Parameters:**
- `email` (string, required): User email address
- `password` (string, required): User password (min 8 characters)
- `full_name` (string, optional): User full name
**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "User Name"
  }
}
```
**Errors:**
- 400: Email already exists
- 422: Validation error

## Template Management Endpoints

### POST /api/v1/templates/

**Purpose:** Upload new PDF template
**Parameters:**
- `file` (file, required): PDF file upload
- `name` (string, required): Template name
- `version` (string, required): Template version
- `sepe_url` (string, optional): Source URL from SEPE website
**Response:**
```json
{
  "id": 1,
  "name": "SEPE Form 2024-v1",
  "version": "1.0.0",
  "file_size_bytes": 245760,
  "field_count": 25,
  "created_at": "2025-09-17T10:00:00Z"
}
```
**Errors:**
- 400: Invalid file format
- 413: File too large
- 422: Validation error

### GET /api/v1/templates/

**Purpose:** List all PDF templates with pagination and filtering
**Parameters:**
- `limit` (integer, optional, default=20): Number of results per page
- `offset` (integer, optional, default=0): Number of results to skip
- `name` (string, optional): Filter by template name
- `version` (string, optional): Filter by version
**Response:**
```json
{
  "items": [
    {
      "id": 1,
      "name": "SEPE Form 2024-v1",
      "version": "1.0.0",
      "field_count": 25,
      "created_at": "2025-09-17T10:00:00Z"
    }
  ],
  "total": 1,
  "limit": 20,
  "offset": 0
}
```
**Errors:**
- 422: Invalid query parameters

### GET /api/v1/templates/{template_id}

**Purpose:** Get detailed information about specific template
**Parameters:**
- `template_id` (integer, required): Template ID
**Response:**
```json
{
  "id": 1,
  "name": "SEPE Form 2024-v1",
  "version": "1.0.0",
  "file_path": "/uploads/templates/template_1.pdf",
  "file_size_bytes": 245760,
  "field_count": 25,
  "sepe_url": "https://www.sepe.es/...",
  "created_at": "2025-09-17T10:00:00Z",
  "updated_at": "2025-09-17T10:00:00Z"
}
```
**Errors:**
- 404: Template not found

## Comparison Endpoints

### POST /api/v1/comparisons/

**Purpose:** Create new template comparison
**Parameters:**
- `source_template_id` (integer, required): ID of source template
- `target_template_id` (integer, required): ID of target template
- `comparison_type` (string, optional, default="structure"): Type of comparison
**Response:**
```json
{
  "id": 1,
  "source_template_id": 1,
  "target_template_id": 2,
  "comparison_type": "structure",
  "status": "pending",
  "created_at": "2025-09-17T10:00:00Z"
}
```
**Errors:**
- 400: Invalid template IDs or same template comparison
- 404: Template not found
- 422: Validation error

### GET /api/v1/comparisons/{comparison_id}

**Purpose:** Get comparison results with detailed field differences
**Parameters:**
- `comparison_id` (integer, required): Comparison ID
**Response:**
```json
{
  "id": 1,
  "source_template": {
    "id": 1,
    "name": "SEPE Form 2024-v1",
    "version": "1.0.0"
  },
  "target_template": {
    "id": 2,
    "name": "SEPE Form 2024-v2",
    "version": "2.0.0"
  },
  "status": "completed",
  "differences_count": 5,
  "field_differences": [
    {
      "field_name": "applicant_name",
      "change_type": "modified",
      "old_value": "text_field",
      "new_value": "text_field_required"
    }
  ],
  "created_at": "2025-09-17T10:00:00Z",
  "completed_at": "2025-09-17T10:01:30Z"
}
```
**Errors:**
- 404: Comparison not found

### GET /api/v1/comparisons/

**Purpose:** List all comparisons with filtering and pagination
**Parameters:**
- `limit` (integer, optional, default=20): Number of results per page
- `offset` (integer, optional, default=0): Number of results to skip
- `status` (string, optional): Filter by comparison status
- `template_id` (integer, optional): Filter by template involvement
**Response:**
```json
{
  "items": [
    {
      "id": 1,
      "source_template_name": "SEPE Form 2024-v1",
      "target_template_name": "SEPE Form 2024-v2",
      "status": "completed",
      "differences_count": 5,
      "created_at": "2025-09-17T10:00:00Z"
    }
  ],
  "total": 1,
  "limit": 20,
  "offset": 0
}
```
**Errors:**
- 422: Invalid query parameters

## Health and System Endpoints

### GET /api/v1/health

**Purpose:** Health check endpoint for monitoring
**Parameters:** None
**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-09-17T10:00:00Z",
  "version": "1.0.0",
  "database": "connected"
}
```
**Errors:** 
- 503: Service unavailable

### GET /api/v1/info

**Purpose:** System information and API documentation
**Parameters:** None
**Response:**
```json
{
  "name": "SEPE Templates Comparator API",
  "version": "1.0.0",
  "description": "API for comparing SEPE PDF templates",
  "documentation_url": "/docs"
}
```
**Errors:** None
