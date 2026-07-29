## Why

Some Goodreads rows lack ISBN. US-14 (KAN-48) enriches them via catalog search by title and author. KAN-50 adds that fallback and records enrichment misses for US-15.

## What Changes

- `CatalogService.lookupByTitleAuthor`
- Extend enrichment service (ISBN + title/author paths)
- `enrichment_failed` on import API response

Non-goals: background job (KAN-51), progress UI (KAN-52).

## Capabilities

### New Capabilities

- `import-title-author-enrichment`: title+author catalog fallback for imported books without ISBN.

## Impact

- Backend: `books/catalog`, `import/goodreads/`, `docs/api-spec.yml`
