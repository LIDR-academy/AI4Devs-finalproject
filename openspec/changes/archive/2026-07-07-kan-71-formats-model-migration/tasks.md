## 1. Data model

- [x] 1.1 Add `Format` entity, constants, and `FormatsModule` + seed service
- [x] 1.2 Add migration `CreateFormats` (table, format_id, data migration, drop read_format)
- [x] 1.3 Add `formatId` on `ReadingRecord`; register `Format` in app/data-source

## 2. Integration hooks

- [x] 2.1 Seed formats in `UsersService.findOrCreateByEmail`
- [x] 2.2 Map API `read_format` via `FormatsService` in books + Goodreads import
- [x] 2.3 Keep stats format distribution working via format_id join

## 3. Tests and docs

- [x] 3.1 `formats.service.spec.ts` + update integration/unit tests
- [x] 3.2 Update `docs/data-model.md`
- [x] 3.3 Run targeted backend tests
