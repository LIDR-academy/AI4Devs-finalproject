## Why

KAN-66 added Settings CRUD for audiences. Users need to assign a configurable público objetivo when adding or editing books via modals (KAN-64 / KAN-67).

## What Changes

- Backend: `audience_id` on POST/PATCH books with ownership validation
- Frontend: `AudienceSelect` loads user audiences; wired in add/edit modals
- Catalog add flow leaves público objetivo empty for manual selection
- Settings link when audience list is empty (non-blocking)

## Capabilities

### New Capabilities

- `book-audience-selector`: Closed selector in book modals backed by user audiences API

### Modified Capabilities

- `user-audiences`: ADD book assignment via `audience_id`

## Impact

- `BooksService`, DTOs, `AudienceSelect`, modals, `docs/api-spec.yml`
