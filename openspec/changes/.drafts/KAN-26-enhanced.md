# KAN-26 — Enhanced user story

## Original

**US-07 · Alta y edición manual completa de un libro**

Como lectora, quiero poder editar todos los datos de un libro y también crear uno desde cero, para registrar correctamente la edición que estoy leyendo aunque la búsqueda no la encuentre o devuelva datos incompletos.

**Context:** UC-01 alternate flows 3b and 5a were not covered by KAN-9.

**Acceptance (summary):**
1. Pencil on row → modal editing all fields (title, authors, cover URL, genre, tags, format, audience, pages, year, series, status, rating, dates).
2. Search no results → «Crear manualmente» → empty form → save with `data_source=manual`, status Pendiente.
3. Validation: title required, pages ≥ 0, finish ≥ start.

**Technical notes:** Single form for create/edit; `POST /v1/books` (manual) and `PATCH /v1/books/{bookId}` (all book fields); WCAG 2.1 AA.

**Jira subtasks:** KAN-27 (backend), KAN-28 (form), KAN-29 (search exit).

## Enhanced

### Scope for this ticket (KAN-26 — entry point only)

Implement the **Book Tracker edit entry point** and modal wiring. Do **not** implement full form fields, save logic, backend PATCH expansion, or «Crear manualmente» from search (KAN-27–KAN-29).

| In scope (KAN-26) | Deferred |
|-------------------|----------|
| Actions column with accessible pencil button per row | Full `BookFormModal` fields (KAN-28) |
| `BookTrackerPage` state: `editingBookId` / open close | `PATCH /v1/books` all fields (KAN-27) |
| `BookFormModal` shell: dialog, title, close, focus trap | Save / validation / API calls |
| OpenSpec capability `manual-book-edit-ui` (entry point reqs) | «Crear manualmente» in Add Book search (KAN-29) |

### Functional requirements

1. **Edit control:** Each Book Tracker row SHALL expose an icon button (pencil) with accessible name e.g. «Editar {title}».
2. **Modal open:** Clicking the pencil SHALL open `BookFormModal` in `mode: 'edit'` with the selected `Book` passed as props.
3. **Modal shell:** Modal SHALL use existing design tokens / modal patterns (`AddBookModal` overlay). Header shows «Editar libro» and book title. Body is a placeholder message: full form follows in KAN-28. Footer: primary «Guardar» disabled, secondary «Cancelar» closes.
4. **Keyboard / a11y:** Focus trap, Escape closes, `aria-labelledby` on dialog.
5. **No regression:** Existing inline columns (status, dates, rating, audience) unchanged.

### Files to touch

| Area | Path |
|------|------|
| Frontend row | `frontend/src/components/BookTrackerRow.tsx` |
| Frontend page | `frontend/src/pages/BookTrackerPage.tsx` |
| New modal | `frontend/src/components/BookFormModal.tsx` (+ optional `.css`) |
| Styles | Reuse `modal-overlay`, `modal` classes from Add Book |

### Definition of done

- [ ] OpenSpec change `kan-26-manual-book-edit-entry` with proposal, design, tasks, delta spec
- [ ] Pencil column visible on Book Tracker
- [ ] Modal opens/closes from pencil; disabled Save documents next ticket
- [ ] `MANUAL-TEST-KAN-26.md`
- [ ] Frontend build passes

### Notes

- «Etiquetas» in Jira maps to `notes` field (no separate tags table in MVP).
- `read_format`, status, rating, dates live on `reading_records`; full edit form will PATCH book + reading-record in KAN-28/27.
