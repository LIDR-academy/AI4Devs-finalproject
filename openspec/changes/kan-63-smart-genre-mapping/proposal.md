# Proposal: KAN-63 smart genre mapping

## Why

External genres (catalog, Goodreads enrichment) must map to each user's configurable genre list instead of a fixed taxonomy. Unmatched values should prompt the user rather than silently leaving books without a genre.

## What changes

- User-scoped genre matcher with synonym support
- Match API for catalog and import flows
- Catalog add + Goodreads import preview/resolution UX
- Import enrichment respects user resolutions (assign / create / skip)

## Capabilities

### New Capabilities

- `smart-genre-mapping`: matcher, APIs, catalog/import resolution UX

### Modified Capabilities

- `catalog-genre-taxonomy-normalization`: superseded by user-scoped matching (raw catalog genres preserved)

## Impact

- `backend/src/genres/`, `backend/src/books/catalog/`, `backend/src/import/`
- `frontend/src/components/AddBookModal.tsx`, `frontend/src/pages/ImportExportPage.tsx`
- `docs/api-spec.yml`
