## Original

Fallback enrichment by **title + author** when the book has no ISBN (best-effort). Genre: Google Books primary category; empty if missing. Audience always empty. Register books that could not be enriched for the summary (US-15).

## Enhanced

### Scope (KAN-50)

Title+author catalog fallback when **both** `isbn13` and `isbn10` are absent. ISBN path stays in KAN-49. Async queue (KAN-51) and full progress UI (KAN-52) out of scope.

### Behavior

- After persist, `ImportCatalogEnrichmentService.enrichBook`:
  1. Skip when `cover_image_url` and `genre` already set (idempotent).
  2. If ISBN present → `CatalogService.lookupByIsbn` (unchanged).
  3. Else → `CatalogService.lookupByTitleAuthor(title, authors)` best-effort (OL cover, GB genre).
  4. Fill only missing fields; never set `audience`.
  5. Return `{ book, enrichment_failed }` when catalog miss after an attempted lookup.

- Processor collects `enrichment_failed` rows (`row_number`, `book_id`, code `ENRICHMENT_CATALOG_MISS`) and `meta.enrichment_failed_count`.

### Files

- `catalog.service.ts` — `lookupByTitleAuthor`
- Rename `import-isbn-enrichment.service` → `import-catalog-enrichment.service`
- `goodreads-import.types.ts` — enrichment failed types
- `goodreads-import.processor.ts` — aggregate failures
- `docs/api-spec.yml` — response fields

### Tests

- Catalog title+author lookup unit tests
- Enrichment: no-ISBN path, failure tracking, idempotency
- Processor spec updated
