# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-10-27-01-comparison-persistence/spec.md

## API Endpoints Overview

| Method | Endpoint                              | Description                                     | Auth Required |
| ------ | ------------------------------------- | ----------------------------------------------- | ------------- |
| POST   | `/api/v1/comparisons/ingest`          | Save a comparison result to database            | Yes           |
| GET    | `/api/v1/comparisons/{comparison_id}` | Retrieve a saved comparison by ID               | Yes           |
| GET    | `/api/v1/comparisons`                 | List saved comparisons with pagination          | Yes           |
| GET    | `/api/v1/comparisons/check`           | Check if comparison exists between two versions | Yes           |

---

## 1. POST /api/v1/comparisons/ingest

### Description

Persists a comparison result to the database for future reference. This endpoint accepts the same payload structure returned by the `/analyze` endpoint, ensuring seamless integration between analysis and persistence.

### Authentication

**Required:** Valid JWT Bearer token

### Request

#### Headers

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### Request Body Schema

```json
{
  "source_version_id": 2,
  "target_version_id": 11,
  "global_metrics": {
    "source_version_number": "v1.0",
    "target_version_number": "3.0-TEST",
    "source_page_count": 2,
    "target_page_count": 2,
    "page_count_changed": false,
    "source_field_count": 12,
    "target_field_count": 12,
    "field_count_changed": false,
    "fields_added": 1,
    "fields_removed": 1,
    "fields_modified": 1,
    "fields_unchanged": 10,
    "modification_percentage": 23.08,
    "source_created_at": "2025-10-19T18:18:00.751297Z",
    "target_created_at": "2025-10-26T18:32:29.959315Z"
  },
  "field_changes": [
    {
      "field_id": "A0",
      "status": "ADDED",
      "field_type": "text",
      "source_page_number": null,
      "target_page_number": 1,
      "page_number_changed": false,
      "near_text_diff": "NOT_APPLICABLE",
      "source_near_text": null,
      "target_near_text": "VOLUNTARIAS, cuyo número será (3)",
      "value_options_diff": "NOT_APPLICABLE",
      "source_value_options": null,
      "target_value_options": null,
      "position_change": "NOT_APPLICABLE",
      "source_position": null,
      "target_position": null
    },
    {
      "field_id": "A0106",
      "status": "MODIFIED",
      "field_type": "text",
      "source_page_number": 1,
      "target_page_number": 1,
      "page_number_changed": false,
      "near_text_diff": "DIFFERENT",
      "source_near_text": "con el número",
      "target_near_text": "con el númeroxxx",
      "value_options_diff": "NOT_APPLICABLE",
      "source_value_options": null,
      "target_value_options": null,
      "position_change": "NOT_APPLICABLE",
      "source_position": null,
      "target_position": null
    }
  ]
}
```

**Field Descriptions:**

| Field               | Type    | Required | Constraints | Description                   |
| ------------------- | ------- | -------- | ----------- | ----------------------------- |
| `source_version_id` | integer | Yes      | > 0         | ID of source template version |
| `target_version_id` | integer | Yes      | > 0         | ID of target template version |
| `global_metrics`    | object  | Yes      | -           | Global comparison statistics  |
| `field_changes`     | array   | Yes      | min 0 items | Array of field-level changes  |

**Validation Rules:**

- Source and target version IDs must exist in database
- Source and target version IDs must be different
- All field_changes must have valid `field_id` and `status`
- Global metrics must match field_changes counts (validated in service layer)

### Response

#### Success Response (201 Created)

```json
{
  "id": 42,
  "message": "Comparison saved successfully",
  "created_at": "2025-10-27T10:30:00Z"
}
```

**Response Field Descriptions:**

| Field        | Type     | Description                         |
| ------------ | -------- | ----------------------------------- |
| `id`         | integer  | ID of the created comparison record |
| `message`    | string   | Success confirmation message        |
| `created_at` | datetime | Timestamp when comparison was saved |

#### Error Responses

**400 Bad Request - Same Version IDs**

```json
{
  "detail": "Source and target versions must be different"
}
```

**401 Unauthorized - No Authentication**

```json
{
  "detail": "Not authenticated"
}
```

**404 Not Found - Version Doesn't Exist**

```json
{
  "detail": "Version with ID 999 not found"
}
```

**409 Conflict - Duplicate Comparison**

```json
{
  "detail": "A comparison between these versions already exists",
  "existing_comparison_id": 25
}
```

**422 Unprocessable Entity - Validation Error**

