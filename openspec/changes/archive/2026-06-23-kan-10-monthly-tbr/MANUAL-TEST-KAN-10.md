# Manual test checklist — KAN-10 (US-02 monthly TBR)

**Prerequisites:** Backend on `:3000`, frontend on `:5173`, PostgreSQL migrated, dev login.

## Scenario 1 — Auto-created monthly list

1. Log in and open `/lists`.
2. **Expected:** Current month title (e.g. `TBR June 2026`) and empty list or existing entries.
3. Open browser network tab; confirm `GET /v1/tbr/{year}/{month}` returns 200 with `list` and `entries`.

## Scenario 2 — Empty list encourages adding books

1. Use a month with no entries (or delete all entries).
2. **Expected:** Empty-state message and **Add books** button.
3. Click **Add books**; modal lists library books not already on the TBR.

## Scenario 3 — Auto-complete when marked read

1. Add a book to the current month's TBR from `/lists`.
2. Open `/book-tracker`; change that book's status to **Leído**.
3. Return to `/lists` for the current month.
4. **Expected:** Entry shows completed (check + strikethrough).
5. Optional API check: `PATCH` response included `meta.tbrAutoCompleted: true`.

## Out of scope

- Drag & drop reorder
- Home TBR widget
- Past-month auto-complete when marking read today
