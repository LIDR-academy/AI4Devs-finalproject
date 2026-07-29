## Context

KAN-49/50 enrich each imported book synchronously. Large CSVs (~1167 rows) timeout HTTP clients.

## Decisions

1. **Postgres job table** — no Redis; single-node in-process worker (MVP).
2. **202 Accepted** — upload creates job; worker parses, imports, enriches sequentially.
3. **Rate limit** — `CATALOG_MIN_INTERVAL_MS` (default 250) between catalog lookups.
4. **Retry** — up to 3 attempts with exponential backoff on catalog provider errors.
5. **Sync mode** — `IMPORT_JOBS_SYNC=true` runs worker inline (tests).

## Files

- `import-job.entity.ts`, `import-job.runner.ts`, `catalog-rate-limiter.service.ts`