```json
{
  "detail": [
    {
      "loc": ["body", "source_version_id"],
      "msg": "ensure this value is greater than 0",
      "type": "value_error.number.not_gt"
    }
  ]
}
```

**500 Internal Server Error**

```json
{
  "detail": "Failed to save comparison. Please try again."
}
```

### Implementation Notes

1. **Transaction Safety:** All database operations must be wrapped in a single transaction to ensure atomicity
2. **Duplicate Detection:** Consider checking if comparison already exists (optional feature)
3. **User Attribution:** Store `created_by` field from authenticated user
4. **Timestamp:** Set `created_at` to current UTC time
5. **Status Field:** Set `status` to "completed" and `completed_at` to current time

---

## 2. GET /api/v1/comparisons/{comparison_id}

### Description

Retrieves a previously saved comparison by its ID. Returns the comparison data in the same format as the `/analyze` endpoint, allowing reuse of existing visualization components.

### Authentication

**Required:** Valid JWT Bearer token

### Request

#### Path Parameters

| Parameter       | Type    | Required | Description                |
| --------------- | ------- | -------- | -------------------------- |
| `comparison_id` | integer | Yes      | ID of the saved comparison |

#### Headers

```
Authorization: Bearer <jwt_token>
```

#### Example Request

```
GET /api/v1/comparisons/42
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Response

#### Success Response (200 OK)

Returns a `ComparisonResult` object identical to the `/analyze` endpoint response:

```json
{
  "source_version_id": 2,
  "target_version_id": 11,
  "global_metrics": {
    "source_version_number": "v1.0",
    "target_version_number": "3.0-TEST",
    "source_page_count": 2,
    "target_page_count": 2,
    "page_count_changed": false,
    "source_field_count": 12,
    "target_field_count": 12,
    "field_count_changed": false,
    "fields_added": 1,
    "fields_removed": 1,
    "fields_modified": 1,
    "fields_unchanged": 10,
    "modification_percentage": 23.08,
    "source_created_at": "2025-10-19T18:18:00.751297Z",
    "target_created_at": "2025-10-26T18:32:29.959315Z"
  },
  "field_changes": [
    {
      "field_id": "A0",
      "status": "ADDED",
      "field_type": "text",
      "source_page_number": null,
      "target_page_number": 1,
      "page_number_changed": false,
      "near_text_diff": "NOT_APPLICABLE",
      "source_near_text": null,
      "target_near_text": "VOLUNTARIAS, cuyo número será (3)",
      "value_options_diff": "NOT_APPLICABLE",
      "source_value_options": null,
      "target_value_options": null,
      "position_change": "NOT_APPLICABLE",
      "source_position": null,
      "target_position": null
    }
  ],
  "analyzed_at": "2025-10-27T10:30:00Z"
}
```

**Note:** The `analyzed_at` field contains the timestamp when the comparison was originally saved, not when it was retrieved.

#### Error Responses

**401 Unauthorized - No Authentication**

```json
{
  "detail": "Not authenticated"
}
```

**404 Not Found - Comparison Doesn't Exist**

```json
{
  "detail": "Comparison with ID 999 not found"
}
```

**500 Internal Server Error**

```json
{
  "detail": "Failed to retrieve comparison. Please try again."
}
```

### Implementation Notes

1. **Data Reconstruction:** Service must reconstruct `ComparisonResult` from database records
2. **Eager Loading:** Use `joinedload` to fetch related `comparison_fields` in single query
3. **Caching:** Consider caching response for 5 minutes (comparisons are immutable)
4. **Field Ordering:** Return field_changes in consistent order (by field_id)

---

## 3. GET /api/v1/comparisons

### Description

Lists all saved comparisons with pagination, sorting, and filtering capabilities. Returns summary information suitable for table display, not full field-level details.

### Authentication

**Required:** Valid JWT Bearer token

### Request

#### Query Parameters

| Parameter    | Type    | Required | Default      | Constraints     | Description                    |
| ------------ | ------- | -------- | ------------ | --------------- | ------------------------------ |
| `page`       | integer | No       | 1            | >= 1            | Page number (1-indexed)        |
| `page_size`  | integer | No       | 20           | 1-100           | Number of items per page       |
| `sort_by`    | string  | No       | "created_at" | See enum below  | Field to sort by               |
| `sort_order` | string  | No       | "desc"       | "asc" or "desc" | Sort direction                 |
| `search`     | string  | No       | null         | -               | Search term for template names |

**sort_by Enum Values:**

- `"created_at"` - Sort by creation timestamp
- `"modification_percentage"` - Sort by percentage of fields modified
- `"fields_added"` - Sort by number of fields added
- `"fields_removed"` - Sort by number of fields removed
- `"fields_modified"` - Sort by number of fields modified

#### Headers

```
Authorization: Bearer <jwt_token>
```

#### Example Requests

**Basic request (default pagination):**

```
GET /api/v1/comparisons
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**With pagination and sorting:**

