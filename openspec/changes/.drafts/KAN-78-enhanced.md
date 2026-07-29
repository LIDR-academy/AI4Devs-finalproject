## Original

**KAN-78**: Frontend — "Buscar portada" button + selection grid in edit book modal.

Add "Buscar portada" next to `cover_image_url` in edit modal (always visible). Call `GET /v1/books/{bookId}/cover-search`, show loading + cover grid (reuse KAN-9 `CoverPicker` visual). Refinable search field with title/author preloaded. Empty: "No se han encontrado portadas para esta búsqueda"; manual URL stays editable. Selecting a cover fills `cover_image_url` without saving until Guardar.

## Enhanced

### UI (edit mode only)

- Row: `Portada (URL)` input + **Buscar portada** button (always visible).
- On activate: show `BookCoverSearchPanel` below with:
  - Editable search field (default `{title} {authors}`)
  - **Buscar** to re-run query
  - Loading / error / grid via extended `CoverPicker`
  - Empty message per ticket (no "Continuar sin portada")
- Selecting a cover sets `form.cover_image_url`; persist on modal Guardar only.

### API client

- `searchBookCovers(bookId, q?)` → `BookCoverSearchResponse`
- Types in `frontend/src/api/types.ts`

### Files

- `frontend/src/components/BookCoverSearchPanel.tsx` (+ CSS)
- `frontend/src/components/CoverPicker.tsx` — optional `emptyMessage`, `showContinueWithoutCover`
- `frontend/src/components/BookFormModal.tsx` — edit-mode integration
- `frontend/src/api/client.ts`, `types.ts`

### Out of scope

- E2E (no frontend test runner in project); manual verification in test plan.
- Create mode (add book keeps existing AddBookModal flow).

### Definition of done

- [ ] Buscar portada visible in edit modal always
- [ ] Cover search + grid + empty state
- [ ] Selection updates URL field without auto-save
- [ ] `npm run build` passes
