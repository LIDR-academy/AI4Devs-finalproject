## 1. Open Library enrichment

- [x] 1.1 `lookupGenreFromProviderId` with work/edition resolution
- [x] 1.2 Unit tests for work, edition, and miss paths

## 2. Catalog service

- [x] 2.1 Chain `fillMissingGenre` (GB then OL work) in search and lookup
- [x] 2.2 `resolveMissingGenre` public API

## 3. Book create

- [x] 3.1 Reorder `BooksService.resolveMetadata` (B → A for genre)

## 4. Verification

- [x] 4.1 `catalog.service.spec.ts` + enrichment service tests
- [x] 4.2 `npm test` in backend
