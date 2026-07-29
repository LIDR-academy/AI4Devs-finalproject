# Design: Genres Settings CRUD (KAN-60)

## Approach

Mirror formats/audiences Settings pattern:

1. Controller JWT-scoped to `user_id`
2. `createForUser` rejects duplicates with 409 (unlike `findOrCreateByName` used by import)
3. Delete removes genre row; `books.genre_id` SET NULL via FK
4. UI: list + add form + Eliminar (immediate; confirmation is KAN-62)

## Non-goals

- Rename, affected-books preview, book modal selector
