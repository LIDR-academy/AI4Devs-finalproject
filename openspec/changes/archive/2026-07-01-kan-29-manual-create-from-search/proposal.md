## Why

UC-01 alt 3b: when catalog search finds nothing, the user must add a book manually. KAN-28 built the form; KAN-29 connects it from the Add Book search modal.

## What Changes

- **Empty search state** in `AddBookModal` with «Crear manualmente» action.
- **BookTrackerPage** opens `BookFormModal` in create mode from that action.

**Non-goals:** Backend changes; edit-from-search prefill.

## Capabilities

### Modified Capabilities

- `add-book-ui`: Manual create fallback when search returns no results.

## Impact

- **Frontend only** — depends on KAN-28 `BookFormModal`, existing Add Book flow.
