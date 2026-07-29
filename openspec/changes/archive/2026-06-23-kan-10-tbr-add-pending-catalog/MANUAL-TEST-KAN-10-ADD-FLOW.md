# Manual test — KAN-10 TBR add flow (pending + catalog)

**Prerequisites:** Backend `:3000`, frontend `:5173`, migrated DB, dev login.

## Scenario A — Library tab shows pending only

1. Ensure library has at least one `pendiente` book and one `leyendo` book.
2. Open `/lists` → **Add books** → **Library** tab.
3. **Expected:** Only `pendiente` books appear (not `leyendo` / `leido` / `dnf`).
4. **Expected:** Books already on the TBR are excluded.

## Scenario B — Empty library pending state

1. With no eligible pending books, open **Library** tab.
2. **Expected:** Message "No pending books in your library. Search for a title to add."

## Scenario C — Catalog search adds new book

1. Open **Search** tab, query ≥ 2 chars (e.g. an author name).
2. Select an edition not in library → **Add to list**.
3. **Expected:** Book appears on TBR and in Book Tracker as `pendiente`.

## Scenario D — API guard for non-pending

1. `curl POST /v1/tbr/{y}/{m}/entries` with a `leyendo` book id.
2. **Expected:** HTTP 422, `code: TBR_BOOK_NOT_PENDING`.
