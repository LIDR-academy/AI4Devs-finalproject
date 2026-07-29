## Context

KAN-9 delivered `books`, `reading_records`, catalog search, and a read-only Book Tracker table (`reading_status` only). KAN-12 (US-04, UC-02 + partial UC-04) requires mutating the 1:1 reading record from the tracker: status transitions, dates, rating, and format, plus a completion modal when marking `leido`. The contract is defined in `readme.md` §4 (`PATCH /v1/books/{bookId}/reading-record`) but is not yet in `docs/api-spec.yml` or the codebase.

Downstream features (KAN-15 stats, KAN-10 TBR, KAN-11 goals) depend on reliable `leido` + `finished_on`; this change does not invoke their services yet.

## Goals / Non-Goals

**Goals:**

- Implement `PATCH /v1/books/{bookId}/reading-record` with partial body, user-scoped book lookup, and business rules for status transitions.
- Return `ReadingRecordPatchedResponse` including full `reading` resource, `book.page_count`, and `meta.openCompletionModal` when status **transitions** to `leido`.
- Extend `GET /v1/books` list items with `started_on`, `finished_on`, `rating`, `read_format`.
- Book Tracker: inline status, dates, stars; completion modal on `leido` transition; 422 handling for invalid date range.
- Integration tests for core transitions and validation; sync `docs/api-spec.yml`.

**Non-Goals:**

- `current_page` / progress bar (UC-03) — reject or defer; if body includes `current_page`, return 422 with `INVALID_STATUS_FOR_PROGRESS` or omit field from DTO until UC-03 story.
- Tags in completion modal (full UC-04).
- `meta.tbrAutoCompleted`, TBRService, GoalService, StatsService.
- Home page widgets or filters/search on tracker (PRD Book Tracker extras).

## Decisions

### 1. Single service method in `BooksService`

- Add `patchReadingRecord(userId, bookId, dto)` alongside `listForUser` / `create`.
- Load book + `readingRecord` relation; 404 if not owned.
- Apply patch in one transaction; return mapped DTOs.

**Rationale:** Keeps reading logic in the existing `books` module without a separate micro-module for one table.

**Alternative:** `ReadingRecordService` — rejected for MVP surface area.

### 2. Status transition side effects (server)

| Transition / field | Behavior |
| --- | --- |
| `status` → `leyendo`, `started_on` omitted | Set `started_on` to today (UTC date `YYYY-MM-DD`) |
| `status` → `leido`, `finished_on` omitted | Set `finished_on` to today |
| `status` → `leido`, book has `page_count` | Set `current_page = page_count`, `progress_percent = 100` |
| `status` → `leido` (any path) | Set `meta.openCompletionModal = true` only if previous status ≠ `leido` |
| `finished_on` < `started_on` (both set) | 422, code `FINISHED_BEFORE_STARTED` |
| `rating` | 1–5 or null; validate range |
| `read_format` | `fisico` \| `ebook` \| `audio` or null |

**Date “today”:** use UTC calendar date consistently (document in service JSDoc); frontend displays local labels.

**Alternative:** client-only defaults — rejected; stats and future APIs need server truth.

### 3. PATCH DTO and route

```text
PATCH /v1/books/:bookId/reading-record
Authorization: Bearer JWT
Body: { status?, started_on?, finished_on?, rating?, read_format? }
       min 1 property; class-validator
200: { reading, book: { id, page_count }, meta? }
```

Do **not** accept `current_page` in KAN-12 DTO (omit property) to avoid partial UC-03.

### 4. Extended list item

`BookListItemDto` adds optional reading fields from `readingRecord` relation (already loaded in `listForUser`):

- `started_on`, `finished_on` (ISO date strings or null)
- `rating`, `read_format`

Keeps snake_case in JSON per `docs/data-model.md`.

### 5. Frontend architecture

- `patchReadingRecord(bookId, body)` in `api/client.ts`.
- `useMutation` per row or shared hook `useReadingRecordPatch` with `onSuccess` → `queryClient.invalidateQueries({ queryKey: ['books'] })`.
- **Status change to `leido`:** on 200 with `meta.openCompletionModal`, open `CompletionModal` with defaults from response `reading`; first PATCH may already set `leido` + `finished_on`.
- **Modal dismiss:** no extra PATCH; optional fields filled later inline.
- **Modal save:** PATCH `{ finished_on, read_format, rating }`.
- Components: `ReadingStatusSelect`, `InlineDateField`, `StarRating`, `CompletionModal` under `frontend/src/components/`.

**Alternative:** optimistic-only updates — use invalidate-first for simpler correctness in MVP.

### 6. UI labels vs API enums

Display Spanish labels (Pendiente, Leyendo, Leído, DNF) mapping to `pendiente`, `leyendo`, `leido`, `dnf`. Format labels: Físico / Ebook / Audio → API values.

### 7. Tests

| Level | Coverage |
| --- | --- |
| Integration | PATCH status pendiente→leyendo sets `started_on`; →leido returns `openCompletionModal`; date order 422; 404 wrong user |
| Manual | KAN-12 scenarios 1–7 on `/book-tracker` |

### 8. Documentation

Copy PATCH OpenAPI fragment from `readme.md` into `docs/api-spec.yml` during implementation tasks.

## Risks / Trade-offs

- **[Risk] Double PATCH on mark-as-read** (status then modal fields) → **Mitigation:** idempotent PATCH; modal only sends changed optional fields.
- **[Risk] Timezone skew on “today”** → **Mitigation:** document UTC; allow inline edit immediately after auto-fill.
- **[Risk] Large table re-render** → **Mitigation:** invalidate `['books']` only; acceptable for MVP library size.

## Migration Plan

No schema migration required (`reading_records` already has columns). Deploy backend PATCH before or with frontend UI. Rollback: revert UI to read-only; old clients ignore new list fields.

## Open Questions

- Allow `pendiente` → `leido` directly (skip `leyendo`)? **Default yes:** set `finished_on` today; `started_on` today if null.
- Clear `finished_on` when reverting `leido` → `leyendo`? **Default no:** keep dates for user edit (KAN-12 silent).
