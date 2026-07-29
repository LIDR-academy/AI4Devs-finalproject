## 1. Google Books client

- [x] 1.1 Add `lookupGenreByIsbn(isbn)` returning first category or null

## 2. Catalog service

- [x] 2.1 `fillGenreFromGoogleBooksIfMissing` with 3s timeout and skip rules
- [x] 2.2 Apply in `search()` for OL results
- [x] 2.3 Apply in `mergeProviderLookups` when genre still null

## 3. Book create

- [x] 3.1 `BooksService.resolveMetadata` uses catalog genre fallback for OL

## 4. Tests

- [x] 4.1 Unit tests for three BDD scenarios in `catalog.service.spec.ts`
- [x] 4.2 `npm test` in backend
