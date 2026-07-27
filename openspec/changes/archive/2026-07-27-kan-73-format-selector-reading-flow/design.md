## Decisions

- `PATCH /v1/books/{bookId}/reading-record` now receives `format_id` and validates ownership server-side.
- `read_format` is retained in response as a derived legacy slug for UI/stats continuity.
- UI format selectors reuse the existing `ReadFormatSelect` component, refactored to query `/v1/formats`.

## Validation Rules

- `format_id` must be UUID when present and non-null.
- If non-null and not owned by authenticated user, return `400 FORMAT_NOT_FOUND`.
- `format_id: null` clears the selection.

## Affected UI Flows

- Inline tracker format editor.
- Completion modal shown when marking book as read.
- Create/edit manual book modal reading section.
