## Why

Goodreads CSV lacks cover and genre. US-14 (KAN-48) enriches imported books via the existing catalog (KAN-9). KAN-49 implements the ISBN lookup path.

## What Changes

- `CatalogService.lookupByIsbn` — OL + Google Books ISBN query
- `ImportIsbnEnrichmentService` — idempotent cover/genre fill on imported books
- Wire enrichment into Goodreads import after each new book save

Non-goals: title+author fallback (KAN-50), background queue/rate limits (KAN-51).

## Capabilities

### New Capabilities

- `import-isbn-enrichment`: ISBN-based catalog enrichment for imported books.

## Impact

- Backend: `books/catalog`, `import/goodreads/`
