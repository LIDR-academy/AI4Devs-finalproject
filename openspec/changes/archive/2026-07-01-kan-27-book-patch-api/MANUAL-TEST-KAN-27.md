# Manual test — KAN-27 (book PATCH API)

## Prerequisites

- Backend running with latest migration (`cd backend && npm run migration:run && npm start`).
- Valid JWT (`POST /v1/auth/dev-login`).

## Manual POST (data_source manual)

```bash
curl -X POST http://localhost:3000/v1/books \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Manual Book",
    "authors": "Author Name",
    "data_source": "manual",
    "page_count": 120,
    "genre": "Memoir",
    "publication_year": 2024,
    "audience": "adult",
    "notes": "Gift from friend"
  }'
```

Expect 201, `data_source: manual`, `reading.status: pendiente`.

## PATCH metadata

```bash
curl -X PATCH http://localhost:3000/v1/books/{bookId} \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Revised Title","page_count":130}'
```

Expect 200 with updated fields.

## Validation

- Empty body `{}` → 400
- `page_count: -1` → 400
- Another user's token → 404

## Date coherence (unchanged)

Reading dates still validated on `PATCH /v1/books/{bookId}/reading-record` (422 when finish before start).
