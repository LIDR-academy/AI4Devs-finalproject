## Context

Single form for US-07 manual create/edit. Book fields via PATCH book; reading lifecycle via PATCH reading-record (existing).

## Decisions

1. **`bookForm.ts`** — pure validation/payload helpers (testable, keeps modal thin).
2. **Two-step save on edit** — book PATCH then reading PATCH (matches API split).
3. **Conditional fields** — dates/rating visibility follows same rules as Book Tracker row.
4. **Completion modal** — if reading PATCH returns `openCompletionModal`, bubble to `BookTrackerPage`.

## Validation (client)

- Title and authors required (trimmed).
- `page_count >= 0`; `publication_year` in range when set.
- Cover URL valid when non-empty.
- `finished_on >= started_on` when both set.
