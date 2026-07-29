## Why

Readers need a personal, configurable audience taxonomy (Adulto / Juvenil / Infantil) to classify books manually (KAN-64). Before Settings CRUD and book selectors (KAN-66–67), the platform needs a persistent `audiences` table, a nullable FK on books, and default seed rows for every new account.

## What Changes

- Add `audiences` table (user-scoped, unique name per user case-insensitively).
- Add nullable `books.audience_id` FK with `ON DELETE SET NULL`.
- Seed three default audiences when a new user is created via dev-login registration path.
- Add `AudiencesModule` with idempotent seed service and unit tests.
- Update `docs/data-model.md`.

**Non-breaking:** Existing `books.audience` enum column (KAN-35) is unchanged. No new REST endpoints in this ticket.

## Capabilities

### New Capabilities

- `user-audiences`: User-owned audience list persistence, default seed on account creation, and `books.audience_id` foreign key.

### Modified Capabilities

- _(none — book-audience enum API/UI unchanged until later KAN-64 subtasks)_

## Impact

- **Backend:** new `audiences` module, migration, `UsersService` hook, `Book` entity FK.
- **Database:** new table + column; existing books keep `audience_id` NULL.
- **API / frontend:** no changes in this ticket.
- **UC:** foundation for UC-01 (manual book metadata) and UC-07 (stats by audience) in follow-up tickets.
