# Data Model: Coach Lifecycle & Financial Data

## Entities

### Coach (Domain Entity)

```typescript
// src/domain/entities/Coach.ts

export type CoachStatus = "ACTIVE" | "INACTIVE";

export interface CreateCoachData {
  name: string;
  email: string;
  phone?: string | null;
  specialities?: string | null;
  bankAccount: string;   // encrypted at rest
  ssn: string;           // encrypted at rest
  dni: string;           // encrypted at rest
}

export interface UpdateCoachData {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  specialities?: string | null;
}

export class Coach {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
    public readonly phone: string | null,
    public readonly specialities: string | null,
    public readonly status: CoachStatus,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
```

**Note**: The `Coach` entity NEVER contains financial fields (`bankAccount`, `ssn`, `dni`). Financial data is only accessible through the dedicated `GetCoachFinancialData` use case.

### CoachFinancialData (Value Object)

```typescript
export interface CoachFinancialData {
  id: string;
  name: string;
  bankAccount: string;   // decrypted
  ssn: string;           // decrypted
  dni: string;           // decrypted
}
```

### SecurityAuditLog (Prisma Model)

```prisma
model SecurityAuditLog {
  id          String   @id @default(uuid()) @db.Uuid
  actor_id    String   @db.Uuid
  action      String
  resource    String
  resource_id String?
  outcome     String   // "SUCCESS" | "DENIED"
  created_at  DateTime @default(now())

  actor User @relation(fields: [actor_id], references: [id])
}
```

## Relationships

- **Coach** is a projection of the `User` table filtered by `role = COACH`.
- **CoachFinancialData** is derived from the same `User` row — financial fields are on the same record but never exposed through the Coach domain entity.
- **SecurityAuditLog** references the `User` table as the actor.

## Existing Prisma Schema (relevant fields)

The `User` model already contains all needed fields:

| Field | Type | Purpose |
|-------|------|---------|
| `bank_account` | `String?` | Coach bank account (encrypted) |
| `ssn` | `String?` | Coach SSN (encrypted) |
| `dni` | `String?` | Coach DNI (encrypted) |
| `role` | `UserRole` | Set to `COACH` |
| `status` | `UserStatus` | `ACTIVE` / `INACTIVE` |

## Validation Rules

| Field | Rule | Source |
|-------|------|--------|
| name | Required, min 1 char, max 255 | FR-004 |
| email | Required, valid email format, unique | FR-003, FR-004 |
| bank_account | Required | Assumption (required financial data) |
| ssn | Required | Assumption (required financial data) |
| dni | Required | Assumption (required financial data) |
| status | Only valid transitions: ACTIVE↔INACTIVE | FR-009 |

## State Transitions

```
ACTIVE  ←→  INACTIVE
```

Deactivation and activation are idempotent — transitioning to the current state is handled gracefully (no error).
