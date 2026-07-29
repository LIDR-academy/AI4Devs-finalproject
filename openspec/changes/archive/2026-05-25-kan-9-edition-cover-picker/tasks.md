## 1. Backend — cover catalog

- [x] 1.1 Define `CoverOptionDto` and `EditionCoversResponseDto` (`covers[]`, `default_cover_id`)
- [x] 1.2 Implement `OpenLibraryCoversService`: resolve covers from work `editions.json` and/or edition `.json`
- [x] 1.3 Implement `GoogleBooksCoversService`: map distinct `imageLinks` from `volumes/{id}`
- [x] 1.4 Implement `EditionCoversService` facade by `data_source` with dedupe and max 12 URLs
- [x] 1.5 Add `GET /v1/books/catalog/covers` with JWT + query validation (`data_source`, `external_provider_id`)
- [x] 1.6 Unit tests: dedupe, cap at 12, empty list, OL work vs GB volume mocks

## 2. Frontend — cover picker step

- [x] 2.1 Add `fetchEditionCovers()` to API client and types
- [x] 2.2 Refactor `AddBookModal` to steps: search → pick cover → save
- [x] 2.3 Create `CoverPicker` grid with selection state and placeholder when empty
- [x] 2.4 Preselect `default_cover_id` from API; pass selected URL into `createBook` payload
- [x] 2.5 Loading/error/retry UX on cover fetch without losing selected edition
- [x] 2.6 Styles aligned with existing modal (Lychee cards, Veranda selection border)

## 3. Verification

- [x] 3.1 Extend `MANUAL-TEST-KAN-9.md` (or add cover section) with escenario: obra popular → varias portadas → elegir una → verificar en tabla
- [x] 3.2 Manual test on Open Library title with known multiple editions (e.g. Harry Potter, 1984)
- [x] 3.3 Note in PR / Jira KAN-9 comment that cover picker is delivered
