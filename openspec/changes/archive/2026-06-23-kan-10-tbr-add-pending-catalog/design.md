## Context

KAN-10 (`AddToTbrModal`) lists all library books not on the TBR, regardless of `reading_status`. UC-05 expects TBR planning from titles not yet started (`pendiente`) and UC-05 §3a / UC-01 allow adding catalog editions to library + TBR in one flow. Catalog search and `POST /v1/books` already exist from KAN-9; TBR entry API exists from KAN-10.

## Goals / Non-Goals

**Goals:**

- Library picker shows only `pendiente` books (excluding those already on the list).
- Catalog search section in the same modal; selecting an edition creates the book (`pendiente`) and adds a TBR entry.
- Server rejects TBR entry for non-`pendiente` books with **422** and stable error code.
- Invalidate `books` and `tbr` queries after successful add.

**Non-Goals:**

- Cover picker step in TBR catalog flow (use `hint_cover_url` / edition default from search result).
- New composite backend endpoint (`POST /tbr/.../entries/from-catalog`); client orchestrates two existing calls.
- Changing which statuses can appear on an existing TBR entry after status changes.

## Decisions

### 1. Two-tab modal: Library | Search

Refactor `AddToTbrModal` into tabs:

| Tab | Content |
| --- | --- |
| **Library** | Radio list filtered by `reading_status === 'pendiente'` and `!existingBookIds.has(id)` |
| **Search** | Debounced query → `searchCatalog` → select edition → confirm |

**Rationale:** Clear mental model; matches UC-05 "from library or search".

**Alternative:** Single combined list — rejected; mixes persisted and transient catalog rows.

### 2. Catalog add orchestration (client)

On confirm from Search tab:

```text
1. createBook(catalogEditionToCreatePayload(edition))
2. addTbrEntry(year, month, response.book.id)
3. invalidate ['books'] and ['tbr', year, month]
```

Handle **409 BOOK_DUPLICATE**: if book already in library, fetch id from error `existingBookId` (if present) or `listBooks` match, then attempt `addTbrEntry` only if status is `pendiente`.

**Rationale:** Reuses KAN-9 book create; no backend coupling.

### 3. Server eligibility on `POST /tbr/.../entries`

In `TbrService.addEntry`, after loading book + `readingRecord`:

- If `readingRecord.status !== 'pendiente'` → **422** `{ code: 'TBR_BOOK_NOT_PENDING' }`
- Existing rules unchanged (404 not owned, 409 duplicate)

**Rationale:** UI filter alone is bypassable via API.

### 4. Empty states

| Condition | Message (English) |
| --- | --- |
| No pending library books | "No pending books in your library. Search for a title to add." |
| Search &lt; 2 chars | Hide results |
| Search no hits | "No catalog results. Try another query." |

### 5. Tests

| Level | Coverage |
| --- | --- |
| Integration | POST TBR entry for `leyendo` book → 422 `TBR_BOOK_NOT_PENDING` |
| Manual | `MANUAL-TEST-KAN-10.md` add-flow addendum |

## Risks / Trade-offs

- **[Risk] Duplicate catalog edition already in library as `leyendo`** → **Mitigation:** 422 on add; show error "Only pending books can be added to TBR".
- **[Risk] Two-step catalog add partial failure** (book created, TBR fails) → **Mitigation:** book remains in library; user can retry from Library tab if `pendiente`.
- **[Risk] Spanish UI elsewhere vs English strings here** → **Mitigation:** match `AddToTbrModal` existing English; align product copy later.

## Migration Plan

Deploy backend validation before or with frontend filter. No schema migration. Rollback: remove 422 check and revert modal filter.

## Open Questions

- Include minimal cover confirmation in Search tab? **Default no** — use search `cover_image_url` only (non-goal for this change).
