# Proposal: Genre selector in book modals (KAN-61)

## Why

Users should pick genres from their configured list instead of free text, consistent with audiences.

## What changes

- API create/patch accept `genre_id`; responses include `genre_id` + display `genre`
- `GenreSelect` in BookFormModal and AddBookModal

## Capabilities

### New

- `book-genre-selector` — closed genre select in add/edit flows

### Modified

- `book-create` / `book-patch` — `genre_id` instead of string `genre` on write

## Impact

- Backend book DTOs/service; frontend forms; api-spec
