## Context

KAN-41 added `audience_distribution` using legacy `books.audience` enum. KAN-67 wires books to `audience_id`.

## Decisions

- Keep `{ audience, count }[]` response shape (matches genre/format).
- Bucket missing `audience_id` as `unknown`.
- Join `audiences` for display name; only count books owned by the user in period.

## Migration

No DB migration. Legacy `books.audience` column ignored for stats going forward.
