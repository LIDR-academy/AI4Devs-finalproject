## Why

Users editing a saved book need to pick a cover from catalog editions (KAN-76 epic). KAN-9 added catalog search and per-edition cover resolution for the add-book flow; KAN-77 exposes the same capability scoped to an owned book in edit context.

## What Changes

- Add `GET /v1/books/{bookId}/cover-search` with optional `q` (defaults to saved title + authors).
- Orchestrate `CatalogService.search` then `EditionCoversService.getCovers` per result.
- Return editions that have at least one cover; empty list when none.
- JWT + book ownership (404 for foreign/missing book).

## Capabilities

### New Capabilities

- `book-cover-search-api`: Cover search for owned books reusing catalog providers.

### Modified Capabilities

- _(none)_

## Impact

- `backend/src/books/` (controller, service, DTOs, tests)
- `docs/api-spec.yml`
