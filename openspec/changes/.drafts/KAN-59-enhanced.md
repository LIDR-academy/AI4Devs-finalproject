## Original

**KAN-59**: Create `genres` table, migrate `books.genre` (free text) → `books.genre_id` (FK), seed 7 default genres on user registration.

## Enhanced

### Schema

- `genres`: id, user_id, name (100), is_default, timestamps
- Unique `(user_id, lower(name))`
- `books.genre_id` FK → genres, ON DELETE SET NULL
- Drop `books.genre` after data migration

### Migration

1. Create `genres` + `books.genre_id`
2. Seed 7 defaults for existing users: Fantasía, Thriller, Ciencia ficción, Romance, Histórica, Ficción, No ficción
3. Insert distinct legacy `books.genre` values per user (is_default=false when custom)
4. Link `books.genre_id`
5. Drop `books.genre`

### Backend

- `GenresModule` + `GenresService` (seed + findOrCreateByName)
- Hook `UsersService.findOrCreateByEmail` → `seedDefaultsForUser`
- `BooksService`: resolve `dto.genre` → `genreId`; API still exposes `genre` string from relation
- `StatsService`: genre distribution via `genres.name` join
- `ImportCatalogEnrichmentService`: set genre via GenresService

### API contract (unchanged for KAN-59)

- Request/response still use `genre` string; `genre_id` in API is KAN-60+

### Tests

- `genres.service.spec.ts` — seed once per user
- `books.integration-spec.ts` — genre persist via POST/PATCH
- Update import enrichment specs

### Docs

- Update `docs/data-model.md`
