## Why

Bibliographic metadata (title, authors, cover, page count, ISBN, provenance) is duplicated in every user's `books` row today, and catalog APIs (Open Library, Google Books) are called repeatedly for the same edition. A shared catalog with per-user library links and sparse overrides reduces external API usage, eliminates redundant storage, and still lets each reader personalize metadata they edit—without turning the product into a social network.

## What Changes

- Introduce **`catalog_editions`**: global, user-agnostic bibliographic records (including cover URL) keyed by ISBN and/or provider identity.
- Refactor **`books`** into a **user library link** (`user_books` conceptually): `user_id` + `catalog_edition_id` + user-only fields (`notes`, `genre_id`, `audience_id`).
- Introduce **`user_book_overrides`**: sparse nullable columns for bibliographic fields the user edited; unset columns inherit from `catalog_editions`.
- Add **`BookMetadataResolver`**: single backend layer that merges catalog + overrides for every read path (list, detail, stats, TBR display, import).
- **Catalog search** checks the local catalog before calling external APIs; new API hits are upserted into `catalog_editions`.
- **Book create** upserts or reuses a catalog edition, then links the user library row—no duplicate API call when the edition already exists.
- **Book patch** writes bibliographic changes to overrides (reverts override when value matches catalog); never mutates shared catalog from user edits.
- **Goodreads import / enrichment** resolves metadata from `catalog_editions` first, calling APIs only on cache miss.
- **BREAKING (internal schema)**: `books` bibliographic columns move to `catalog_editions` + `user_book_overrides`; migration backfills existing data.
- **Non-breaking (API)**: `BookDto` shape stays the same (effective/merged values); optional fields `catalog_edition_id` and `has_overrides` may be added.

## Capabilities

### New Capabilities

- `shared-catalog-editions`: Shared `catalog_editions` table, upsert/dedup rules, DB-first catalog lookup, and persistence of API imports for reuse across users.
- `user-book-overrides`: Sparse per-user bibliographic overrides, effective-metadata resolution, and revert-on-match semantics when a user edit equals the catalog value.

### Modified Capabilities

- `book-create`: Create flow upserts/reuses `catalog_editions` and links a user library row; duplicate detection uses `(user_id, catalog_edition_id)`.
- `book-patch`: Bibliographic PATCH writes to `user_book_overrides`; shared catalog is not mutated by user edits.
- `catalog-search`: Search queries local `catalog_editions` before external APIs; persists new editions on API hit.
- `import-isbn-enrichment`: Enrichment checks `catalog_editions` by ISBN before calling catalog APIs.
- `import-title-author-enrichment`: Title/author enrichment checks local catalog before external lookup.
- `book-list-reading-fields`: List/detail responses expose effective metadata (override > catalog) via the resolver.

## Impact

- **Database**: New tables `catalog_editions`, `user_book_overrides`; migration from current `books` layout; indexes on ISBN and `(data_source, external_provider_id)`.
- **Backend**: `backend/src/books/` (entities, `BooksService`, DTO mapping), `backend/src/books/catalog/` (`CatalogService`), `backend/src/import/goodreads/` (enrichment processor), `backend/src/stats/stats.service.ts`, `backend/src/lists/tbr.service.ts`.
- **API docs**: `docs/data-model.md`, `docs/api-spec.yml` (optional DTO fields).
- **Frontend**: Minimal if `BookDto` effective shape is unchanged; optional UI for `has_overrides` later.
- **Tests**: Unit tests for resolver and upsert; integration tests for two users sharing one edition and override precedence.
- **Non-goals**: Shared user genres/audiences/formats; binary cover storage (URLs only in MVP); propagating user overrides back to the shared catalog; cross-user visibility of libraries.
