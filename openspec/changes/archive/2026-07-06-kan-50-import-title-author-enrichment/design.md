## Context

KAN-49 enriches by ISBN. Goodreads exports often omit ISBN; catalog text search already exists for manual add (KAN-9).

## Decisions

1. **No-ISBN only** — title+author fallback runs only when both ISBN fields are null.
2. **Same metadata rules** — OL cover preferred, GB genre only; audience never set.
3. **Best-effort match** — first catalog hit per provider query (limit 1).
4. **Failure tracking** — `ENRICHMENT_CATALOG_MISS` when lookup returns no usable metadata after attempt.

## Files

- `import-catalog-enrichment.service.ts` (rename from ISBN-only service)
