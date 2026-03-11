# API Specification - Template Comparison Feature

## Endpoint Overview

| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| POST | `/api/v1/comparisons/analyze` | Analyze differences between two template versions | Yes |

## POST /api/v1/comparisons/analyze

### Description

Performs an in-memory comparison of two template versions using data from the database. Returns global metrics and detailed field-by-field differences.

### Request

#### Headers

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### Body Schema

```json
{
  "source_version_id": 1,
  "target_version_id": 2
}
```

**Field Descriptions:**

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `source_version_id` | integer | Yes | > 0 | ID of the source version to compare from |
| `target_version_id` | integer | Yes | > 0 | ID of the target version to compare to |

**Validation Rules:**
- Both IDs must be positive integers
- Both versions must exist in the database
- Source and target IDs must be different

#### Request Examples

**Basic Comparison:**
```json
{
  "source_version_id": 1,
  "target_version_id": 2
}
```

**Comparing Non-Sequential Versions:**
```json
{
  "source_version_id": 5,
  "target_version_id": 12
}
```

### Response

#### Success Response (200 OK)

**Schema:**

```json
{
  "source_version_id": 1,
  "target_version_id": 2,
  "global_metrics": {
    "source_version_number": "2024-Q1",
    "target_version_number": "2024-Q2",
    "source_page_count": 5,
    "target_page_count": 6,
    "page_count_changed": true,
    "source_field_count": 48,
    "target_field_count": 52,
    "field_count_changed": true,
    "fields_added": 4,
    "fields_removed": 0,
    "fields_modified": 3,
    "fields_unchanged": 45,
    "modification_percentage": 14.58,
    "source_created_at": "2024-01-15T10:30:00Z",
    "target_created_at": "2024-04-20T14:25:00Z"
  },
  "field_changes": [
    {
      "field_id": "NOMBRE_SOLICITANTE",
      "status": "UNCHANGED",
      "field_type": "text",
      "source_page_number": 1,
      "target_page_number": 1,
      "page_number_changed": false,
      "near_text_diff": "EQUAL",
      "source_near_text": "Nombre del solicitante",
      "target_near_text": "Nombre del solicitante",
      "value_options_diff": "NOT_APPLICABLE",
      "position_change": "EQUAL",
      "source_position": {"x0": 100, "y0": 200, "x1": 300, "y1": 220},
      "target_position": {"x0": 100, "y0": 200, "x1": 300, "y1": 220}
    },
    {
      "field_id": "ACEPTA_CONDICIONES",
      "status": "MODIFIED",
      "field_type": "checkbox",
      "source_page_number": 5,
      "target_page_number": 6,
      "page_number_changed": true,
      "near_text_diff": "DIFFERENT",
      "source_near_text": "Acepto las condiciones",
      "target_near_text": "Acepto las condiciones y política de privacidad",
      "value_options_diff": "NOT_APPLICABLE",
      "position_change": "DIFFERENT",
      "source_position": {"x0": 50, "y0": 700, "x1": 70, "y1": 720},
      "target_position": {"x0": 50, "y0": 750, "x1": 70, "y1": 770}
    },
    {
      "field_id": "CONSENTIMIENTO_RGPD",
      "status": "ADDED",
      "field_type": "checkbox",
      "source_page_number": null,
      "target_page_number": 6,
      "page_number_changed": false,
      "near_text_diff": "NOT_APPLICABLE",
      "target_near_text": "Autorizo el tratamiento de datos según RGPD",
      "value_options_diff": "NOT_APPLICABLE",
      "position_change": "NOT_APPLICABLE",
      "target_position": {"x0": 50, "y0": 780, "x1": 70, "y1": 800}
    },
    {
      "field_id": "CAMPO_OBSOLETO",
      "status": "REMOVED",
      "field_type": "text",
      "source_page_number": 4,
      "target_page_number": null,
      "page_number_changed": false,
      "near_text_diff": "NOT_APPLICABLE",
      "source_near_text": "Campo obsoleto",
      "value_options_diff": "NOT_APPLICABLE",
      "position_change": "NOT_APPLICABLE",
      "source_position": {"x0": 100, "y0": 500, "x1": 250, "y1": 520}
    },
    {
      "field_id": "TIPO_PRESTACION",
      "status": "MODIFIED",
      "field_type": "select",
      "source_page_number": 2,
      "target_page_number": 2,
      "page_number_changed": false,
      "near_text_diff": "EQUAL",
      "source_near_text": "Tipo de prestación",
      "target_near_text": "Tipo de prestación",
      "value_options_diff": "DIFFERENT",
      "source_value_options": ["Contributiva", "Asistencial"],
      "target_value_options": ["Contributiva", "Asistencial", "Subsidio agrario"],
      "position_change": "EQUAL",
      "source_position": {"x0": 150, "y0": 300, "x1": 350, "y1": 320},
      "target_position": {"x0": 150, "y0": 300, "x1": 350, "y1": 320}
    }
  ],
  "analyzed_at": "2025-10-26T15:45:30Z"
}
```

