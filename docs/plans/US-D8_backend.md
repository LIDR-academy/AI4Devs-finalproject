# Backend Implementation Plan: US-D8 Admin Can Act as Mechanic

## Overview

Add **`User.canActAsMechanic`** (default `false`) so active **ADMIN** users with the flag appear in **`GET /api/work-orders/mechanics`** and can be assigned via **`POST /api/work-orders`**. Extend **user create/update** (US-002 / US-D6) to persist the flag with normalization when `role = MECHANIC`. Serialize **`assignedMechanic`** on work order detail for header display.

**Architecture principles:** single eligibility helper; TDD; migration; English API messages; RBAC unchanged (flag does not grant admin routes).

**User story reference:** [`us/Deseables/US-D8-administradores-capacidad-mecanico.md`](../../us/Deseables/US-D8-administradores-capacidad-mecanico.md)

**Prerequisites:** US-002, US-005 on `feature-entrega2-RFM`. **Recommended:** US-D6 `PATCH /users/:id` for editing flag on existing admins.

**Out of scope:** Frontend, new enum role, task-level assignee, post-create reassignment endpoint.

---

## Architecture Context

### Layers

| Layer | Responsibility | US-D8 artifacts |
|-------|----------------|-----------------|
| **Domain** | Assignable mechanic predicate | `assignable-mechanic.ts` |
| **Application** | Mechanics list + create validation + user CRUD | Services |
| **Infrastructure** | New column | Prisma migration |

### Files to add/modify

```
apps/api/prisma/schema.prisma
apps/api/prisma/migrations/<timestamp>_user_can_act_as_mechanic/

apps/api/src/modules/work-orders/
├── utils/assignable-mechanic.ts              # NEW
├── utils/assignable-mechanic.spec.ts         # NEW
├── dto/mechanic-summary.dto.ts               # + role
├── dto/work-order-detail-response.dto.ts     # + assignedMechanic
├── mappers/work-order.mapper.ts              # serialize assignedMechanic
├── work-orders.service.ts                    # findActiveMechanics + create assign check
└── work-orders.service.spec.ts

apps/api/src/modules/users/
├── dto/create-user.dto.ts                    # + canActAsMechanic optional
├── dto/update-user.dto.ts                    # from US-D6 or bridge
├── dto/user-response.dto.ts                  # + canActAsMechanic
└── users.service.ts                          # create/update normalize flag

apps/api/test/work-orders.e2e-spec.ts
apps/api/test/users.e2e-spec.ts
apps/api/README.md
```

### API changes (additive)

| Method | Path | Change |
|--------|------|--------|
| `POST` | `/api/users` | optional `canActAsMechanic` |
| `PATCH` | `/api/users/:id` | optional `canActAsMechanic` (US-D6) |
| `GET` | `/api/users` | response includes flag |
| `GET` | `/api/work-orders/mechanics` | includes eligible ADMINs + `role` |
| `POST` | `/api/work-orders` | assign admin with flag |
| `GET` | `/api/work-orders/:id` | `assignedMechanic` summary |

---

## Implementation Steps

### Step 0: Stay on Entrega 2 Branch

- **Branch (required):** `feature-entrega2-RFM`

---

### Step 1: Prisma Migration

- **File:** `schema.prisma`
- **Action:** Add `canActAsMechanic Boolean @default(false)` to `User`.
- **Implementation Steps:**
  1. Field on model.
  2. Migrate: `ADD COLUMN "canActAsMechanic" BOOLEAN NOT NULL DEFAULT false`.
  3. Optional: set `true` for demo admin in `seed-dev.ts` (document only).
- **Dependencies:** Prisma.

---

### Step 2: Assignable Mechanic Helper — TDD

- **File:** `utils/assignable-mechanic.ts` (new)
- **Function Signatures:**

```typescript
export function isAssignableAsMechanic(user: {
  active: boolean;
  role: UserRole;
  canActAsMechanic: boolean;
}): boolean

export function assignableMechanicWhere(): Prisma.UserWhereInput
```

- **Implementation Steps:**
  1. `isAssignableAsMechanic`: active MECHANIC → true; active ADMIN + flag → true; else false.
  2. `assignableMechanicWhere`: `{ active: true, OR: [{ role: MECHANIC }, { role: ADMIN, canActAsMechanic: true }] }`.
  3. Unit tests: all cases from US (inactive, admin±flag, mechanic).
- **Dependencies:** `@prisma/client`.

---

### Step 3: `findActiveMechanics`

