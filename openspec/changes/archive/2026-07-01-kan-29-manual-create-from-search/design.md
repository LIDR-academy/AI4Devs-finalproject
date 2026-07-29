## Context

Add Book modal already searches catalog with debounce. Zero-result state currently shows text only.

## Decisions

1. **Show after completed search** — query ≥ 2 chars, not loading, `results.length === 0` (includes API empty and network error with empty results).
2. **Modal swap** — close Add Book modal, open BookFormModal create (avoids stacked modals).
3. **Single BookFormModal** on page — mode toggles between create (KAN-29) and edit (KAN-26).

## UX

Message: «No se encontraron libros.» + primary secondary action «Crear manualmente».
