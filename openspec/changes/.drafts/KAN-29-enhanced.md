# KAN-29 — Enhanced user story

## Original

**Frontend — salida «Crear manualmente» desde búsqueda sin resultados**

En el modal de búsqueda, cuando la búsqueda no devuelve resultados (o ninguno coincide), mostrar la salida «Crear manualmente» que abre el formulario vacío de KAN-28. Cubre el flujo alternativo 3b de UC-01.

## Enhanced

### Scope

- When catalog search completes with **zero results** (query ≥ 2 chars), show **«Crear manualmente»** in `AddBookModal`.
- Click closes add-book search modal and opens `BookFormModal` in **create** mode (empty form).
- On save, book appears in tracker with `data_source: manual` (KAN-28).

### Files

- `frontend/src/components/AddBookModal.tsx` — empty-state + callback
- `frontend/src/components/AddBookModal.css` — manual create button styling
- `frontend/src/pages/BookTrackerPage.tsx` — wire create mode from search

### Definition of done

- [ ] Button visible after empty search
- [ ] Opens BookFormModal create; save adds book to tracker
- [ ] OpenSpec delta on `add-book-ui`; manual test doc; frontend build
