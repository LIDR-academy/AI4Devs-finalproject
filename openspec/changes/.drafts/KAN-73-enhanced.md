## Original

**KAN-73**: Selector cerrado de formato (manual) en el flujo de registrar/editar lectura.

- Reemplazar selector fijo (físico/ebook/audio) por selector dinámico desde `GET /v1/formats`.
- `PATCH /v1/books/{bookId}/reading-record` debe aceptar `format_id (UUID|null)` en lugar de `read_format` enum.
- Validar ownership del `format_id` para la usuaria autenticada.

## Enhanced

### Backend

- Update `PatchReadingRecordDto` to accept `format_id?: UUID | null`.
- In `BooksService.patchReadingRecord`:
  - resolve `format_id` ownership via `FormatsService.findOwnedById(userId, formatId)`;
  - reject foreign ids with `400 FORMAT_NOT_FOUND`;
  - allow clear with `format_id: null`.
- Keep response compatibility by still exposing `read_format` slug, and also include `format_id` in reading/list resources.

### Frontend

- Reuse `ReadFormatSelect` component but load options from `GET /v1/formats` (same pattern as `AudienceSelect`).
- Replace fixed enum usage in:
  - inline tracker row format editor,
  - completion modal,
  - create/edit book modal reading patch flow.
- Persist selected format using `format_id` payload.

### Tests

- Integration tests for books PATCH with `format_id` set/clear and foreign `format_id` rejection.
- Stats integration seed flow updated to map legacy fixture slugs to owned format ids before PATCH.

### Out of scope

- Format delete confirmation modal and affected-readings endpoint (KAN-74).
