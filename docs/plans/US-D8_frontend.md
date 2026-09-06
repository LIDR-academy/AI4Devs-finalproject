# Frontend Implementation Plan: US-D8 Admin Can Act as Mechanic

## Overview

Expose **`canActAsMechanic`** on user create/edit (ADMIN role only), show **Admin · Mecánico** badge in user list, render eligible admins in **`MechanicSelect`** with `(Admin)` suffix, and fix **`WorkOrderDetailHeader`** to use **`assignedMechanic`** from detail API instead of mechanics list lookup.

**Architecture principles:** extend `users` + `work-orders` features; minimal API client changes; Spanish UI; Playwright e2e; coordinate with US-D6 `EditUserDialog`.

**User story reference:** [`us/Deseables/US-D8-administradores-capacidad-mecanico.md`](../../us/Deseables/US-D8-administradores-capacidad-mecanico.md)

**Backend plan:** [`docs/plans/US-D8_backend.md`](./US-D8_backend.md)

**Prerequisites:** US-D8 backend (+ US-D6 edit UI recommended) on `feature-entrega2-RFM`.

**Out of scope:** Post-create mechanic reassignment UI, RBAC/menu changes.

---

## Architecture Context

### Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js App Router |
| Forms | react-hook-form + zod |
| Server state | React Query |
| E2E | Playwright |

### Files to add/modify

```
apps/web/src/features/users/
├── types/user.types.ts
├── utils/createUserSchema.ts
├── components/UserForm.tsx                 # conditional checkbox
├── components/EditUserDialog.tsx           # from US-D6 — same checkbox
├── components/UserTable.tsx                # badge Admin · Mecánico
└── services/usersApi.ts                    # create body includes flag

apps/web/src/features/work-orders/
├── types/work-order.types.ts               # MechanicSummary.role; assignedMechanic
├── components/MechanicSelect.tsx           # (Admin) suffix
├── components/WorkOrderDetailHeader.tsx    # assignedMechanic.fullName
└── (no change to useMechanics hook if API returns role)

apps/web/e2e/users.spec.ts
apps/web/e2e/work-orders.spec.ts
apps/web/README.md
```

### State management

| Concern | Approach |
|---------|----------|
| Create user | Include `canActAsMechanic` in POST when role ADMIN |
| Edit user | US-D6 `useUpdateUser` partial body |
| Mechanics list | Existing `useMechanics` — wider API response |
| Detail header | Read `workOrder.assignedMechanic` first |

---

## Implementation Steps

### Step 0: Stay on Entrega 2 Branch

- **Branch (required):** `feature-entrega2-RFM`

---

### Step 1: Extend Types

- **Files:** `user.types.ts`, `work-order.types.ts`
- **Implementation Steps:**

```typescript
// users
canActAsMechanic: boolean;

// work-orders
export interface MechanicSummary {
  id: string;
  fullName: string;
  role: 'ADMIN' | 'MECHANIC';
}

export interface AssignedMechanicSummary {
  id: string;
  fullName: string;
  role: 'ADMIN' | 'MECHANIC';
}

// WorkOrderDetail
assignedMechanic: AssignedMechanicSummary | null;
```

- **Dependencies:** US-D8 API responses.

---

### Step 2: User Create — Schema + Form

- **Files:** `createUserSchema.ts`, `UserForm.tsx`
- **Implementation Steps:**
  1. Add optional `canActAsMechanic: z.boolean().optional()` default false.
  2. Checkbox visible only when watched role === `ADMIN`:
     - Label: *También puede realizar trabajo de mecánico*
  3. On role change ADMIN → MECHANIC: uncheck and omit flag on submit (force false).
  4. Include in `usersApi.create` body when ADMIN.
- **Dependencies:** Step 1.

---

### Step 3: User Edit — `EditUserDialog` (US-D6)

- **File:** `EditUserDialog.tsx`
- **Action:** Same checkbox as create (if D6 implemented).
- **Implementation Steps:**
  1. Pre-check from `user.canActAsMechanic`.
  2. Include in PATCH when role ADMIN and value changed.
  3. If D6 not done yet, implement checkbox only in create form as minimum — document gap.
- **Dependencies:** US-D6 frontend.

---

### Step 4: User Table Badge

