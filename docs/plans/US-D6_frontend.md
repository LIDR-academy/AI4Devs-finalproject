# Frontend Implementation Plan: US-D6 Workshop User Edit

## Overview

Add **Editar** action on `/admin/users` opening **`EditUserDialog`**: partial update of `fullName`, `email`, `role`, optional password reset, and **`canActAsMechanic`** checkbox when role is `ADMIN` (US-D8). Map API errors to Spanish; invalidate `['users']` on success; handle forced logout when admin edits own password/role (401 session expiry).

**Architecture principles:** extend `features/users`; React Query mutation; Zod update schema; mirror `UserForm` / `DeactivateUserDialog` patterns; Playwright e2e.

**User story reference:** [`us/Deseables/US-D6-edicion-usuarios-taller.md`](../../us/Deseables/US-D6-edicion-usuarios-taller.md)

**Backend plan:** [`docs/plans/US-D6_backend.md`](./US-D6_backend.md)

**Prerequisites:** US-D6 backend on `feature-entrega2-RFM`; US-D8 field optional in types (default `false`).

**Out of scope:** Reactivate UI (nice-to-have), mustChangePassword flow, mechanic self-service.

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
├── types/user.types.ts              # UpdateUserRequest, canActAsMechanic on UserListItem
├── services/usersApi.ts             # update()
├── hooks/useUpdateUser.ts           # NEW
├── utils/updateUserSchema.ts        # NEW
├── utils/mapUsersError.ts           # edit-specific messages
├── components/EditUserDialog.tsx    # NEW
├── components/UserTable.tsx         # Editar button
└── components/UserList.tsx          # wire dialog + toast

apps/web/e2e/users.spec.ts           # edit scenarios
apps/web/README.md
```

### Routing

No new routes — `/admin/users` only.

### State management

| Concern | Approach |
|---------|----------|
| List | `useUsers` — key `['users']` |
| Edit | `useUpdateUser` → invalidate `['users']` |
| Dialog | Local `editTarget: UserListItem \| null` |
| Sensitive confirm | Local flag when role or password changes |

---

## Implementation Steps

### Step 0: Stay on Entrega 2 Branch

- **Branch (required):** `feature-entrega2-RFM`

---

### Step 1: Extend Types

- **File:** `types/user.types.ts`
- **Action:** Add update contract + D8 flag on list item.
- **Implementation Steps:**

```typescript
export interface UserListItem {
  // existing fields...
  canActAsMechanic?: boolean;
}

