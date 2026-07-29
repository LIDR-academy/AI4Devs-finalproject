# KAN-28 — Enhanced user story

## Original

**Frontend — formulario único de libro (crear + editar)**

Construir un único formulario reutilizable de libro, usado tanto para crear de cero como para editar (lápiz de la fila). Todos los campos editables, con validación en cliente. Usa los componentes de KAN-18. Accesible (labels, foco, teclado).

## Enhanced

### Scope (KAN-28)

Replace `BookFormModal` placeholder with a full form wired to KAN-27 APIs. **Edit mode** from Book Tracker pencil (KAN-26). **Create mode** UI ready; entry from Add Book search is KAN-29.

### Form fields

| Field | API | Notes |
|-------|-----|-------|
| Título | `books.title` | Required |
| Autora | `books.authors` | Required |
| Portada (URL) | `books.cover_image_url` | Optional URL |
| Género | `books.genre` | |
| Notas / etiquetas | `books.notes` | |
| Audiencia | `books.audience` | `AudienceSelect` |
| Páginas | `books.page_count` | ≥ 0 |
| Año publicación | `books.publication_year` | 1000–2100 |
| Saga | `books.series_name` | |
| Estado | `reading_records.status` | |
| Fecha inicio | `reading_records.started_on` | When leyendo/leído/dnf |
| Fecha fin | `reading_records.finished_on` | When leído |
| Formato | `reading_records.read_format` | |
| Puntuación | `reading_records.rating` | 1–5 when leído |

### Save behavior

- **Edit:** `PATCH /v1/books/{id}` then `PATCH .../reading-record` if reading fields present/changed.
- **Create:** `POST /v1/books` with `data_source: manual`, then reading PATCH if non-default status/fields.
- Client validation before submit; show field errors inline.
- On `meta.openCompletionModal` from reading PATCH, delegate to parent (same as inline row).

### Files

- `frontend/src/lib/bookForm.ts` — state, validation, payload builders
- `frontend/src/components/BookFormModal.tsx` — form UI (KAN-18 `Modal`, `Input`, `Select`, `Button`, `StarRating`, `AudienceSelect`)
- `frontend/src/pages/BookTrackerPage.tsx` — `onSaved`, completion modal hook

### Definition of done

- [ ] Full form in edit mode saves and refreshes tracker
- [ ] Create mode saves manual book (testable via prop/mode)
- [ ] Validation blocks invalid submit
- [ ] `npm run build` frontend; `MANUAL-TEST-KAN-28.md`
