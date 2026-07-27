## Original

**KAN-77**: Backend — cover search by title/author for a saved book.

Expose cover search for edit context: given a saved `bookId`, search by title/author (reusing `CatalogService`) and return covers from results.

**Technical tasks:**
- `GET /v1/books/{bookId}/cover-search?q=` — reuses `CatalogService.search` (OL → GB fallback); default query = saved book `title + authors`; optional `q` override.
- For each search result, resolve covers via existing `GET /v1/books/catalog/covers` logic on that edition's `data_source`/`external_provider_id`.
- Combined list per edition (max 12 covers each).
- Empty search or no covers → 200 with empty list.
- JWT + book ownership.

**BDD:** Saved book triggers search; empty when no covers. **Tests:** unit for service reuse; integration for ownership 404.

## Enhanced

### Endpoint

`GET /v1/books/{bookId}/cover-search?q={optional}`

| Param | Behavior |
|-------|----------|
| `bookId` | UUID; must belong to authenticated user → 404 if not |
| `q` | Optional; min 2 chars when provided; defaults to `{title} {authors}` from saved book |

### Response

```json
{
  "query": "Fourth Wing Rebecca Yarros",
  "source": "open_library",
  "items": [
    {
      "title": "...",
      "authors": "...",
      "data_source": "open_library",
      "external_provider_id": "/works/OL...",
      "cover_image_url": "https://...",
      "covers": [{ "id": "1", "url": "...", "label": null }],
      "default_cover_id": "1"
    }
  ]
}
```

Only editions with at least one resolved cover appear in `items`. If search returns nothing or all editions lack covers → `items: []`, HTTP 200.

### Backend files

- `backend/src/books/catalog/book-cover-search.service.ts` (new) — orchestrates `CatalogService` + `EditionCoversService`
- `backend/src/books/dto/book-cover-search.dto.ts` (new) — query + response DTOs
- `backend/src/books/books.controller.ts` — route handler
- `backend/src/books/books.module.ts` — register service
- `backend/src/books/catalog/book-cover-search.service.spec.ts` (unit)
- `backend/test/book-cover-search.integration-spec.ts` (integration with mocked catalog)

### Docs

- `docs/api-spec.yml` — new path + schemas

### Definition of done

- [ ] Endpoint with ownership, default query, optional `q`
- [ ] Reuses catalog search + edition covers (max 12 per edition)
- [ ] Empty list on no results / no covers
- [ ] Unit + integration tests
- [ ] API spec updated