export interface UpdateUserRequest {
  fullName?: string;
  email?: string;
  role?: 'ADMIN' | 'MECHANIC';
  password?: string;
  canActAsMechanic?: boolean;
}
```

- **Dependencies:** Backend `UserResponseDto`.

---

### Step 2: API — `usersApi.update`

- **File:** `services/usersApi.ts`
- **Function Signature:**

```typescript
update(id: string, body: UpdateUserRequest): Promise<UserListItem>
```

- **Implementation Steps:**
  1. `PATCH /users/${id}` with JSON body (omit undefined keys).
  2. Return typed user response.
- **Dependencies:** Step 1.

---

### Step 3: Hook `useUpdateUser`

- **File:** `hooks/useUpdateUser.ts` (new)
- **Implementation Steps:**
  1. `useMutation({ mutationFn: ({ id, body }) => usersApi.update(id, body) })`.
  2. `onSuccess`: invalidate `['users']`.
- **Dependencies:** React Query.

---

### Step 4: `updateUserSchema` (Zod)

- **File:** `utils/updateUserSchema.ts` (new)
- **Action:** Partial form validation mirroring create rules.
- **Implementation Steps:**
  1. Fields optional individually but form submit requires at least one change (compare to initial values in dialog) OR require all displayed fields valid.
  2. `password`: optional; if “Restablecer contraseña” checked → min 8 chars.
  3. `canActAsMechanic`: boolean optional; only when role === `ADMIN`.
  4. Reuse patterns from `createUserSchema.ts`.
- **Dependencies:** zod.

---

### Step 5: Error Mapping

- **File:** `utils/mapUsersError.ts`
- **Action:** Spanish messages for edit flows.
- **Implementation Steps:**

| API | Spanish |
|-----|---------|
| `This email is already registered` | *Este correo ya está registrado* |
| `At least one active administrator is required` | *Debe haber al menos un administrador activo* |
| `User is inactive` | *El usuario está inactivo* |
| Validation | Existing generic handling |

---

### Step 6: `EditUserDialog`

- **File:** `components/EditUserDialog.tsx` (new)
- **Component Signature:**

```typescript
export function EditUserDialog({
  user,
  open,
  onOpenChange,
  onSuccess,
}: { user: UserListItem | null; /* ... */ })
```

- **Implementation Steps:**
  1. Pre-fill `fullName`, `email`, `role` from `user`.
  2. Checkbox **Restablecer contraseña** → reveals password input when checked.
  3. If `role === 'ADMIN'`: checkbox *También puede realizar trabajo de mecánico* bound to `canActAsMechanic` (US-D8).
  4. When role select changes to `MECHANIC`: hide mechanic checkbox; reset `canActAsMechanic` to false on submit.
  5. **Confirm step** (inline or second confirm) if `role` changed or password reset checked: *“Cambiar rol o contraseña cerrará las sesiones activas del usuario.”*
  6. Submit only changed fields (diff against initial).
  7. Inactive users: hide **Editar** in table (Step 7) — dialog not opened.
  8. Loading/disabled during mutation; errors via `mapUsersError`.
- **Dependencies:** `Modal`, `Button`, `useUpdateUser`, schema.

---

### Step 7: Wire `UserTable` + `UserList`

- **Files:** `UserTable.tsx`, `UserList.tsx`
- **Implementation Steps:**
  1. Add **Editar** button next to Desactivar for **active** users only.
  2. `UserList`: state `editUser`, render `EditUserDialog`.
  3. On success: toast *Usuario actualizado*; close dialog.
  4. If edited user is **current session user** and password/role changed → expect global 401 handler to redirect login (document manual test; optional e2e).
- **Dependencies:** Step 6.

---

### Step 8: Optional Badge for Admin+Mechanic (D8)

- **File:** `UserTable.tsx` or `UserRoleBadge.tsx`
- **Action:** Show *Admin · Mecánico* when `role === 'ADMIN' && canActAsMechanic`.
- **Implementation Notes:** Skip if D8 backend not merged; add when field available.

---

### Step 9: Playwright E2E

- **File:** `e2e/users.spec.ts`
- **Implementation Steps:**
  1. Admin opens `/admin/users` → **Editar** on a mechanic → change name → save → name visible in table.
  2. Duplicate email → Spanish error visible.
  3. Optional: attempt demote sole admin → error message (needs isolated seed).
  4. Regression: create + deactivate still work.
- **Dependencies:** Admin storageState.

---

### Step 10: Update Technical Documentation

- **File:** `apps/web/README.md`
- **Action:** Users section — document edit modal, fields, session logout on password/role change.

---

## Implementation Order

1. Step 0 — Branch
2. Step 1 — Types
3. Step 2 — API
4. Step 3 — Hook
5. Step 4 — Zod schema
6. Step 5 — Error map
7. Step 6 — EditUserDialog
8. Step 7 — Table/List wiring
9. Step 8 — Badge (if D8)
10. Step 9 — E2E
11. Step 10 — Docs

---

## Testing Checklist

- [ ] Editar visible for active users only
- [ ] Name/email/role update reflected in table
- [ ] Password reset optional path works
- [ ] canActAsMechanic checkbox only for ADMIN role
- [ ] Duplicate email → Spanish 409
- [ ] Last admin error → Spanish 400
- [ ] Toast on success
- [ ] Create/deactivate regression
- [ ] Mechanic cannot access `/admin/users`

---

## Error Handling Patterns

| Source | UI |
|--------|-----|
| Mutation pending | Disable submit |
| 409 email | Inline alert in dialog |
| 400 last admin | Inline alert |
| 409 inactive | Should not open dialog |
| Self password/role change | Global session expiry → login redirect |

---

## UI/UX Considerations

- **Spanish** copy throughout.
- **Confirm** on sensitive changes (role/password).
- **Accessibility:** dialog labelled; form fields tied to labels.

---

## Dependencies

| Dependency | Notes |
|------------|-------|
| US-D6 backend | PATCH endpoint |
| US-D8 (optional) | canActAsMechanic checkbox + badge |
| UserForm patterns | Reuse styling |

---

## Notes

- **Branch:** `feature-entrega2-RFM`.
- **Coordinate D8:** If D8 lands first, wire checkbox; if D6 first, types optional with default false.

---

## Next Steps After Implementation

1. US-D8 backend/frontend (shared user flag)
2. Manual smoke: edit admin email, edit mechanic name

---

## Implementation Verification

### Code Quality

- [ ] Feature stays under `users/`
- [ ] Only changed fields sent in PATCH body

### Functionality

- [ ] Edit flow complete per US-D6

### Testing

- [ ] E2E edit + error cases

### Documentation

- [ ] README updated
