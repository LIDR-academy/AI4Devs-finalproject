# Proposal: Edit book cover search (KAN-78)

## Why

Users editing an owned book need to discover and pick a cover from Open Library without pasting URLs manually. KAN-77 added the backend endpoint; this change wires it into the edit book modal.

## What changes

- **Buscar portada** button beside the cover URL field in edit mode.
- Cover search panel with refinable query, loading state, and cover grid (reuses `CoverPicker` styling).
- Selecting a cover updates form state only; save remains on Guardar.

## Capabilities

### New

- `edit-book-cover-picker` — edit-modal cover search UI and client integration.

### Modified

- None.

## Impact

- `frontend/src/components/BookFormModal.tsx`, new `BookCoverSearchPanel.tsx`
- `frontend/src/api/client.ts`, `types.ts`
- `CoverPicker.tsx` — optional empty-state props for edit flow
