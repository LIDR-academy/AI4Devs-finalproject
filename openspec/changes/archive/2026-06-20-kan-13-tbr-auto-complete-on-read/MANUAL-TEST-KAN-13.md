# Manual test checklist — KAN-13 (US-04 scenario 8)

**Prerequisites:** Backend on `:3000`, frontend on `:5173`, PostgreSQL migrated, dev login. KAN-10 TBR module must be available (`/lists`, TBR API).

## Scenario 1 — TBR auto-complete from Book Tracker

1. Log in and open `/lists`.
2. Add a library book to the **current month** TBR (note the book title).
3. Open `/book-tracker` and find the same book.
4. Change status to **Leído** (complete modal if shown; confirm or dismiss).
5. **Expected:** PATCH response includes `meta.tbrAutoCompleted: true` (check network tab).
6. Navigate to `/lists` for the current month.
7. **Expected:** The book entry shows completed styling (check / strikethrough).

## Scenario 2 — Book not on TBR

1. Pick a book **not** on the current-month TBR.
2. Mark it **Leído** from Book Tracker.
3. **Expected:** PATCH succeeds; `meta.tbrAutoCompleted` is absent or false.

## Scenario 3 — Already on TBR, already completed

1. Complete scenario 1 for a book.
2. Change the same book back to **Pendiente**, then to **Leído** again.
3. **Expected:** No error; TBR entry remains completed (or re-completes without duplicate issues).

**Out of scope:** Annual goal update (KAN-11), stats (KAN-15), TBR CRUD itself (KAN-10).
