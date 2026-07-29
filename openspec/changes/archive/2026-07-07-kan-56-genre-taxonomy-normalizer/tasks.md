## 1. Normalizer

- [x] 1.1 Add `genre-normalizer.map.ts` with taxonomy keyword rules
- [x] 1.2 Add `GenreNormalizerService` with deterministic rule priority

## 2. Integration

- [x] 2.1 Inject normalizer into `CatalogService`
- [x] 2.2 Normalize search and lookup outputs
- [x] 2.3 Normalize Google Books metadata fallback in `BooksService`

## 3. Tests

- [x] 3.1 Add `genre-normalizer.service.spec.ts`
- [x] 3.2 Update `catalog.service.spec.ts` for taxonomy behavior
- [x] 3.3 Run targeted backend tests