- **File:** `UserTable.tsx` (or `UserRoleBadge.tsx`)
- **Implementation Steps:**
  1. When `user.role === 'ADMIN' && user.canActAsMechanic`: show secondary text or badge *Admin · Mecánico*.
  2. Else keep existing `UserRoleBadge`.
- **Dependencies:** Step 1 list API field.

---

### Step 5: `MechanicSelect` — Show Admins

- **File:** `MechanicSelect.tsx`
- **Implementation Steps:**
  1. Extend option label:

```typescript
{mechanic.fullName}{mechanic.role === 'ADMIN' ? ' (Admin)' : ''}
```

  2. Keep label *Mecánico asignado (opcional)* (per US).
  3. No client-side filter — trust API list.
  4. Typing: handle optional `role` on mechanic for backward compat during rollout (`role ?? 'MECHANIC'`).
- **Dependencies:** Step 1, backend mechanics endpoint.

---

### Step 6: `WorkOrderDetailHeader` — Assigned Name

- **File:** `WorkOrderDetailHeader.tsx`
- **Implementation Steps:**
  1. Remove or demote `useMechanics()` lookup for display name.
  2. Primary: `workOrder.assignedMechanic?.fullName`.
  3. Fallback: if null but `assignedMechanicId` set (old cache), keep optional mechanics lookup or refetch detail.
  4. Display line: *Mecánico asignado: {name}* — append *(Admin)* if `assignedMechanic.role === 'ADMIN'`.
- **Dependencies:** Backend detail includes `assignedMechanic`.

---

### Step 7: Playwright E2E

- **Files:** `users.spec.ts`, `work-orders.spec.ts`
- **Scenarios:**
  1. Create ADMIN with checkbox checked → user list shows badge (if visible in table).
  2. Create OT → open mechanic select → option includes admin name with `(Admin)`.
  3. Assign to admin → submit OT → detail header shows admin name.
  4. Regression: plain MECHANIC still in list and assignable.
- **Dependencies:** Admin storageState.

---

### Step 8: Update Technical Documentation

- **File:** `apps/web/README.md`
- **Action:** Document `canActAsMechanic` checkbox, mechanic select behavior, detail header source.

---

## Implementation Order

1. Step 0 — Branch
2. Step 1 — Types
3. Step 2 — Create form checkbox
4. Step 3 — Edit dialog checkbox (D6)
5. Step 4 — User table badge
6. Step 5 — MechanicSelect labels
7. Step 6 — Detail header fix
8. Step 7 — E2E
9. Step 8 — Docs

---

## Testing Checklist

- [ ] Checkbox only when role ADMIN on create
- [ ] Role switch to MECHANIC clears flag on submit
- [ ] Admin+flag appears in MechanicSelect with (Admin)
- [ ] OT create with admin assignee succeeds
- [ ] Detail shows assigned admin name
- [ ] Admin without flag not in select
- [ ] Mechanic assignable without flag (regression)
- [ ] Admin RBAC smoke: `/admin/users` still accessible for flagged admin

---

## Error Handling Patterns

| Source | UI |
|--------|-----|
| Create OT invalid assignee | Existing WO create error mapping |
| Create user | Existing `mapUsersError` |

No new error surfaces beyond backend 400 on invalid assignee.

---

## UI/UX Considerations

- **Spanish** checkbox and badge copy.
- **Clear distinction:** `(Admin)` suffix avoids confusion in select.
- **No menu changes** — admin keeps admin nav.

---

## Dependencies

| Dependency | Notes |
|------------|-------|
| US-D8 backend | Migration + mechanics + detail |
| US-D6 frontend | Edit existing admins' flag |
| US-005 | MechanicSelect, create OT |

---

## Notes

- **Branch:** `feature-entrega2-RFM`.
- **Implement with D6:** Best done in same entrega slice after D6 edit modal exists.
- **Fallback:** seed-dev flag + create-only checkbox if edit deferred.

---

## Next Steps After Implementation

1. Commit entrega 2 deseables batch
2. Full regression smoke across admin/mechanic flows

---

## Implementation Verification

### Code Quality

- [ ] Detail header does not depend solely on mechanics list

### Functionality

- [ ] US-D8 FE criteria complete

### Testing

- [ ] E2E assign admin to OT

### Documentation

- [ ] README updated
