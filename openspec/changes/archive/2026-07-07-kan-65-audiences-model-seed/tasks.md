## 1. Data model (KAN-65)

- [x] 1.1 Add `Audience` entity and `DEFAULT_AUDIENCE_NAMES` constant
- [x] 1.2 Add migration `CreateAudiences` (table + `books.audience_id` + unique index)
- [x] 1.3 Add `audienceId` FK on `Book` entity; register `Audience` in `app.module` and `data-source`

## 2. Seed service

- [x] 2.1 Add `AudiencesModule` + `AudiencesService.seedDefaultsForUser` (idempotent)
- [x] 2.2 Hook seed into `UsersService.findOrCreateByEmail` for new users only

## 3. Tests and docs

- [x] 3.1 Add `audiences.service.spec.ts` (seed once, skip when rows exist)
- [x] 3.2 Update `docs/data-model.md` with `audiences` entity and `books.audience_id`
- [x] 3.3 Run targeted backend tests
