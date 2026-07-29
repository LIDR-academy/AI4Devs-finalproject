## Original

Enrich by **ISBN** reusing KAN-9 catalog (Open Library + Google Books): recover `cover_image_url` and genre. Idempotent (do not re-enrich already complete books).

## Enhanced

### Scope (KAN-49)

ISBN-path enrichment only (title+author fallback is KAN-50; async queue is KAN-51).

### Behavior

- After Goodreads import persists a book with `isbn13` or `isbn10`, call catalog lookup.
- `CatalogService.lookupByIsbn`: query both providers; cover from OL preferring GB fallback; **genre from Google Books only** (US-14).
- `ImportIsbnEnrichmentService.enrichBook`: skip when both `cover_image_url` and `genre` are set; fill only missing fields; failures are logged, import continues.
- Idempotent on re-import skip path (duplicates never re-enriched).

### Files

- `catalog.service.ts` — `lookupByIsbn`
- `import/goodreads/import-isbn-enrichment.service.ts` (+ spec)
- `goodreads-import.processor.ts` — call after persist
- `books.module.ts` / `import.module.ts` — wire CatalogService

### Tests

- Catalog ISBN lookup unit tests
- Enrichment idempotency + partial fill tests
- Processor spec updated with enrichment mock
