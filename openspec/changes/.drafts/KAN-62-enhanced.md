# KAN-62 Enhanced User Story

## Original

[Género 4/5] Borrado de género con confirmación y recuento de libros afectados.

On delete of a genre with assigned books, show confirmation with count; clear via FK ON DELETE SET NULL. Skip confirmation when count is 0.

## Enhanced

### Goal

Match audience/format delete UX: preview how many books use a genre before delete; confirm only when count > 0.

### Backend

- `GET /v1/genres/{id}/affected-books` → `{ affected_book_count: number }` (404 if not owned)
- Existing `DELETE /v1/genres/{id}` remains 204; FK SET NULL clears `books.genre_id`

### Frontend

- `GenreSettingsSection`: on Eliminar, fetch affected count; if 0 delete immediately; if > 0 `ConfirmModal` with Spanish copy about N books losing genre
- Invalidate `genres` + `books` after delete

### Tests / docs

- Unit: count for owned genre; 404 foreign
- Integration: delete with books → genre_id null
- Update `docs/api-spec.yml`

### DoD

Settings delete confirms when books assigned; unused genres delete without modal; tracker shows blank genre after confirm.
