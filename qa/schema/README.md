# Schema

This folder contains JSON Schema definitions used for validation in the project.

## case-bundle.schema.json

Validates a **test case bundle**: a collection of test cases (API or E2E) that can be executed together.

- **Draft:** JSON Schema 2020-12
- **Strict:** `additionalProperties: false` on bundle and cases; all required fields must be present.

### Bundle (root) – required

| Field         | Type   | Required | Description                          |
|---------------|--------|----------|--------------------------------------|
| `id`          | string | yes      | Unique bundle id (e.g. `expenses-api`) |
| `name`        | string | yes      | Human-readable name                  |
| `description` | string | yes      | Scope and purpose                    |
| `version`     | string | yes      | Semver (e.g. `1.0.0`)                |
| `cases`       | array  | yes      | At least one case                    |
| `schemaVersion` | string | no     | Optional, use `1.0.0` to declare conformance |

### Case – required

| Field         | Type   | Required | Description                                  |
|---------------|--------|----------|----------------------------------------------|
| `id`          | string | yes      | Unique case id (e.g. `CP-EXP-001`)           |
| `name`        | string | yes      | Short title                                  |
| `description` | string | yes      | Preconditions, steps, expected outcome       |
| `type`        | string | yes      | `"api"` or `"e2e"`                           |
| `priority`    | string | no       | `critical` \| `high` \| `medium` \| `low`   |

- **When `type` is `"api"`:** `request` and `expect` are **required**.
- **When `type` is `"e2e"`:** `steps` is **required** (array with at least one step).

### API case: request (required when type = api)

| Field    | Type   | Required | Description                    |
|----------|--------|----------|--------------------------------|
| `method` | string | yes      | `GET` \| `POST` \| `PUT` \| `PATCH` \| `DELETE` |
| `path`   | string | yes      | Path, e.g. `/trips/{trip_id}/expenses` |
| `body`   | object | no       | Request body                   |
| `headers`| object | no       | Extra headers                  |
| `query`  | object | no       | Query parameters               |

### API case: expect (required when type = api)

| Field        | Type    | Required | Description                    |
|--------------|---------|----------|--------------------------------|
| `statusCode` | integer | yes      | Expected HTTP status (100–599) |
| `bodySchema` | string  | no       | Reference for body validation  |
| `bodyMatch`  | object  | no       | Partial body match             |

### E2E case: step (each item when type = e2e)

| Field     | Type    | Required | Description                    |
|-----------|---------|----------|--------------------------------|
| `order`   | integer | yes      | 1-based execution order        |
| `action`  | string  | yes      | `navigate` \| `click` \| `type` \| `select` \| `submit` \| `assertVisible` \| `assertText` \| `assertUrl` \| `wait` |
| `target`  | string  | no       | Selector or URL                |
| `value`   | string  | no       | Input or select value          |
| `expected`| string  | no       | Expected value for assertions  |

### Example (API case)

```json
{
  "id": "expenses-api-bundle",
  "name": "Expenses API tests",
  "description": "Contract and integration tests for the Expenses API.",
  "version": "1.0.0",
  "cases": [
    {
      "id": "CP-EXP-001",
      "name": "List expenses for trip",
      "description": "GET /trips/{trip_id}/expenses returns 200 and paginated list.",
      "type": "api",
      "priority": "high",
      "request": {
        "method": "GET",
        "path": "/trips/{trip_id}/expenses",
        "query": { "page": 1, "limit": 20 }
      },
      "expect": {
        "statusCode": 200
      }
    }
  ]
}
```

### Validation

Use a JSON Schema 2020-12 validator (e.g. Ajv, `ajv-cli`, or IDE schema validation) with `case-bundle.schema.json` to validate bundle JSON files.
