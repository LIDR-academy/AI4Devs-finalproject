## Why

KAN-72 added CRUD for user formats in Settings, but reading flows still use a fixed hardcoded selector (`fisico|ebook|audio`). KAN-73 closes that gap by using user-owned formats when registering/updating reading records.

## What Changes

- Replace fixed format selectors in reading flows with dynamic options from `GET /v1/formats`.
- Update reading-record PATCH contract to accept `format_id` (UUID/null) instead of fixed `read_format` enum.
- Enforce ownership validation for submitted `format_id`.

## Impact

- **Backend:** `PatchReadingRecordDto` and `BooksService.patchReadingRecord` validation/assignment.
- **Frontend:** tracker row, completion modal, and book form modal format selector behavior.
- **Compatibility:** API responses keep `read_format` for display while adding `format_id` for editing.
