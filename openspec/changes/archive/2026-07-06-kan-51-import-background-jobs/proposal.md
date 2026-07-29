## Why

Synchronous Goodreads import with per-row catalog enrichment blocks HTTP and can saturate Open Library / Google Books (US-14, KAN-48).

## What Changes

- PostgreSQL `import_jobs` + in-process background worker
- `POST /v1/import/goodreads` returns 202 with `job_id`
- `GET /v1/import/jobs/:jobId` exposes progress and final result
- `CatalogRateLimiter` + exponential backoff on catalog HTTP calls

Non-goals: Redis/Bull, progress UI (KAN-52).

## Capabilities

### New Capabilities

- `import-background-jobs`: async Goodreads import jobs with progress API.

## Impact

- Backend import module, catalog clients, `docs/api-spec.yml`, `docs/data-model.md`
