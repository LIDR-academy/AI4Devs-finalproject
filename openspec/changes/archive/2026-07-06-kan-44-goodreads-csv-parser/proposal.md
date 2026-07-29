## Why

US-13 (KAN-43) starts with a robust Goodreads CSV parser so mapping, validation, and persistence can build on normalized rows.

## What Changes

- `POST /v1/import/goodreads` multipart upload
- Parser for standard Goodreads library export (UTF-8, quoted CSV, ISBN `="…"` cleanup)
- Returns parsed rows + warnings for KAN-45 mapping

Non-goals: field mapping, dedup, persistence, frontend (KAN-45–47).

## Capabilities

### New Capabilities

- `goodreads-csv-parser`: Parse endpoint and Goodreads row normalization.

## Impact

- Backend: `import/` module, tests, fixture, `docs/api-spec.yml`
