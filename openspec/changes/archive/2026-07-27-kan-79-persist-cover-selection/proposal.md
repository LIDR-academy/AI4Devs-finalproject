# Proposal: Persist cover selection on save (KAN-79)

## Why

KAN-78 lets users pick a cover in the edit modal without auto-saving. This ticket closes the loop: **Guardar** must persist `cover_image_url` whether it came from the grid or manual input.

## What changes

- Integration tests confirming `PATCH /v1/books/{bookId}` persists `cover_image_url`.
- Spec updates for edit-book cover picker and book-patch.
- No API contract or UI changes expected (verify existing flow).

## Capabilities

### Modified

- `edit-book-cover-picker` — persist on save scenarios.
- `book-patch` — `cover_image_url` PATCH scenarios.

## Impact

- `backend/test/books.integration-spec.ts`
- OpenSpec deltas only (no production code changes unless a gap is found)
