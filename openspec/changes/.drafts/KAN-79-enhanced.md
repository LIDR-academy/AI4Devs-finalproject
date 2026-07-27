## Original

**KAN-79**: Persist `books.cover_image_url` when saving edit book modal — from grid selection (KAN-78) or manual URL paste; last user action wins. Backend PATCH already accepts `cover_image_url`; confirm persistence. Keep URL validation.

## Enhanced

### Backend

- `PATCH /v1/books/{bookId}` with `cover_image_url` persists to `books.cover_image_url` (no contract change).
- Add integration tests:
  - PATCH catalog-style cover URL → GET/list shows new cover
  - PATCH different manual URL → prevails
  - PATCH `null` clears cover
  - Invalid URL → 400

### Frontend

- Existing flow: `BookFormModal` → `buildPatchBookPayload` → `patchBook` on Guardar.
- Grid selection and manual input both update `form.cover_image_url`; last write wins (single controlled field).
- `validateBookForm` URL check applies regardless of source.
- No new UI; verify `onSaved` invalidates `['books']` query (already in `BookTrackerPage`).

### Specs

- Extend `edit-book-cover-picker` with persist-on-save scenarios.
- Extend `book-patch` with `cover_image_url` PATCH scenarios.

### Out of scope

- Frontend E2E (no test runner in `frontend/`).

### Definition of done

- [ ] Integration tests pass for cover PATCH
- [ ] Spec deltas document persistence
- [ ] `npm run test:integration` (cover tests) passes
