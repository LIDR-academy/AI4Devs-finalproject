## Why

US-13 requires skipping duplicates and recording discarded rows before the import UI summary (KAN-47/KAN-52). KAN-45 produces drafts; KAN-46 validates, dedupes, and persists importable rows idempotently.

## What Changes

- Dedup utility (isbn13, then normalized title+authors) for library and in-batch checks
- Import processor persisting accepted rows to `books` + `reading_records`
- Extended `POST /v1/import/goodreads` response with `imported`, `skipped_rows`, and summary counts

Non-goals: frontend upload UI (KAN-47), catalog enrichment (KAN-49+).

## Capabilities

### New Capabilities

- `goodreads-import-validation-dedup`: Validate, dedupe, and persist Goodreads import rows.

### Modified Capabilities

- `goodreads-csv-parser`: Import endpoint persists books and returns import summary.

## Impact

- Backend: `import/` module, TypeORM repos, tests, `docs/api-spec.yml`
