## Why

KAN-44 parses Goodreads CSV rows; US-13 (KAN-43) requires deterministic field mapping to `books` and `reading_records` before validation, dedup, and persistence (KAN-46–47).

## What Changes

- Pure mapper from `GoodreadsParsedRow` to import draft (`book` + `reading_record`)
- Extend `POST /v1/import/goodreads` response with `mapped_rows`
- Unit tests for US-13 mapping edge cases (min fixture)
- Update `docs/api-spec.yml`

Non-goals: DB writes, deduplication, empty-title batch summary persistence (KAN-46), frontend (KAN-47).

## Capabilities

### New Capabilities

- `goodreads-field-mapping`: Map parsed Goodreads rows to book and reading-record draft shapes per US-13 rules.

### Modified Capabilities

- `goodreads-csv-parser`: Parse response includes mapped import drafts.

## Impact

- Backend: `backend/src/import/goodreads/`, `import.service.ts`, tests, `docs/api-spec.yml`