```
GET /api/v1/comparisons?page=2&page_size=50&sort_by=modification_percentage&sort_order=desc
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**With search:**

```
GET /api/v1/comparisons?search=prestacion&page_size=10
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Response

#### Success Response (200 OK)

```json
{
  "items": [
    {
      "id": 42,
      "source_version_id": 2,
      "target_version_id": 11,
      "source_version_number": "v1.0",
      "target_version_number": "3.0-TEST",
      "source_template_name": "Solicitud Prestación Desempleo",
      "target_template_name": "Solicitud Prestación Desempleo",
      "modification_percentage": 23.08,
      "fields_added": 1,
      "fields_removed": 1,
      "fields_modified": 1,
      "fields_unchanged": 10,
      "created_at": "2025-10-27T10:30:00Z",
      "created_by": 5
    },
    {
      "id": 41,
      "source_version_id": 5,
      "target_version_id": 8,
      "source_version_number": "2024-Q1",
      "target_version_number": "2024-Q2",
      "source_template_name": "Certificado de Empresa",
      "target_template_name": "Certificado de Empresa",
      "modification_percentage": 15.5,
      "fields_added": 3,
      "fields_removed": 0,
      "fields_modified": 2,
      "fields_unchanged": 45,
      "created_at": "2025-10-26T14:20:00Z",
      "created_by": 5
    }
  ],
  "total": 127,
  "page": 1,
  "page_size": 20,
  "total_pages": 7
}
```

**Response Field Descriptions:**

| Field                             | Type     | Description                                    |
| --------------------------------- | -------- | ---------------------------------------------- |
| `items`                           | array    | Array of comparison summary objects            |
| `items[].id`                      | integer  | Comparison ID                                  |
| `items[].source_version_id`       | integer  | Source version ID                              |
| `items[].target_version_id`       | integer  | Target version ID                              |
| `items[].source_version_number`   | string   | Source version number                          |
| `items[].target_version_number`   | string   | Target version number                          |
| `items[].source_template_name`    | string   | Name of source template                        |
| `items[].target_template_name`    | string   | Name of target template                        |
| `items[].modification_percentage` | float    | Percentage of fields that changed              |
| `items[].fields_added`            | integer  | Count of added fields                          |
| `items[].fields_removed`          | integer  | Count of removed fields                        |
| `items[].fields_modified`         | integer  | Count of modified fields                       |
| `items[].fields_unchanged`        | integer  | Count of unchanged fields                      |
| `items[].created_at`              | datetime | When comparison was saved                      |
| `items[].created_by`              | integer  | User ID who saved the comparison               |
| `total`                           | integer  | Total number of comparisons (across all pages) |
| `page`                            | integer  | Current page number                            |
| `page_size`                       | integer  | Items per page                                 |
| `total_pages`                     | integer  | Total number of pages                          |

#### Error Responses

**401 Unauthorized - No Authentication**

```json
{
  "detail": "Not authenticated"
}
```

**422 Unprocessable Entity - Invalid Parameters**

```json
{
  "detail": [
    {
      "loc": ["query", "page"],
      "msg": "ensure this value is greater than or equal to 1",
      "type": "value_error.number.not_ge"
    }
  ]
}
```

**500 Internal Server Error**

```json
{
  "detail": "Failed to retrieve comparisons. Please try again."
}
```

### Implementation Notes

1. **Performance:** Use JOINs to fetch version and template data in single query
2. **Search:** Use ILIKE for case-insensitive search on template names
3. **Default Sorting:** Most recent comparisons first (created_at DESC)
4. **Empty Results:** Return empty array if no comparisons found (not 404)
5. **User Filtering:** Consider filtering by `created_by` if user permissions implemented

---

## 4. GET /api/v1/comparisons/check

### Description

Checks if a comparison already exists between two specific template versions. Useful for preventing duplicate comparisons and providing "View Existing" links in the UI.

### Authentication

**Required:** Valid JWT Bearer token

### Request

#### Query Parameters

| Parameter           | Type    | Required | Description                |
| ------------------- | ------- | -------- | -------------------------- |
| `source_version_id` | integer | Yes      | Source template version ID |
| `target_version_id` | integer | Yes      | Target template version ID |

#### Headers

```
Authorization: Bearer <jwt_token>
```

#### Example Request

