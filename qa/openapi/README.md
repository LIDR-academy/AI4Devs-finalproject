# OpenAPI Contracts

This folder contains OpenAPI 3.0.3 contract files used for E2E testing and API documentation.

## Expenses API

- **File:** `expenses.openapi.yaml`
- **Source of truth:** Backend `ExpensesController` and DTOs under `Backend/src/modules/expenses/`.
- **Base path:** `/api` (global prefix from `main.ts`).
- **Security:** All endpoints require `Authorization: Bearer <JWT>`.

### Endpoints

| Method | Path | Operation |
|--------|------|-----------|
| GET | `/trips/{trip_id}/expenses` | List expenses (query: `page`, `limit`, `category_id`) |
| GET | `/trips/{trip_id}/expenses/{expense_id}` | Get one expense |
| POST | `/trips/{trip_id}/expenses` | Create expense |

### Using for E2E

- Validate backend responses against the contract (e.g. with `openapi-examples-validator`, Dredd, or custom assertions).
- Generate API clients from the contract if needed.
- Ensure frontend request/response types stay aligned with the schemas in this file.

### Aligning with the backend

When the backend changes (new fields, new endpoints, validation rules), update this contract and then adjust E2E tests and frontend types as needed.
