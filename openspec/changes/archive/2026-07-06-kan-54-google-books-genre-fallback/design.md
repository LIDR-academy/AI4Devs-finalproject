## Decisions

1. **`GoogleBooksClient.lookupGenreByIsbn`** — wraps existing volume search; returns first category only.
2. **`CatalogService.fillGenreFromGoogleBooksIfMissing`** — skips `google_books` source and editions that already have genre.
3. **Timeout** — 3s via `Promise.race` in `CatalogService` (no save blocking).
4. **Book create** — `BooksService.resolveMetadata` calls `CatalogService` after OL enrichment when genre still null.
