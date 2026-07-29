## Original

**KAN-67** — Selector cerrado de audiencia en modal añadir/editar libro

Closed audience selector (manual, no API autocomplete) in add/edit book modals. Backend accepts `audience_id`; validate ownership. Catalog search never auto-fills. Empty list shows Settings link without blocking save.

## Enhanced

### Scope

Wire book create/patch to `books.audience_id` using user's configurable audiences from `GET /v1/audiences`. Update `AudienceSelect` component and modals. Legacy `books.audience` enum API field remains unchanged.

### Backend

- `CreateBookDto` / `PatchBookDto`: optional `audience_id` (UUID | null)
- `BooksService`: validate `audience_id` belongs to authenticated user; 400 if invalid
- `BookDto`: include `audience_id`
- Unit test: reject foreign `audience_id`

### Frontend

- `AudienceSelect`: load options from `GET /v1/audiences`; value = audience UUID | null
- `AddBookModal`, `BookFormModal`: use `audience_id`; empty after catalog search
- Empty audiences list: non-blocking notice with link to `/profile`
- `bookForm.ts`, API types, `BookTrackerRow` inline patch updated to `audience_id`

### Out of scope

- Remove legacy `audience` enum column/API
- Stats distribution by configurable audience (KAN-69)
- Delete confirmation (KAN-68)