- **File:** `work-orders.service.ts`
- **Action:** Replace strict MECHANIC filter with helper where clause.
- **Implementation Steps:**
  1. Select `{ id, fullName, role }`.
  2. Order `fullName asc`.
  3. Extend `MechanicSummaryDto` with `role: UserRole`.
  4. Unit tests: includes admin+flag; excludes admin without flag; includes mechanic.
- **Dependencies:** Step 2.

---

### Step 4: Create OT Assignment Validation

- **File:** `work-orders.service.ts` `create`
- **Action:** Replace `role: MECHANIC` check with assignable predicate.
- **Implementation Steps:**
  1. When `assignedMechanicId` set: `findFirst({ where: { id, ...assignableMechanicWhere() } })`.
  2. Not found → `400 BadRequestException('Invalid assigned mechanic')`.
  3. Unit tests: admin+flag → 201; admin no flag → 400; mechanic → 201 (regression).
- **Dependencies:** Step 2.

---

### Step 5: Serialize `assignedMechanic` on Detail

- **Files:** `work-order.mapper.ts`, `work-order-detail-response.dto.ts`
- **Action:** Expose nested assignee for FE header.
- **Implementation Steps:**
  1. DTO add:

```typescript
assignedMechanic: { id: string; fullName: string; role: UserRole } | null;
```

  2. Mapper: if `workOrder.assignedMechanic` relation loaded, map fields; else null.
  3. Ensure `WORK_ORDER_DETAIL_INCLUDE` already includes `assignedMechanic` select (extend if only id on FK today).
  4. Unit/mapper test: admin assignee serialized with role ADMIN.
- **Dependencies:** Existing include graph.

---

### Step 6: Users Module — Create + Update

- **Files:** `create-user.dto.ts`, `users.service.ts`, `user-response.dto.ts`; `update-user.dto.ts` if US-D6 present
- **Action:** Persist and normalize flag.
- **Implementation Steps:**
  1. `CreateUserDto`: `@IsOptional() @IsBoolean() canActAsMechanic?: boolean` default false.
  2. On create: if `role === MECHANIC` → force `canActAsMechanic: false`; if ADMIN → use dto or false.
  3. On update (D6): same normalization when role or flag changes.
  4. `toUserResponse` includes `canActAsMechanic`.
  5. Unit tests: create ADMIN true; create MECHANIC with true → stored false.
- **Dependencies:** Step 1, US-D6 optional.

---

### Step 7: E2E Tests

- **Files:** `work-orders.e2e-spec.ts`, `users.e2e-spec.ts`
- **Scenarios:**
  1. Create admin with flag → GET mechanics includes admin.
  2. POST work-order assigned to that admin → 201.
  3. POST with admin without flag → 400.
  4. GET work-order detail shows `assignedMechanic.fullName`.

---

### Step 8: Update Technical Documentation

- **Files:** `apps/api/README.md`, cross-check `readme.md` D8 table
- **Action:** Document flag, mechanics query OR, assignment rules.

---

## Implementation Order

1. Step 0 — Branch
2. Step 1 — Migration
3. Step 2 — Helper + unit tests
4. Step 3 — findActiveMechanics
5. Step 4 — create validation
6. Step 5 — Detail serialization
7. Step 6 — Users create/update
8. Step 7 — E2E
9. Step 8 — Documentation

---

## Testing Checklist

- [ ] Helper predicate matrix green
- [ ] Mechanics list includes/excludes correctly
- [ ] Create assign admin±flag
- [ ] Mechanic regression
- [ ] User create/update normalization
- [ ] Detail assignedMechanic populated
- [ ] RBAC unchanged (MECHANIC no admin routes)
- [ ] Removing flag does not break existing OT FK

---

## Error Response Format

| Status | Condition |
|--------|-----------|
| `400` | Invalid assigned mechanic (admin without flag, inactive, unknown id) |

No new error types beyond existing create validation.

---

## Dependencies

| Dependency | Notes |
|------------|-------|
| US-002 | User create |
| US-005 | Work order create |
| US-D6 (recommended) | Edit flag on existing users |

---

## Notes

- **Branch:** `feature-entrega2-RFM`.
- **If D6 not ready:** minimum bridge is PATCH with only `canActAsMechanic` or seed-dev flag.
- **Historical OTs:** FK preserved when flag removed; assignee drops from mechanics list only.

---

## Next Steps After Implementation

1. `docs/plans/US-D8_frontend.md`
2. Smoke: admin with flag self-assigns on new OT

---

## Implementation Verification

### Code Quality

- [ ] Single `assignableMechanicWhere` reused (no duplicated OR)

### Functionality

- [ ] US-D8 backend criteria met

### Testing

- [ ] Unit + e2e green

### Integration

- [ ] Ready for UserForm checkbox + MechanicSelect FE

### Documentation

- [ ] README updated
