## Context

Imported Goodreads books are saved with `cover_image_url` and `genre` null. Catalog clients already support ISBN search queries.

## Decisions

1. **Dual provider ISBN lookup** — always query OL and GB; cover prefers OL, genre from GB only (US-14).
2. **Synchronous enrich on import** — KAN-51 moves to background; acceptable for KAN-49 slice.
3. **Idempotent** — skip when both cover and genre present; never overwrite existing values.
4. **No ISBN** — skip (KAN-50).

## Files

- `catalog-isbn-lookup.types.ts` — result DTO
- `import-isbn-enrichment.service.ts`
