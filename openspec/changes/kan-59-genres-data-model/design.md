# Design: Genres data model (KAN-59)

## Pattern

Mirror `audiences` / `formats`: user-owned lookup table, seeded on registration, FK on book with ON DELETE SET NULL.

## Genre resolution

`GenresService.findOrCreateByName(userId, name)`:

1. `seedDefaultsForUser` if needed
2. Case-insensitive lookup
3. Create custom row (`is_default=false`) if missing

`BooksService` maps DTO `genre` string → `genreId`; responses use `genreRef.name`.

## Migration order

Defaults first, then legacy distinct values, then link books, then drop column.
