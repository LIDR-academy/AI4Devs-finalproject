## Context

KAN-12 archived with `reading-record-patch` spec stating **no TBR side effects** (`meta.tbrAutoCompleted` omitted). KAN-10 introduced `TBRService`, `monthly_tbr_lists`, `tbr_entries`, and may have already wired the PATCH hook on the current branch. KAN-13 (US-04 scenario 8) is the formal ticket to enable TBR auto-complete when marking a book `leido` from Book Tracker.

The active month for TBR lookup is the **UTC calendar month of the persisted `finished_on`** after KAN-12 auto-fill (not necessarily "today" if the client sends an explicit finish date).

## Goals / Non-Goals

**Goals:**

- On `status` transition to `leido`, complete matching open `tbr_entries` row for the active month.
- Return `meta.tbrAutoCompleted: true` when an entry was updated.
- Invalidate frontend TBR cache so Lists reflects completion.
- Integration tests covering book in TBR vs not in TBR.
- Sync main specs and user-stories Jira link for scenario 8.

**Non-Goals:**

- New REST endpoints or database migrations (KAN-10).
- GoalService / StatsService hooks.
- Completing TBR entries in months other than `finished_on` UTC month.
- Home TBR widget updates.

## Decisions

### 1. Hook location: `BooksService.patchReadingRecord`

After `readingRepo.save(reading)`, if `previousStatus !== 'leido'` and new status is `leido`, call TBR service.

**Rationale:** Single PATCH entry point; matches UC-02 sequence diagram (BookService → TBRService).

**Alternative considered:** Event emitter / domain event — rejected as over-engineering for MVP monolith.

### 2. Service method: `markCompletedIfInActiveMonthTbr(userId, bookId, finishedOn)`

```typescript
async markCompletedIfInActiveMonthTbr(
  userId: string,
  bookId: string,
  finishedOn: string | null,
): Promise<boolean>
```

1. Parse `(year, month)` from `finishedOn ?? utcToday()`.
2. Find `monthly_tbr_lists` for `(userId, year, month)` — return `false` if missing.
3. Find `tbr_entries` where `monthly_tbr_id`, `book_id`, `completed = false` — return `false` if missing.
4. Set `completed = true`, `completed_at = new Date().toISOString()`, save, return `true`.

**Rationale:** Idempotent for already-completed entries; no error when no TBR exists.

### 3. Module wiring

`BooksModule` imports `ListsModule`; inject `TBRService` into `BooksService`.

**Rationale:** Matches KAN-10 design; `ListsModule` exports `TBRService`.

### 4. Error handling: reading save is authoritative

If TBR update fails, log at warn level, omit `meta.tbrAutoCompleted`, still return 200 with updated reading record.

**Rationale:** User's read status must not roll back due to TBR failure.

### 5. Frontend cache invalidation

On PATCH success with `meta.tbrAutoCompleted === true`, invalidate:

```typescript
queryClient.invalidateQueries({ queryKey: ['tbr', year, month] });
```

Use UTC year/month from `reading.finished_on` when available; fallback to current UTC month.

**Rationale:** Lists page uses `['tbr', year, month]` query key from KAN-10.

### 6. Verification-first apply strategy

During `/opsx:apply`, audit existing code against specs. If KAN-10 already implemented the hook, focus on tests, docs, user-stories link, and manual checklist — avoid duplicate logic.

## Risks / Trade-offs

- **[Risk] UTC vs local month boundary** → **Mitigation:** Document UTC; align with KAN-12 date rules; revisit user timezone in profile story.
- **[Risk] Duplicate work with KAN-10** → **Mitigation:** Verify-before-implement; tasks include audit step.
- **[Risk] Frontend invalidates wrong month** → **Mitigation:** Prefer `finished_on` month over `Date.now()` when parsing response.

## Migration Plan

1. Verify or implement backend hook and frontend invalidation.
2. Run integration tests.
3. Manual Book Tracker → Lists pass.
4. Update `docs/product/user-stories.md` scenario 8 dependency to KAN-13.
5. Archive updates main `reading-record-patch` spec (removes "no TBR" requirement).

## Open Questions

- None blocking — active month = UTC month of `finished_on` is the default per KAN-10 OpenSpec.
