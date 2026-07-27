# Design: Edit book cover search (KAN-78)

## Approach

1. Add `searchBookCovers(bookId, q?)` client calling `GET /v1/books/{bookId}/cover-search`.
2. `BookCoverSearchPanel` — search input, fetch on mount and on Buscar, flatten edition covers into one grid.
3. `BookFormModal` — show **Buscar portada** only when `book` is set (edit mode); toggles panel visibility.
4. Extend `CoverPicker` with `emptyMessage` and `showContinueWithoutCover={false}` for edit empty state.

## Data flow

```
User clicks Buscar portada
  → BookCoverSearchPanel mounts with defaultQuery
  → searchBookCovers(bookId, query)
  → flatten items[].covers with composite ids
  → CoverPicker onSelect → setField('cover_image_url', url)
  → Guardar → patchBook (existing flow)
```

## Edge cases

- Empty API results: ticket message, manual URL unchanged.
- Search errors: inline error, URL field still editable.
- Create mode: no cover search button (add flow unchanged).
