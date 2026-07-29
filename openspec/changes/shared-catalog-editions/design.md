## Context

Today each user's library stores full bibliographic metadata on `books` (`title`, `authors`, ISBNs, cover URL, page count, provenance). Catalog search (`GET /v1/books/catalog/search`) and enrichment (Goodreads import, create-time metadata resolution) call Open Library and Google Books on every request, even for editions already seen by other users. User edits via `PATCH /v1/books/{bookId}` overwrite the single row, so there is no separation between canonical metadata and personal corrections.

This change introduces a **shared catalog layer** with **per-user library links** and **sparse overrides**, aligned with UC-01 (add book) and US-14 (Goodreads import). Reading state (`reading_records`), TBR (`tbr_entries`), and user taxonomies (`genres`, `audiences`, `formats`) remain user-scoped.

**Current touch points:** `BooksService`, `CatalogService`, `ImportCatalogEnrichmentService`, `GoodreadsImportProcessor`, `StatsService`, `TbrService`.

## Goals / Non-Goals

**Goals:**

- Store canonical bibliographic metadata once in `catalog_editions` (including cover URL).
- Link users to editions via refactored `books` rows (`catalog_edition_id` FK).
- Persist user-specific bibliographic edits in `user_book_overrides` without mutating shared catalog.
- Resolve **effective metadata** (`override ?? catalog`) in one resolver used by all read paths.
- Search and import flows check local catalog before external APIs; upsert new API hits into `catalog_editions`.
- Migrate existing `books` data without losing user-specific divergences.
- Keep public `BookDto` / `BookListItem` shape backward compatible (effective values).

**Non-Goals:**

- Binary cover storage or CDN ingestion (URLs only in MVP).
- Shared user genres, audiences, or formats.
- Propagating user overrides back to `catalog_editions`.
- Cross-user library visibility or social features.
- Changing reading-record, TBR, or goals semantics.

## Decisions

### 1. Three-table model: `catalog_editions` + `books` + `user_book_overrides`

**Choice:** Add `catalog_editions` (shared) and `user_book_overrides` (sparse); refactor `books` to hold `catalog_edition_id` and user-only fields (`notes`, `genre_id`, `audience_id`).

**Alternatives considered:**

| Alternative | Rejected because |
|-------------|------------------|
| JSONB `overrides` on `books` | Harder to query/index; sparse columns are clearer for revert-on-match |
| Full Work/Edition normalization (OL model) | Over-engineered for MVP; single edition row matches current `CatalogEditionDto` |
| Rename `books` → `user_books` | Higher churn on FKs; keep table name `books`, change column layout |

**Rationale:** Minimal FK impact — `reading_records.book_id` and `tbr_entries.book_id` keep pointing at `books.id`.

### 2. Effective metadata via `BookMetadataResolver`

**Choice:** Single injectable service merges `catalog_editions` + `user_book_overrides` + user fields on `books` → `BookDto`.

**Rule:** `effective(field) = override.field ?? catalog_edition.field` for bibliographic fields; `notes` / `genre_id` / `audience_id` always from `books`.

**Alternatives:** Inline COALESCE in every query — rejected (duplication, easy to miss a read path).

### 3. Override write semantics on PATCH

**Choice:** When user PATCHes a bibliographic field:

- If new value **equals** catalog value → clear override column (inherit catalog).
- If different → upsert `user_book_overrides`.
- **Never** UPDATE `catalog_editions` from user PATCH.

Setting `cover_image_url: null` stores an explicit override of `null` (user cleared cover) — distinct from "no override" (inherit catalog). Use a sentinel or `cover_cleared` flag only if needed; MVP: nullable override with `has_overrides` computed from any non-null override row existence OR explicit null overrides tracked per-field (document in implementation: use row presence + nullable columns; clearing to null writes override NULL).

Actually for "clear cover" - if user sets null, effective is null. If they revert to catalog, delete override column.

### 4. Catalog dedup and upsert keys

**Priority:**

1. `isbn_13` (partial unique index, WHERE NOT NULL)
2. `(data_source, external_provider_id)` (partial unique, WHERE NOT NULL)
3. On conflict → return existing row (idempotent upsert)

Manual books without ISBN/provider: create a dedicated `catalog_editions` row per manual create (data_source=`manual`, no shared dedup except future enhancement).

### 5. Catalog search: DB-first, then external APIs

**Choice:** `CatalogService.search` queries `catalog_editions` (ISBN exact if query looks like ISBN; else title ILIKE / pg_trgm if extension available, else prefix match). Merge with external results; upsert external-only hits.

**Alternatives:** External-only with write-through on create only — rejected (user requirement: reduce API usage on search too).

### 6. Cover storage

**Choice:** `catalog_editions.cover_image_url` TEXT (external URL), same as today.

**Future:** `catalog_cover_assets` or object storage — out of scope.

### 7. API compatibility

**Choice:** `BookDto` returns effective values; add optional `catalog_edition_id`, `has_overrides`. No breaking JSON renames.

### 8. Migration strategy

1. Create `catalog_editions`, `user_book_overrides`.
2. Add `books.catalog_edition_id` (nullable during backfill).
3. Backfill: group by `isbn_13` or `(data_source, external_provider_id)`; one catalog row per group; link all `books`.
4. Rows diverging from group canonical → create `user_book_overrides` with deltas.
5. Move bibliographic columns off `books` (drop after verification).
6. Down migration restores columns from catalog + overrides (best-effort).

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Concurrent upsert of same edition | Unique indexes + transaction retry on conflict |
| Migration data loss for divergent duplicates | Backfill script compares per-user row vs canonical; write overrides for diffs |
| Missed read path showing catalog instead of effective | Centralize in `BookMetadataResolver`; audit grep for direct column access |
| Stale cover URLs in shared catalog | Accept for MVP; optional refresh job later |
| Manual books without ISBN create many catalog rows | Accept; manual rows are not deduped across users unless ISBN added later |
| pg_trgm extension not in Docker Postgres | Fall back to ILIKE prefix search; document optional extension |

## Migration Plan

1. **Deploy migration** (additive): new tables + `catalog_edition_id` column; no column drops yet.
2. **Run backfill script** in migration or dedicated step.
3. **Deploy application** using resolver (reads effective; writes to new structure).
4. **Verify** integration tests + manual two-user same-edition scenario.
5. **Second migration** drops deprecated bibliographic columns from `books`.
6. **Rollback:** down migration re-adds columns and copies effective values back; keep backup before drop.

## Open Questions

- Enable `pg_trgm` in local Docker Compose for better local search, or ship ILIKE-only first?
- Should catalog search upsert run synchronously on every external hit, or only on user "add to library"? **Proposal:** upsert on create/import always; on search upsert async/deferred is acceptable if documented — **decision for apply:** upsert on search when result is selected is minimum; optional eager upsert on search for top N results.
