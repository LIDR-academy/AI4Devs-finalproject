## Why

After KAN-54, some Open Library editions still lack genre. Work-level `subjects` from `/works/{key}.json` are a last-resort fallback (KAN-53 Option A).

## What Changes

- `OpenLibraryEnrichmentService.lookupGenreFromProviderId` — resolve work from work/edition keys, return first subject
- `CatalogService` chains GB (KAN-54) then OL work when genre still null
- `BooksService` applies genre fallbacks in order B → A; OL enrichment only for `page_count`

Non-goals: genre taxonomy normalization (KAN-56).

## Capabilities

### New Capabilities

- `catalog-ol-work-genre-fallback`: OL work subjects after GB miss.

## Impact

- `OpenLibraryEnrichmentService`, `CatalogService`, `BooksService`, tests
