## Context

KAN-64 introduces user-configurable audiences. KAN-35 already added a fixed enum `books.audience` (`young_adult` | `new_adult` | `adult`). This ticket lays the relational model (`audiences` + `books.audience_id`) without removing or rewiring the legacy column.

User creation today happens in `UsersService.findOrCreateByEmail` (dev-login MVP).

## Goals / Non-Goals

**Goals:**

- Persist per-user audience rows with case-insensitive unique names.
- Link books to audiences via nullable `audience_id`.
- Auto-seed Adulto, Juvenil, Infantil once per new user.
- Idempotent seed (no duplicates on re-login).

**Non-Goals:**

- REST CRUD (KAN-66), book form selector (KAN-67), delete flow (KAN-68), stats distribution (KAN-69).
- Migrating or removing `books.audience` enum.
- Backfill seed for existing users (can be a follow-up script if needed).

## Decisions

1. **`AudiencesModule`** — dedicated Nest module (`backend/src/audiences/`) exported to `UsersModule`. Mirrors future `formats` / `genres` modules.
2. **Unique index** — `CREATE UNIQUE INDEX ... ON audiences (user_id, lower(name))` in migration (not TypeORM `@Unique` decorator alone) for case-insensitive enforcement.
3. **Seed trigger** — `UsersService.findOrCreateByEmail` after first `save`; calls `AudiencesService.seedDefaultsForUser(userId)` only when `isNewUser`.
4. **Idempotency** — `seedDefaultsForUser` checks `count({ userId }) > 0` before insert; unit-tested.
5. **Default names** — Spanish product labels (`Adulto`, `Juvenil`, `Infantil`) with `is_default = true` per Jira.
6. **FK delete** — `ON DELETE SET NULL` on `books.audience_id` so audience removal (KAN-68) clears book links safely.

## Risks / Trade-offs

- **[Risk] Dual audience fields** (`audience` enum + `audience_id`) until later tickets → Mitigation: document in data model; follow-up subtasks wire UI/stats to `audience_id`.
- **[Risk] Existing users lack seed** → Mitigation: out of scope for KAN-65; KAN-66 Settings CRUD or a one-off script can backfill.
- **[Risk] Seed in user creation path adds latency** → Mitigation: three rows only; acceptable for MVP.

## Migration Plan

1. Run `npm run migration:run` in `backend/`.
2. Deploy backend; new users get seed automatically.
3. Rollback: `migration:revert` drops `audience_id` column and `audiences` table.

## Open Questions

- None for KAN-65 scope.
