## Context

KAN-12 shipped `PATCH /v1/books/{bookId}/reading-record` with `meta.openCompletionModal` and explicitly deferred TBR integration (`meta.tbrAutoCompleted` omitted). TBR tables are documented in `readme.md` §3.2.5 but marked "planned" in `docs/data-model.md`; no `lists` module exists in `backend/src/`. US-02 (KAN-10) requires auto-created monthly lists, empty-state UX, and checklist auto-complete when a book in the current month's TBR is marked `leido` (US-04 scenario 8 / UC-05).

## Goals / Non-Goals

**Goals:**

- Persist `monthly_tbr_lists` and `tbr_entries` with uniqueness constraints.
- `TBRService.getOrCreateMonthlyTbr(userId, year, month)` — idempotent create.
- Daily cron: for each user, if tomorrow starts month M and no list exists for M, insert empty list with `auto_created = true`.
- REST: `GET`, `POST` entry, `DELETE` entry under `/v1/tbr/{year}/{month}`.
- On `status` transition to `leido`, complete open entry in active-month TBR; return `meta.tbrAutoCompleted: true` when updated.
- Lists page at `/lists` with month picker, empty state, add-from-library, completed styling.

**Non-Goals:**

- Drag & drop reorder API/UI (append `sort_order` on add only).
- Custom lists, favorites, challenges.
- Home TBR widget.
- Auto-complete for books only in past-month TBR lists.
- `@nestjs/schedule` beyond one daily job (no per-user queues).

## Decisions

### 1. New `lists` module with `TBRService`

```
backend/src/lists/
  lists.module.ts
  tbr.controller.ts
  tbr.service.ts
  entities/monthly-tbr-list.entity.ts
  entities/tbr-entry.entity.ts
  dto/
  jobs/tbr-auto-create.job.ts
```

Export `TBRService` from `ListsModule`. Import `ListsModule` into `BooksModule` (forwardRef if circular).

**Rationale:** Matches `readme.md` architecture (`ListService` + `TBRService` under `lists/`).

**Alternative:** Embed TBR in `BooksModule` — rejected; violates feature boundaries.

### 2. Active month for auto-complete

When `status` transitions to `leido`:

1. Determine active month from `finished_on` in the patch result (after server auto-fill), using **UTC calendar month** (consistent with KAN-12 date rules).
2. Find `tbr_entries` where `book_id` matches, `completed = false`, and parent list is `(user_id, year, month)` of active month.
3. Set `completed = true`, `completed_at = now()`.
4. If ≥1 row updated → `meta.tbrAutoCompleted = true`; else omit or `false`.

**Alternative:** Complete in all open TBR lists containing the book — rejected; US-02 scenario 3 specifies current month only.

### 3. Auto-create triggers

| Trigger | Behavior |
| --- | --- |
| `GET /v1/tbr/{year}/{month}` | `getOrCreate` inside transaction; `INSERT ... ON CONFLICT DO NOTHING` then re-select |
| Daily cron (00:05 UTC) | For each user, if tomorrow's `(year, month)` has no list, create with `auto_created = true` |

Lazy create satisfies scenario 1 when user opens Lists; cron satisfies technical note "day before month starts" without requiring login.

**Alternative:** Cron only — rejected; first visit would 404 without lazy create.

### 4. REST shapes

```text
GET  /v1/tbr/{year}/{month}
200: {
  list: { id, year, month, auto_created, created_at, updated_at },
  entries: [{
    id, book_id, sort_order, completed, completed_at, added_at,
    book: { id, title, authors, cover_image_url, reading_status }
  }]
}

POST /v1/tbr/{year}/{month}/entries
Body: { book_id: uuid }
201: entry resource
409: duplicate book in list
404: book not owned

DELETE /v1/tbr/{year}/{month}/entries/{entryId}
204 or 200
404: entry not in user's list
```

Month path params validated: `month` 1–12, `year` 1970–2100.

### 5. `BooksService.patchReadingRecord` hook

After persisting reading record, if `status` transitioned to `leido`:

```typescript
const tbrCompleted = await this.tbrService.markCompletedIfInActiveMonthTbr(
  userId, bookId, reading.finishedOn,
);
if (tbrCompleted) meta.tbrAutoCompleted = true;
```

Inject `TBRService` via constructor; keep PATCH transaction: reading save first, then TBR update in same request (separate repo calls; TBR failure should not roll back reading — log error, omit meta flag).

**Rationale:** Reading state is primary; TBR is secondary side effect.

### 6. Frontend architecture

- Route `/lists` in `App.tsx`; nav link in layout/sidebar when present.
- `useQuery(['tbr', year, month], () => getMonthlyTbr(year, month))`.
- `MonthlyTbrView`: month `<select>` or prev/next; `TbrEmptyState` when `entries.length === 0`.
- `AddToTbrModal`: reuse library list from `GET /v1/books` or lightweight picker.
- On `patchReadingRecord` success with `tbrAutoCompleted`, `invalidateQueries(['tbr', currentYear, currentMonth])`.
- Completed rows: `aria-checked`, strikethrough or check icon.

**Display title:** `TBR {MonthName} {year}` (English month name in UI for MVP per frontend standards).

### 7. Tests

| Level | Coverage |
| --- | --- |
| Integration | `getOrCreate` idempotent; POST duplicate 409; DELETE removes entry; PATCH leido sets `tbrAutoCompleted` when book in current-month TBR |
| Manual | `MANUAL-TEST-KAN-10.md` scenarios 1–3 + cross-check Book Tracker |

### 8. Dependencies

Add `@nestjs/schedule` if not present; register `ScheduleModule.forRoot()` in `AppModule` and `TbrAutoCreateJob`.

## Risks / Trade-offs

- **[Risk] Circular dependency Books ↔ Lists** → **Mitigation:** `forwardRef` or extract `TbrCompletionService` interface; prefer `ListsModule` exports `TBRService`, `BooksModule` imports it only.
- **[Risk] Cron creates lists for inactive users** → **Mitigation:** acceptable for MVP; empty lists have low cost.
- **[Risk] UTC vs local month boundary** → **Mitigation:** document UTC; align with KAN-12; revisit user-TZ in profile story.
- **[Risk] Concurrent `getOrCreate`** → **Mitigation:** DB unique constraint + `ON CONFLICT DO NOTHING`.

## Migration Plan

1. Run migration adding `monthly_tbr_lists` and `tbr_entries`.
2. Deploy backend (TBR API + PATCH hook).
3. Deploy frontend Lists page.
4. Rollback: disable cron; revert PATCH hook; UI route hidden; tables can remain empty.

## Open Questions

- Require `@nestjs/schedule` or use a simple `setInterval` in dev-only? **Default:** `@nestjs/schedule` for production pattern.
- Spanish vs English Lists page copy? **Default:** English strings per `docs/standards/frontend-standards.md`; product may localize later.
