# Tasks: KAN-59 genres data model

## 1. Schema

- [x] 1.1 Genre entity + migration (table, genre_id, data migration, drop genre column)
- [x] 1.2 GenresModule + GenresService (seed, findOrCreateByName)

## 2. Integration

- [x] 2.1 UsersService seeds genres on new user
- [x] 2.2 BooksService genre resolution + relations
- [x] 2.3 StatsService genre distribution join
- [x] 2.4 Import enrichment uses GenresService

## 3. Tests & docs

- [x] 3.1 genres.service.spec.ts + books integration genre tests
- [x] 3.2 Update docs/data-model.md
- [x] 3.3 `npm run test:integration` passes