```
GET /api/v1/comparisons/check?source_version_id=2&target_version_id=11
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Response

#### Success Response (200 OK)

**When comparison exists:**

```json
{
  "exists": true,
  "comparison_id": 42,
  "created_at": "2025-10-27T10:30:00Z"
}
```

**When comparison does not exist:**

```json
{
  "exists": false
}
```

**Response Field Descriptions:**

| Field           | Type                | Description                                |
| --------------- | ------------------- | ------------------------------------------ |
| `exists`        | boolean             | Whether a comparison exists                |
| `comparison_id` | integer (optional)  | ID of existing comparison (if exists=true) |
| `created_at`    | datetime (optional) | When comparison was saved (if exists=true) |

#### Error Responses

**401 Unauthorized - No Authentication**

```json
{
  "detail": "Not authenticated"
}
```

**422 Unprocessable Entity - Missing Parameters**

```json
{
  "detail": [
    {
      "loc": ["query", "source_version_id"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

### Implementation Notes

1. **Query:** Simple SELECT query checking for matching source/target pair
2. **Bidirectional Check:** Optionally check both (A→B) and (B→A) combinations
3. **Multiple Results:** If multiple comparisons exist, return the most recent one
4. **Use Case:** Frontend can call this before saving to show "Already exists" message

---

## Common API Patterns

### Authentication

All endpoints require JWT authentication. Include token in Authorization header:

```
Authorization: Bearer <jwt_token>
```

If token is missing or invalid, endpoints return 401 Unauthorized.

### Error Response Format

All errors follow this structure:

```json
{
  "detail": "Human-readable error message"
}
```

For validation errors (422), `detail` contains an array of specific field errors.

### Rate Limiting

| Endpoint     | Rate Limit                   |
| ------------ | ---------------------------- |
| POST /ingest | 20 requests/minute per user  |
| GET /{id}    | 100 requests/minute per user |
| GET / (list) | 60 requests/minute per user  |
| GET /check   | 60 requests/minute per user  |

Rate limit exceeded returns 429 Too Many Requests:

```json
{
  "detail": "Rate limit exceeded. Please try again in 30 seconds."
}
```

### CORS Configuration

Allow requests from frontend domain(s):

- Development: `http://localhost:5173`
- Production: `https://your-domain.com`

Allow headers: `Authorization`, `Content-Type`
Allow methods: `GET`, `POST`, `OPTIONS`

### Caching Strategy

**GET /{id} endpoint:**

- Cache-Control: `public, max-age=300` (5 minutes)
- ETag: Hash of comparison data
- Comparisons are immutable, safe to cache

**GET / (list) endpoint:**

- Cache-Control: `private, max-age=60` (1 minute)
- Invalidate on new comparison creation

**POST /ingest endpoint:**

- No caching

---

## OpenAPI Documentation

All endpoints must include comprehensive OpenAPI documentation with:

1. **Summary:** One-line description
2. **Description:** Detailed explanation with use cases
3. **Request Schema:** Pydantic model with field descriptions
4. **Response Schema:** Pydantic model for each status code
5. **Example Payloads:** Success and error examples
6. **Tags:** Appropriate categorization (e.g., "Comparisons - Persistence")

### Example OpenAPI Definition

```python
@router.post(
    "/ingest",
    response_model=ComparisonSaveResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Save Comparison Result",
    description="""
    Persists a comparison result to the database.

    **Use Case:**
    After analyzing two template versions, users can save the results
    for future reference, creating an audit trail of template evolution.

    **Features:**
    - Transactional integrity (atomic save of parent + child records)
    - User attribution (tracks who saved the comparison)
    - Duplicate detection (optional)

    **Authentication Required:** Valid JWT token
    """,
    responses={
        201: {
            "description": "Comparison saved successfully",
            "content": {
                "application/json": {
                    "example": {
                        "id": 42,
                        "message": "Comparison saved successfully",
                        "created_at": "2025-10-27T10:30:00Z"
                    }
                }
            }
        },
        400: {
            "description": "Validation error",
            "content": {
                "application/json": {
                    "example": {
                        "detail": "Source and target versions must be different"
                    }
                }
            }
        },
        401: {"description": "Not authenticated"},
        404: {"description": "Version not found"},
        409: {"description": "Comparison already exists"},
        422: {"description": "Invalid request data"},
        500: {"description": "Server error"}
    },
    tags=["Comparisons - Persistence"]
)
async def ingest_comparison(
    request: ComparisonSaveRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> ComparisonSaveResponse:
    """Save a comparison result to the database."""
    # Implementation...
```

---

## Sequence Diagrams

### Save Comparison Flow

```
┌────────┐         ┌──────────┐         ┌──────────────┐         ┌──────────┐
│ Client │         │ FastAPI  │         │  Comparison  │         │ Database │
│        │         │ Endpoint │         │   Service    │         │          │
└───┬────┘         └────┬─────┘         └──────┬───────┘         └────┬─────┘
    │                   │                      │                      │
    │ POST /ingest      │                      │                      │
    │──────────────────>│                      │                      │
    │                   │                      │                      │
    │                   │ Validate JWT         │                      │
    │                   │─────────┐            │                      │
    │                   │         │            │                      │
    │                   │<────────┘            │                      │
    │                   │                      │                      │
    │                   │ save_comparison()    │                      │
    │                   │─────────────────────>│                      │
    │                   │                      │                      │
    │                   │                      │ BEGIN TRANSACTION    │
    │                   │                      │─────────────────────>│
    │                   │                      │                      │
    │                   │                      │ INSERT comparison    │
    │                   │                      │─────────────────────>│
    │                   │                      │<─────────────────────│
    │                   │                      │   comparison_id      │
    │                   │                      │                      │
    │                   │                      │ INSERT comparison_   │
    │                   │                      │   fields (bulk)      │
    │                   │                      │─────────────────────>│
    │                   │                      │<─────────────────────│
    │                   │                      │                      │
    │                   │                      │ COMMIT               │
    │                   │                      │─────────────────────>│
    │                   │                      │<─────────────────────│
    │                   │                      │                      │
    │                   │<─────────────────────│                      │
    │                   │   comparison_id      │                      │
    │                   │                      │                      │
    │<──────────────────│                      │                      │
    │   201 Created     │                      │                      │
    │   { id: 42 }      │                      │                      │
    │                   │                      │                      │
```

### Retrieve Comparison Flow

```
┌────────┐         ┌──────────┐         ┌──────────────┐         ┌──────────┐
│ Client │         │ FastAPI  │         │  Comparison  │         │ Database │
│        │         │ Endpoint │         │   Service    │         │          │
└───┬────┘         └────┬─────┘         └──────┬───────┘         └────┬─────┘
    │                   │                      │                      │
    │ GET /42           │                      │                      │
    │──────────────────>│                      │                      │
    │                   │                      │                      │
    │                   │ get_comparison(42)   │                      │
    │                   │─────────────────────>│                      │
    │                   │                      │                      │
    │                   │                      │ SELECT comparison    │
    │                   │                      │   WITH versions      │
    │                   │                      │─────────────────────>│
    │                   │                      │<─────────────────────│
    │                   │                      │                      │
    │                   │                      │ SELECT comparison_   │
    │                   │                      │   fields             │
    │                   │                      │─────────────────────>│
    │                   │                      │<─────────────────────│
    │                   │                      │                      │
    │                   │                      │ Reconstruct          │
    │                   │                      │ ComparisonResult     │
    │                   │                      │─────────┐            │
    │                   │                      │         │            │
    │                   │                      │<────────┘            │
    │                   │                      │                      │
    │                   │<─────────────────────│                      │
    │                   │   ComparisonResult   │                      │
    │                   │                      │                      │
    │<──────────────────│                      │                      │
    │   200 OK          │                      │                      │
    │   { full data }   │                      │                      │
    │                   │                      │                      │
```

---

## Testing Recommendations

### Unit Tests

**Service Layer:**

- `test_save_comparison_success()`
- `test_save_comparison_duplicate()`
- `test_save_comparison_invalid_version()`
- `test_get_comparison_by_id()`
- `test_get_comparison_not_found()`
- `test_list_comparisons_pagination()`
- `test_list_comparisons_sorting()`
- `test_list_comparisons_search()`
- `test_check_comparison_exists()`

**API Endpoint:**

- `test_ingest_endpoint_success()`
- `test_ingest_endpoint_unauthorized()`
- `test_ingest_endpoint_validation_error()`
- `test_get_endpoint_success()`
- `test_get_endpoint_not_found()`
- `test_list_endpoint_success()`
- `test_list_endpoint_filtering()`
- `test_check_endpoint_exists()`
- `test_check_endpoint_not_exists()`

### Integration Tests

- End-to-end flow: Analyze → Save → Retrieve → Display
- Error handling: Invalid data, missing versions, database errors
- Performance: Load testing with 1000+ comparisons

### API Documentation Testing

- Swagger UI accessible at `/docs`
- All endpoints documented with examples
- Try-it-out functionality works for all endpoints
