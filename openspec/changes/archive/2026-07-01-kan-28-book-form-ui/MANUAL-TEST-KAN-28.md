# Manual test — KAN-28 (book form UI)

## Prerequisites

- Backend and frontend running; logged in with books in tracker.

## Edit from pencil

1. Open **Book Tracker** → click pencil on a row.
2. Modal shows all fields (title, author, cover URL, genre, notes, audience, pages, year, series, status, dates, format, rating).
3. Change **title** and **genre** → **Guardar**.
4. Modal closes; tracker row shows updated values.

## Reading fields

1. Edit a book → set **Estado** to **Leyendo** → set **Fecha de inicio** → save.
2. Set **Estado** to **Leído** → fill finish date, format, rating → save.
3. If completion modal opens (status transition), confirm it still works.

## Validation

1. Clear **Título** → Guardar → inline error, no save.
2. Set **Fecha fin** before **Fecha inicio** on a read book → error on save.

## Create mode (optional)

Open `BookFormModal` with `mode="create"` (or wait for KAN-29 entry). Save with title + author → book appears with `data_source` manual.

## Regression

- Inline row edits still work.
- Add Book search flow unchanged.