**Response Field Descriptions:**

**Global Metrics:**

| Field | Type | Description |
|-------|------|-------------|
| `source_version_number` | string | Version identifier of source template |
| `target_version_number` | string | Version identifier of target template |
| `source_page_count` | integer | Number of pages in source PDF |
| `target_page_count` | integer | Number of pages in target PDF |
| `page_count_changed` | boolean | Whether page count differs |
| `source_field_count` | integer | Total fields in source version |
| `target_field_count` | integer | Total fields in target version |
| `field_count_changed` | boolean | Whether field count differs |
| `fields_added` | integer | Number of fields added in target |
| `fields_removed` | integer | Number of fields removed from source |
| `fields_modified` | integer | Number of fields with changes |
| `fields_unchanged` | integer | Number of fields without changes |
| `modification_percentage` | float | Percentage of fields that changed |
| `source_created_at` | datetime | When source version was created |
| `target_created_at` | datetime | When target version was created |

**Field Changes:**

| Field | Type | Values | Description |
|-------|------|--------|-------------|
| `field_id` | string | - | Unique field identifier |
| `status` | enum | ADDED, REMOVED, MODIFIED, UNCHANGED | Change type |
| `field_type` | string | text, checkbox, select, etc. | Type of form field |
| `source_page_number` | integer? | - | Page in source (null if ADDED) |
| `target_page_number` | integer? | - | Page in target (null if REMOVED) |
| `page_number_changed` | boolean | - | Whether page number differs |
| `near_text_diff` | enum | EQUAL, DIFFERENT, NOT_APPLICABLE | Label comparison |
| `source_near_text` | string? | - | Label in source |
| `target_near_text` | string? | - | Label in target |
| `value_options_diff` | enum | EQUAL, DIFFERENT, NOT_APPLICABLE | Options comparison |
| `source_value_options` | array? | - | Options in source |
| `target_value_options` | array? | - | Options in target |
| `position_change` | enum | EQUAL, DIFFERENT, NOT_APPLICABLE | Position comparison |
| `source_position` | object? | {x0, y0, x1, y1} | Coordinates in source |
| `target_position` | object? | {x0, y0, x1, y1} | Coordinates in target |

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
  "detail": "Failed to analyze comparison"
}
```

## Sequence Diagram

```
┌─────────┐           ┌──────────┐           ┌────────────────┐           ┌──────────┐
│ Client  │           │ FastAPI  │           │  Comparison    │           │ Database │
│         │           │ Endpoint │           │    Service     │           │          │
└────┬────┘           └────┬─────┘           └───────┬────────┘           └────┬─────┘
     │                     │                         │                         │
     │ POST /comparisons/  │                         │                         │
     │      analyze        │                         │                         │
     │────────────────────>│                         │                         │
     │                     │                         │                         │
     │                     │ Validate Auth           │                         │
     │                     │──────────┐              │                         │
     │                     │          │              │                         │
     │                     │<─────────┘              │                         │
     │                     │                         │                         │
     │                     │ compare_versions()      │                         │
     │                     │────────────────────────>│                         │
     │                     │                         │                         │
     │                     │                         │ Fetch source version    │
     │                     │                         │────────────────────────>│
     │                     │                         │<────────────────────────│
     │                     │                         │                         │
     │                     │                         │ Fetch target version    │
     │                     │                         │────────────────────────>│
     │                     │                         │<────────────────────────│
     │                     │                         │                         │
     │                     │                         │ Fetch source fields     │
     │                     │                         │────────────────────────>│
     │                     │                         │<────────────────────────│
     │                     │                         │                         │
     │                     │                         │ Fetch target fields     │
     │                     │                         │────────────────────────>│
     │                     │                         │<────────────────────────│
     │                     │                         │                         │
     │                     │                         │ Compare in memory       │
     │                     │                         │──────────┐              │
     │                     │                         │          │              │
     │                     │                         │<─────────┘              │
     │                     │                         │                         │
     │                     │<────────────────────────│                         │
     │                     │   ComparisonResult      │                         │
     │                     │                         │                         │
     │<────────────────────│                         │                         │
     │   200 OK + JSON     │                         │                         │
     │                     │                         │                         │
```

## Rate Limiting

- **Limit:** 10 comparisons per minute per user
- **Reason:** Prevent abuse and ensure fair resource usage
- **Response:** 429 Too Many Requests

## Caching Strategy

- Cache template lists for 5 minutes
- Cache version lists per template for 5 minutes
- No caching of comparison results (always fresh data)

## Monitoring and Logging

**Metrics to Track:**
- Comparison request count
- Average comparison execution time
- Error rate by type
- Number of fields compared per request

**Logs to Capture:**
- User ID and timestamp for each comparison
- Version IDs being compared
- Execution time
- Error details with stack traces
- Field count and change statistics

