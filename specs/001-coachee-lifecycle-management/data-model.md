# Data Model: Coachee Lifecycle Management

**Phase**: 1 — Design & Contracts
**Date**: 2026-07-13

## Entities

### Coachee (Domain Entity)

Coachee is a domain entity that wraps and restricts the `User` model to the `COACHEE` role context. It is a pure TypeScript class with no infrastructure dependencies.

**Fields**:

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `id` | `string` (UUID) | Yes | Generated on creation |
| `name` | `string` | Yes | Non-empty, max 255 chars |
| `email` | `string` | Yes | Valid email format, unique across all Users |
| `phone` | `string` | No | Max 20 chars, duplicates allowed |
| `classTypePreference` | `enum('INDIVIDUAL', 'GROUP', 'BOTH', null)` | No | Nullable |
| `status` | `enum('ACTIVE', 'INACTIVE')` | Yes | Default `ACTIVE` |
| `levelId` | `string` (UUID) | No | References Level entity; nullable |
| `additionalInfo` | `string` | No | Free-text notes |
| `createdAt` | `Date` | Yes | Set on creation |
| `updatedAt` | `Date` | Yes | Updated on each modification |

**State Transitions**:

```
ACTIVE ↔ INACTIVE  (via PATCH /coachees/:id/status)
```

### Level (Reference Entity)

Already exists in the system. Referenced by Coachee via `levelId`.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` (UUID) | Primary key |
| `name` | `string` | Level name (Principiante, Básico, Intermedio, Avanzado, Experto) |
| `color` | `string` | Hex color for UI display |
| `sortOrder` | `number` | Ordering index |

### User (Persistence Model — Prisma)

The Prisma `User` model is the persistence representation. Coachee domain entity maps to `User` records with `role = COACHEE`.

```prisma
model User {
  id                   String   @id @default(uuid()) @db.Uuid
  email                String   @unique
  password_hash        String
  name                 String
  phone                String
  role                 UserRole
  status               UserStatus @default(ACTIVE)
  level_id             String?   @db.Uuid
  class_type_preference ClassTypePreference?
  bank_account         String?
  ssn                  String?
  dni                  String?
  additional_info      String?
  created_at           DateTime @default(now())
  updated_at           DateTime @updatedAt
  // relations omitted for brevity
}
```

## Repository Interface

```typescript
interface CoacheeRepository {
  create(data: CreateCoacheeData): Promise<Coachee>;
  findById(id: string): Promise<Coachee | null>;
  findAll(filters: CoacheeFilters): Promise<{ data: Coachee[]; total: number }>;
  update(id: string, data: UpdateCoacheeData): Promise<Coachee>;
  updateStatus(id: string, status: CoacheeStatus): Promise<Coachee>;
  updateLevel(id: string, levelId: string): Promise<Coachee>;
}
```

## Validation Rules

| Field | Validation | Error Code |
|-------|-----------|------------|
| `name` | Required, non-empty, max 255 chars | `VALIDATION_ERROR` |
| `email` | Required, valid email format, unique | `VALIDATION_ERROR` / `CONFLICT` |
| `phone` | Optional, max 20 chars | `VALIDATION_ERROR` |
| `levelId` | Optional on create, must reference existing Level | `VALIDATION_ERROR` |
| `classTypePreference` | Must be valid enum value if provided | `VALIDATION_ERROR` |
| `status` | Must be `active` or `inactive` | `VALIDATION_ERROR` |
