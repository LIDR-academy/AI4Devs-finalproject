# Manual test — KAN-29 (manual create from search)

## Prerequisites

- Frontend + backend running; logged in.

## Empty search → manual create

1. **Book Tracker** → **Añadir libro**.
2. Search for a nonsense string (e.g. `zzzznonexistent12345`, ≥ 2 chars).
3. Wait for search to finish → «No se encontraron libros.» and **Crear manualmente** appear.
4. Click **Crear manualmente** → Add Book modal closes; manual form opens (empty).
5. Enter title + author → **Guardar**.
6. Book appears in tracker; verify via API/list if needed (`data_source: manual`).

## Regression

- Normal catalog search + save still works.
- Pencil edit form still works.
- «Crear manualmente» not shown before search (query &lt; 2 chars) or while loading.
