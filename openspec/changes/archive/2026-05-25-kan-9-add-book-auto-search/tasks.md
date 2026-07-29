## 1. Project scaffolding

- [x] 1.1 Scaffold NestJS API in `backend/` with global prefix `v1` (routes `/v1/...`), JWT auth module, and TypeORM + PostgreSQL connection
- [x] 1.2 Scaffold React + TypeScript SPA in `frontend/` with router, API client base URL env, and Book Tracker route placeholder
- [x] 1.3 Add TypeORM migration for `books` and `reading_records` per README §3 (including `data_source` CHECK and FK `user_id`)
- [x] 1.4 Document `.env.example` (`DATABASE_URL`, `JWT_SECRET`, optional `GOOGLE_BOOKS_API_KEY`)

## 2. Catalog search (backend)

- [x] 2.1 Define `CatalogEdition` DTO and `CatalogSearchResponse` aligned with design §4
- [x] 2.2 Implement `OpenLibraryClient` mapping search JSON to `CatalogEdition[]` (cover URL, ISBN, authors, page count, genre)
- [x] 2.3 Implement `GoogleBooksClient` with same mapping contract
- [x] 2.4 Implement `CatalogService` with sequential fallback (OL first; GB once on empty/error; timeout ~3s)
- [x] 2.5 Add `GET /v1/books/catalog/search` with JWT guard, `q` validation (min 2 chars), and `limit` cap
- [x] 2.6 Unit tests: OL returns data → GB not called; OL empty → GB called once; both empty → empty items

## 3. Book create (backend)

- [x] 3.1 Implement `Book` and `ReadingRecord` entities and repositories
- [x] 3.2 Implement `CreateBookDto` with `class-validator` matching README `CreateBookRequest`
- [x] 3.3 Implement `BooksService.create` (persist book + `reading_records.status = pendiente`, user scoping)
- [x] 3.4 Add duplicate check (`isbn_13` or `data_source` + `external_provider_id`) → HTTP 409
- [x] 3.5 Add `POST /v1/books` returning `BookCreatedResponse` (201)
- [x] 3.6 Integration test: authenticated POST creates book and `pendiente` reading record

## 4. Add book UI (frontend)

- [x] 4.1 Build Book Tracker page shell with table/list of user's books (`GET` list endpoint or stub until UC-09)
- [x] 4.2 Add «Añadir libro» button opening `AddBookModal` (KAN-9 escenario 1)
- [x] 4.3 Implement debounced search input calling catalog search API; show loading and error states
- [x] 4.4 Render result cards with cover, title, author, genre, pages, ISBN; support row selection (escenario 2)
- [x] 4.5 Wire «Guardar» to `POST /v1/books` with selected `CatalogEdition` mapped to create payload
- [x] 4.6 On success: close modal, invalidate/refetch tracker list; show new row with portada, autora, páginas, género (escenario 3)
- [x] 4.7 Handle 409 duplicate with user-visible message

## 5. Verification and docs

- [x] 5.1 Manual test checklist mapped to KAN-9 three BDD scenarios and UC-01 happy path
- [ ] 5.2 Optional Playwright E2E against real catalog API (no catalog mock): open modal → search known title → save → assert row visible
- [ ] 5.3 Link implementation PR to Jira KAN-9 and move ticket when acceptance criteria pass
