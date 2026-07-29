# Manual test — KAN-26 (manual book edit entry point)

## Prerequisites

- Frontend running (`npm start` in `frontend/`).
- Logged-in user with at least one book in Book Tracker.

## Edit entry point

1. Open **Book Tracker**.
2. Confirm a new **Acciones** column with a pencil icon on each row.
3. Click the pencil on a book row.
4. Modal opens with title «Editar libro — {título}».
5. Body shows placeholder copy and read-only title/author preview.
6. **Guardar** is disabled; **Cancelar** or Escape closes the modal.
7. No API errors; inline columns (status, dates, rating, audience) still work.

## Accessibility

1. Tab to the pencil button — focus ring visible.
2. Screen reader / inspect: button has `aria-label` «Editar {title}».
3. Modal traps focus; Escape closes and returns focus.

## Regression

- **Añadir libro** search flow unchanged.
- Completion modal still opens when marking a book as read.
