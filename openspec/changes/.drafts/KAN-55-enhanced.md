# KAN-55 — OL work subjects genre fallback (enhanced)

## Summary

After KAN-54 (Google Books), if `genre` is still null for an Open Library edition, fetch `/works/{key}.json` subjects (resolve edition → work when needed). Raw subject string; normalization is KAN-56.

## Order

1. KAN-54 Google Books by ISBN
2. **This ticket** OL work subjects
3. KAN-56 taxonomy (later)

## Technical

- `lookupGenreFromProviderId(external_provider_id)` on `OpenLibraryEnrichmentService`
- `CatalogService.fillMissingGenre` chains GB + OL work
- `BooksService`: genre via catalog; `enrichEdition` only for `page_count`
