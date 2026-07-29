## Original

Row validation (title required; discard and log rows without title) and deduplication: detect existing books by `isbn13`, else `title` + `authors`; duplicates are **skipped** (not created or overwritten). Log skipped/discarded for US-15 summary. Idempotent: re-importing the same CSV does not create duplicates.

## Enhanced

### Scope (KAN-46)

Validate mapped Goodreads drafts, dedupe against the user's library and within the CSV batch, **persist** accepted rows to `books` + `reading_records`, and return an import summary. No overwrite of existing books.

### Validation

| Check | Outcome |
|-------|---------|
| Empty title | `SKIPPED_INVALID` / `MISSING_TITLE` (already filtered at map; consolidate in summary) |
| Empty authors | allow import with empty string or `Unknown` — only title is required per US-13 |

### Dedup keys (per user)

1. `isbn13` when present (normalized)
2. Else case-insensitive normalized `title` + `authors` (collapse whitespace)

Order: check library → check batch keys seen earlier in file.

### Persistence

For each **accepted** mapped row:

- Insert `books` with draft fields (`data_source: goodreads`, no catalog enrichment)
- Insert `reading_records` with mapped status, dates, rating, `read_format`
- Set `current_page` / `progress_percent` when status is `leido` and `page_count` known (match `BooksService.patchReadingRecord` behavior)

### API (`POST /v1/import/goodreads`)

Extend response:

```json
{
  "rows": [...],
  "mapped_rows": [...],
  "warnings": [...],
  "mapping_warnings": [...],
  "skipped_rows": [{ "row_number", "code", "message", "existing_book_id?" }],
  "imported": [{ "row_number", "book_id" }],
  "meta": {
    "parsed_rows", "mapped_rows", "skipped_rows",
    "imported_count", "skipped_duplicate_count", "skipped_invalid_count"
  }
}
```

### Files

- `goodreads-dedup.util.ts` (+ spec)
- `goodreads-import.processor.ts` (+ spec)
- `import.service.ts`, `import.controller.ts`, `import.module.ts`
- `docs/api-spec.yml`
- Integration tests with min fixture (import + reimport idempotency)

### Definition of done

- Unit tests for dedup keys and processor outcomes
- Integration: first import creates books; second import skips all duplicates
- No frontend (KAN-47)
