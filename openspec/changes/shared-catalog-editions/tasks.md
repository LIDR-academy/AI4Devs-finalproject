# Tasks — shared-catalog-editions

OpenSpec change: `shared-catalog-editions`  
Related: UC-01 (add book), US-14 (Goodreads import)

## 0. Setup: Create Feature Branch (MANDATORY - FIRST STEP)

- [x] 0.1 Create feature branch `feature/shared-catalog-editions` from `main`
- [x] 0.2 Confirm OpenSpec change folder `openspec/changes/shared-catalog-editions/` is complete

## 1. Data model and migration (TDD-first)

- [x] 1.1 Add failing unit tests for `BookMetadataResolver` (override > catalog, revert-on-match, `has_overrides`)
- [x] 1.2 Add `CatalogEdition` entity at `backend/src/books/entities/catalog-edition.entity.ts`
- [x] 1.3 Add `UserBookOverride` entity at `backend/src/books/entities/user-book-override.entity.ts`
- [x] 1.4 Add migration: create `catalog_editions`, `user_book_overrides`, add `books.catalog_edition_id`
- [x] 1.5 Implement backfill in migration (group by ISBN / provider identity; write overrides for divergent rows)
- [x] 1.6 Add second migration to drop bibliographic columns from `books` after backfill verified
- [x] 1.7 Register entities in `books.module.ts`, `app.module.ts`, `data-source.ts`
- [x] 1.8 Run `cd backend && npm run migration:run` and verify new tables + backfilled links

## 2. Catalog edition service

- [x] 2.1 Add failing tests for `CatalogEditionsService` upsert/dedup (ISBN, provider identity)
- [x] 2.2 Implement `CatalogEditionsService` at `backend/src/books/catalog/catalog-editions.service.ts`
- [x] 2.3 Add local search methods (ISBN exact, title/author ILIKE) used by `CatalogService`

## 3. Book metadata resolver

- [x] 3.1 Implement `BookMetadataResolver` at `backend/src/books/book-metadata.resolver.ts`
- [x] 3.2 Refactor `BooksService.toBookDto` / list queries to use resolver (join catalog + overrides)
- [x] 3.3 Add optional `catalog_edition_id` and `has_overrides` to `BookDto` in `dto/book-response.dto.ts`

## 4. Book create and patch

- [x] 4.1 Add failing integration tests: two users, same edition; override precedence; duplicate by catalog edition
- [x] 4.2 Refactor `BooksService.create` — upsert catalog, link `books`, skip API when local hit
- [x] 4.3 Refactor `BooksService.update` — write overrides; revert when value matches catalog
- [x] 4.4 Update `assertNotDuplicate` to use `(user_id, catalog_edition_id)`

## 5. Catalog search DB-first

- [x] 5.1 Add failing tests in `catalog.service.spec.ts` for local-before-external search
- [x] 5.2 Refactor `CatalogService.search` and `lookupByIsbn` to check `catalog_editions` first
- [x] 5.3 Upsert external hits into `catalog_editions`; include `catalog_edition_id` in search DTO when persisted

## 6. Import enrichment alignment

- [x] 6.1 Update `import-catalog-enrichment.service.ts` — local catalog before API
- [x] 6.2 Update `goodreads-import.processor.ts` — link catalog edition on import
- [x] 6.3 Update related specs tests in `goodreads-import.processor.spec.ts` and enrichment specs

## 7. Downstream read paths

- [x] 7.1 Audit and update `stats.service.ts` joins to use effective bibliographic fields (title, genre name, cover)
- [x] 7.2 Verify `tbr.service.ts` book display paths use resolver or pre-joined effective data
- [x] 7.3 Verify genre/audience delete guards count `books` references correctly after refactor

## 8. Frontend (minimal)

- [x] 8.1 Update `frontend/src/api/types.ts` with optional `catalog_edition_id` and `has_overrides` if exposed
- [x] 8.2 Smoke-test Book Tracker list/create/edit flows (no UI change required if DTO shape stable)

## 9. Review and Update Existing Unit Tests (MANDATORY)

- [x] 9.1 Review and update `books.service` tests, `catalog.service.spec.ts`, import enrichment specs
- [x] 9.2 Update `backend/test/books.integration-spec.ts` for shared catalog scenarios

## 10. Run Unit Tests and Verify Database State (MANDATORY)

- [x] 10.1 Capture pre-test DB snapshot (catalog_editions count, books with catalog_edition_id)
- [x] 10.2 Run targeted tests: `cd backend && npm test -- books catalog import`
- [x] 10.3 Run full backend suite: `cd backend && npm test`
- [x] 10.4 Verify post-test DB state; restore if tests left unintended rows
- [x] 10.5 Create report `openspec/changes/shared-catalog-editions/reports/YYYY-MM-DD-step-10-unit-test-and-db-verification.md`

## 11. Manual Endpoint Testing with curl (MANDATORY - AGENT MUST EXECUTE)

- [x] 11.1 Dev-login; create book from catalog; confirm `catalog_editions` row exists
- [x] 11.2 Second user adds same ISBN — confirm no duplicate catalog row; no redundant API call (check logs)
- [x] 11.3 PATCH title for user B; confirm user A still sees catalog title
- [x] 11.4 Catalog search for known ISBN returns local result
- [x] 11.5 Document results in report under `openspec/changes/shared-catalog-editions/reports/`

## 12. E2E / build verification (if applicable)

- [x] 12.1 Run `cd frontend && npm run build`
- [x] 12.2 Manual smoke: add book, edit metadata, verify Book Tracker and Home display effective values

## 13. Update Technical Documentation (MANDATORY)

- [x] 13.1 Update `docs/data-model.md` — `catalog_editions`, `user_book_overrides`, refactored `books`
- [x] 13.2 Update `docs/api-spec.yml` — optional DTO fields; catalog search `catalog_edition_id`
- [x] 13.3 Update catalog section in `docs/standards/backend-standards.md` (persisted catalog, resolver pattern)

## 14. Wrap-up

- [x] 14.1 Mark all tasks complete in this file
- [x] 14.2 Run `openspec validate shared-catalog-editions` (if available) or `openspec status --change shared-catalog-editions`
