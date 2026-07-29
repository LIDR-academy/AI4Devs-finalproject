## Why

UC-04 requires read format to be user-selected, not auto-assigned. Book Tracker lacked an inline format column (Imprescindible #5).

## What Changes

- **`ReadFormatSelect`** accessible inline control (KAN-18 `Select`).
- **Format column** on Book Tracker with PATCH save.
- **Completion modal** aligned with shared selector.
- **API** allow clearing `read_format` with null on PATCH.

## Capabilities

### New Capabilities

- `book-tracker-read-format`: Inline selectable read format column.

### Modified Capabilities

- `book-tracker-lifecycle-ui`: Format editable inline and in completion modal; not auto-assigned.

## Impact

- Frontend: BookTracker row/page, ReadFormatSelect, CompletionModal.
- Backend: PATCH reading-record nullable `read_format`.
