## Original

**KAN-65** — [Audiencia 1/5] Modelo de datos: tabla audiences + books.audience_id + seed por defecto

**Objective:** Create the `audiences` table and add `books.audience_id`.

**Technical tasks:**
- TypeORM migration: `audiences` table (`id` UUID PK, `user_id` FK NOT NULL, `name` VARCHAR(100) NOT NULL, `is_default` BOOLEAN DEFAULT false, `created_at`, `updated_at`), unique index `(user_id, lower(name))`.
- Add `books.audience_id` UUID NULL, FK → `audiences.id`, `ON DELETE SET NULL`.
- Auto-seed on new user registration: Adulto, Juvenil, Infantil (`is_default = true`).

**Acceptance (BDD):** New user account → audience list contains Adulto, Juvenil, Infantil.

**Tests:** Unit — seed runs once per new user. Migration — `books.audience_id` nullable; existing books remain NULL.

**Parent:** KAN-64 (configurable audience epic, phase 8).

## Enhanced

### Scope (KAN-65 only)

Backend data layer for user-configurable audiences (KAN-64 subtask 1/5). **No REST CRUD** (KAN-66), **no book form selector** (KAN-67), **no stats changes** (KAN-69).

**Coexistence note:** `books.audience` (enum `young_adult` | `new_adult` | `adult`, KAN-35) remains unchanged. This ticket adds the parallel `audiences` table + `books.audience_id` FK. Later subtasks migrate UI and stats to the configurable list.

### Data model

**Table `audiences`**

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, `gen_random_uuid()` |
| user_id | UUID | FK → `users.id` ON DELETE CASCADE, NOT NULL |
| name | VARCHAR(100) | NOT NULL |
| is_default | BOOLEAN | NOT NULL DEFAULT false |
| created_at | TIMESTAMPTZ | NOT NULL |
| updated_at | TIMESTAMPTZ | NOT NULL |

**Index:** `UNIQUE (user_id, lower(name))` — case-insensitive name uniqueness per user.

**Column `books.audience_id`**

| Column | Type | Constraints |
|--------|------|-------------|
| audience_id | UUID | NULL, FK → `audiences.id` ON DELETE SET NULL |

Existing books: all `audience_id` NULL after migration (additive).

### Default seed

On **first** user creation (`UsersService.findOrCreateByEmail` when user did not exist), insert three audiences:

| name | is_default |
|------|------------|
| Adulto | true |
| Juvenil | true |
| Infantil | true |

Seed MUST be idempotent: if user already has any audience row, do not insert again.

### Files / modules

| Path | Change |
|------|--------|
| `backend/src/audiences/entities/audience.entity.ts` | New TypeORM entity |
| `backend/src/audiences/audiences.constants.ts` | `DEFAULT_AUDIENCE_NAMES` |
| `backend/src/audiences/audiences.service.ts` | `seedDefaultsForUser(userId)`, `hasAudiences(userId)` |
| `backend/src/audiences/audiences.module.ts` | Nest module, export service |
| `backend/src/audiences/audiences.service.spec.ts` | Unit tests |
| `backend/src/users/users.service.ts` | Call seed after new user save |
| `backend/src/users/users.module.ts` | Import `AudiencesModule` |
| `backend/src/books/entities/book.entity.ts` | Add `audienceId` + `ManyToOne` Audience |
| `backend/src/migrations/1754000000000-CreateAudiences.ts` | Migration |
| `backend/src/app.module.ts` | Register `Audience` entity |
| `backend/src/data-source.ts` | Register `Audience` entity |
| `docs/data-model.md` | Document `audiences` + `books.audience_id` |

**Out of scope:** `docs/api-spec.yml` (no new endpoints), frontend, stats, existing `books.audience` enum removal.

### Definition of done

1. Migration runs cleanly on DB with existing books.
2. New dev-login user gets three default audiences exactly once.
3. Re-login / `findOrCreateByEmail` for existing user does not duplicate seed.
4. Unit tests pass (`audiences.service.spec.ts`).
5. `docs/data-model.md` updated.

### Non-functional

- Seed runs in same request as user creation (no background job).
- English code/comments; Spanish display names in seed data per product spec.
