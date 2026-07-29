## Why

KAN-35 added PATCH for `audience` only. US-07 / KAN-28 need a backend contract to save full manual book metadata. KAN-27 extends `PATCH /v1/books/{bookId}` and verifies manual `POST /v1/books`.

## What Changes

- Expand `PatchBookDto` and `BooksService.update()` for all book metadata fields.
- Integration tests: manual POST with full payload, PATCH combinations, validation errors, cross-user 404.
- Update `docs/api-spec.yml` and frontend `PatchBookPayload` types (no UI).

**Non-goals:** Book form UI (KAN-28), reading-record fields on book PATCH, «Crear manualmente» flow (KAN-29).

## Capabilities

### New Capabilities

- `book-patch`: Partial update of user-owned book metadata via PATCH `/v1/books/{bookId}`.

### Modified Capabilities

- `book-create`: Clarify manual create path in tests (behavior unchanged).

## Impact

- **Backend:** `patch-book.dto.ts`, `books.service.ts`, integration tests.
- **Docs:** `docs/api-spec.yml`.
- **Depends on:** KAN-35 (PATCH route exists), KAN-26 (edit entry — frontend consumes in KAN-28).
