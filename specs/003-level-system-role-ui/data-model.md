# Data Model: Level System

## Entities

### TrainingLevel

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID (PK) | Auto-generated | |
| name | String | Unique, NOT NULL | One of: Principiante, Básico, Intermedio, Avanzado, Experto |
| color | String (hex) | NOT NULL | e.g., "#4A90D9" |
| sort_order | Int | NOT NULL | 1-5, ascending progression |

**Relationships**:
- A Level has many Users (Coachees) via `User.level_id`
- A Level has many TrainingClasses via `TrainingClass.level_id`
- A Level has many RecurrenceSeries via `RecurrenceSeries.level_id`

**Immutability**: Levels are seeded once via `prisma/seed.ts` and never modified. No create/update/delete endpoints exist.

### User (Coachee) — level reference

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| level_id | UUID (FK → Level.id) | Nullable | NULL means no level assigned |

**Validation**: `level_id` must reference an existing Level. Set via `PATCH /coachees/:id/level`.

### SecurityAuditLog — level change record

| Field | Type | Example |
|-------|------|---------|
| actor_id | UUID | Admin or Coach who performed the change |
| action | String | `"LEVEL_CHANGE"` |
| resource | String | `"COACHEE"` |
| resource_id | UUID | Coachee's user ID |
| outcome | String | `"SUCCESS"` |

## State Transitions

**Level Assignment**:
1. Admin/Coach views Coachee profile
2. Selects new level from dropdown
3. Sends `PATCH /api/v1/coachees/:id/level` with `{ levelId }`
4. Backend validates level exists, updates `User.level_id`, writes audit log
5. Coachee sees updated level on next page load

No state machine — level can be changed to any of the 5 levels at any time.

## Identity & Uniqueness

- Level names are unique (enforced by Prisma schema `@unique`)
- Sort order values must be unique (enforced at application level via seed — no duplicates in the fixed set of 5)
- A Coachee has at most one level (simple FK, no join table)
