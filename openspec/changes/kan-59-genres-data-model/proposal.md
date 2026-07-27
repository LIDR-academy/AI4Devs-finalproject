# Proposal: Genres data model (KAN-59)

## Why

Book genre is currently free text on `books.genre`. Phase 11 introduces user-configurable genres (KAN-58 epic); this ticket adds the relational model and migrates existing data.

## What changes

- New `genres` table (per-user, case-insensitive unique names).
- `books.genre_id` FK replaces `books.genre` text column.
- Default genre seed on user creation (7 values).
- Backend services updated to resolve and expose genre via the new relation.

## Capabilities

### New

- `user-genres` — genres table, migration, seed, book linkage.

### Modified

- `book-patch` / `book-create` — genre resolved via `genres` (API string unchanged).

## Impact

- `backend/src/genres/`, migration, `Book` entity, `BooksService`, `StatsService`, import enrichment
- `docs/data-model.md`
