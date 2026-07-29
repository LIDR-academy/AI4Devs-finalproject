## Why

Audience appears in product specs (tracker column, stats chart) but is missing from the data model. KAN-35 adds persistence and API exposure so US-12 charts and the tracker column can consume it.

## What Changes

- Migration: nullable `audience` on `books` with enum check.
- API: optional `audience` on create; new `PATCH /v1/books/{bookId}` for metadata updates including audience.
- Frontend: audience selector in add-book flow; column + inline edit in Book Tracker.
- Documentation sync.

**Non-goals:** Stats aggregation chart (later tickets); full US-07 manual form.

## Capabilities

### New Capabilities

- `book-audience`: enum field, API create/patch/list, tracker UI.

### Modified Capabilities

*(none)*

## Impact

- **Backend:** entity, DTOs, migration, `BooksService.update`, controller route, tests.
- **Frontend:** types, `patchBook`, `AudienceSelect`, AddBookModal, BookTrackerRow.
- **Jira:** KAN-35, blocks audience chart (US-12).
