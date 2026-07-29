# KAN-54 — Google Books genre fallback when Open Library has no subject (enhanced)

## Summary

When Open Library returns catalog metadata without `subject`/genre, call Google Books by ISBN **only** to fill `genre` from `volumeInfo.categories`, without replacing other OL fields. Skip when the primary source is already Google Books.

## Scope

- `CatalogService.search()` — enrich OL hits missing genre before returning
- `CatalogService.mergeProviderLookups()` — after parallel ISBN/title lookup, GB genre-only if still empty
- `GoogleBooksClient.lookupGenreByIsbn()` — focused ISBN query returning category only
- `BooksService.resolveMetadata()` — delegate OL genre gap to `CatalogService` on book create
- Short timeout (~3s); failures leave `genre: null` (KAN-55 next)

## Out of scope

- Genre normalization (KAN-56)
- OL work subjects fallback (KAN-55)

## Tests

- Unit: `CatalogService` — OL no subject + GB category; OL no subject + GB miss; OL with subject → no GB genre call
- Unit: `BooksService` or integration stub for create path when genre filled via fallback
