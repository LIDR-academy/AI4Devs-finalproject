## Why

KAN-26 opened the edit modal shell; KAN-27 added backend PATCH. US-07 requires editing all book and reading fields in one form. KAN-28 delivers the reusable form with save.

## What Changes

- Full **`BookFormModal`** with all metadata + reading fields, client validation, save via `createBook` / `patchBook` + `patchReadingRecord`.
- Shared **`bookForm`** helpers for state and validation.
- **BookTrackerPage** wires save refresh and completion-modal side effects.

**Non-goals:** «Crear manualmente» from Add Book search (KAN-29).

## Capabilities

### New Capabilities

- `book-form-ui`: Reusable create/edit book form with validation and API save.

### Modified Capabilities

- `manual-book-edit-ui`: Save enabled; shell requirement superseded by full form.

## Impact

- **Frontend only** — depends on KAN-27 API, KAN-18 UI kit, KAN-26 modal entry.
