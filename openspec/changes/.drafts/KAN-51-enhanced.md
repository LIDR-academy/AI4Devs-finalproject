## Original

Run import + enrichment as a **background job** (queue/worker) with **rate limiting** on external APIs, expose queryable **progress** (processed/total, phase) for US-15 UI. Retries with backoff on transient failures.

## Enhanced

### Scope (KAN-51)

Backend async import pipeline; UI polling is KAN-52.

### API

- `POST /v1/import/goodreads` → **202** `{ job_id, status, phase }` (no longer blocks on import+enrichment).
- `GET /v1/import/jobs/:jobId` → progress + `result` when `completed` (owner only).

### Job model (`import_jobs` table)

- `status`: `queued` | `parsing` | `importing` | `enriching` | `completed` | `failed`
- `phase`: same values while running
- `processed_count`, `total_count`
- `csv_content`, `result` (jsonb), `error_message`

### Worker

- In-process async runner (`IMPORT_JOBS_SYNC=true` for tests).
- Parse → import rows → enrich per row with `CatalogRateLimiter` + catalog retry/backoff.

### Files

- `import-job.entity.ts`, migration, `import-job.service.ts`, `import-job.runner.ts`
- `catalog-rate-limiter.service.ts`, `retry-with-backoff.util.ts`
- Refactor processor progress callback
- Update `docs/api-spec.yml`, integration tests
