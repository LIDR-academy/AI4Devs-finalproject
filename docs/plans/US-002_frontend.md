# Frontend Implementation Plan: US-002 User Management

## Overview

Implement the **admin-only user management UI** for MecaTrack (US-002): list employees (active and inactive), create new users with temporary password and role, and deactivate accounts with confirmation. Extends the admin shell from **US-001** (`ProtectedRoute`, admin layout, `apiClient`).

**Architecture principles:** feature-folder `users`, React Query for server state, modal/page form pattern, reusable table and badge components, Spanish UI copy.

**User story reference:** [`us/US-002-gestion-usuarios.md`](../../us/US-002-gestion-usuarios.md)

**Prerequisites:** US-001 frontend (`AuthProvider`, `ProtectedRoute`, `/admin` layout) and US-002 backend (`GET/POST /api/users`, `PATCH /api/users/:id/deactivate`).

**Out of scope:** edit profile, reactivate user, password reset, mechanic access to any user management UI.

---

## Architecture Context

### Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14+ App Router |
| Server state | React Query (`@tanstack/react-query`) |
| Forms | `react-hook-form` + `zod` |
| Styling | Tailwind CSS |
| HTTP | Shared `apiClient` from US-001 |

### Feature files

```
apps/web/src/features/users/
├── components/
│   ├── UserList.tsx
│   ├── UserTable.tsx
│   ├── UserForm.tsx
│   ├── DeactivateUserDialog.tsx
│   ├── UserRoleBadge.tsx
│   └── UserStatusBadge.tsx
├── hooks/
│   ├── useUsers.ts
│   ├── useCreateUser.ts
│   └── useDeactivateUser.ts
├── services/
│   └── usersApi.ts
└── types/
    └── user.types.ts

apps/web/src/app/admin/users/
├── page.tsx                    # list + modal create (or link to /new)
└── new/page.tsx                # optional dedicated create page

apps/web/src/app/admin/layout.tsx   # add nav link "Usuarios"
```

### Routing

| Route | Access | Purpose |
|-------|--------|---------|
| `/admin/users` | `ADMIN` | User list + create + deactivate |
| `/admin/users/new` | `ADMIN` | Optional dedicated create form |

`MECHANIC` → `ProtectedRoute` blocks access → `/403`.

### State management

| Concern | Approach |
|---------|----------|
| User list | React Query `['users']` |
| Create | `useMutation` → invalidate `['users']` on success |
| Deactivate | `useMutation` → optimistic update or refetch |
| Modal open | Local `useState` in `UserList` or page |
| Current admin `id` | `useAuth().user.id` — disable self-deactivate in UI |

---

## Implementation Steps

### Step 0: Create Feature Branch

- **Branch naming (required):** `feature/US-002-frontend`
- **Implementation Steps:**
  1. Base: `feature-entrega2-RFM` with US-001 frontend merged.
  2. `git checkout -b feature/US-002-frontend`
  3. Confirm `apps/web` auth shell works before adding users feature.

---

### Step 1: Types — `user.types.ts`

- **File:** `apps/web/src/features/users/types/user.types.ts`

```typescript
import type { UserRole } from '@/features/auth/types/auth.types';

export interface UserListItem {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateUserRequest {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
}

export type CreateUserResponse = UserListItem;
```

---

### Step 2: Users API Service

- **File:** `apps/web/src/features/users/services/usersApi.ts`

```typescript
export const usersApi = {
  list(): Promise<UserListItem[]>;
  create(data: CreateUserRequest): Promise<CreateUserResponse>;
  deactivate(userId: string): Promise<UserListItem>;
};
```

| Method | Endpoint | Notes |
|--------|----------|-------|
| `list` | `GET /users` | ADMIN Bearer token |
| `create` | `POST /users` | Body without password in response |
| `deactivate` | `PATCH /users/:id/deactivate` | No request body |

- Uses shared `apiClient`; never log `password` from create payload.

---

### Step 3: React Query Hooks

#### `useUsers.ts`

```typescript
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.list(),
    select: (users) => sortUsers(users), // active first, then fullName asc
  });
}
```

- **Client sort** (if API order differs): `active` desc, `fullName` localeCompare.

#### `useCreateUser.ts`

```typescript
export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
```

#### `useDeactivateUser.ts`

```typescript
export function useDeactivateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: usersApi.deactivate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
```

---

### Step 4: Badge Components

#### `UserRoleBadge.tsx`

| `role` | Label (ES) | Style hint |
|--------|------------|------------|
| `ADMIN` | Administrador | distinct color (e.g. purple) |
| `MECHANIC` | Mecánico | neutral/blue |

#### `UserStatusBadge.tsx`

| `active` | Label (ES) |
|----------|------------|
| `true` | Activo |
| `false` | Inactivo |

---

### Step 5: `UserForm` Component (Create)

- **File:** `apps/web/src/features/users/components/UserForm.tsx`

```typescript
export function UserForm({
  onSuccess,
  onCancel,
}: {
  onSuccess?: () => void;
  onCancel?: () => void;
}): JSX.Element
```

| Field | Validation (zod) |
|-------|------------------|
| `fullName` | required, 2–120 chars |
| `email` | required, valid email; trim + lowercase on submit |
| `password` | required, min 8 chars |
| `role` | required enum `ADMIN` \| `MECHANIC` |

- **UI:** Select for role with Spanish labels; password `type="password"` with optional show/hide toggle.
- **Submit:** `useCreateUser`; disable while pending.
- **Success:** toast *"Usuario creado correctamente"* + `onSuccess()` (close modal, clear form).
- **409:** Show *"Este correo ya está registrado"* (`aria-live`).
- **400:** Show field errors or server message.

---

### Step 6: `DeactivateUserDialog` Component

- **File:** `apps/web/src/features/users/components/DeactivateUserDialog.tsx`

```typescript
export function DeactivateUserDialog({
  user,
  open,
  onOpenChange,
}: {
  user: UserListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}): JSX.Element
```

- **Copy:** *"¿Desactivar la cuenta de {fullName}? No podrá iniciar sesión."*
- **Confirm** calls `useDeactivateUser.mutate(user.id)`.
- **Errors:**
  - `400` self-deactivate → *"No puedes desactivar tu propia cuenta"*
  - `400` last admin → *"Debe permanecer al menos un administrador activo"*
  - `409` already inactive → *"El usuario ya está inactivo"*
- **Accessibility:** Focus trap in dialog; `aria-labelledby` for title.

---

### Step 7: `UserTable` and `UserList`

#### `UserTable.tsx`

- Columns: Nombre, Correo, Rol, Estado, Acciones.
- Semantic `<table>` with `<th scope="col">`.
- **Acciones:** **Desactivar** button only when `user.active === true`.
- **Hide Desactivar** for current user (`user.id === authUser.id`) or show disabled with tooltip.

#### `UserList.tsx`

- Fetches via `useUsers`.
- Loading skeleton / spinner.
- Empty state: *"No hay usuarios registrados"*.
- Header: title *"Usuarios"* + button **Nuevo usuario** (opens modal with `UserForm` or navigates to `/admin/users/new`).
- Wires `DeactivateUserDialog` state.

---

### Step 8: Admin Users Page

- **File:** `apps/web/src/app/admin/users/page.tsx`

```typescript
export default function AdminUsersPage() {
  return <UserList />;
}
```

- Page metadata: `title: "Usuarios — MecaTrack"`.
- Already protected by `admin/layout.tsx` → `ProtectedRoute allowedRoles={['ADMIN']}`.

#### Optional: `/admin/users/new/page.tsx`

- Full-page `UserForm` with **Cancelar** → back to `/admin/users`.
- Use if modal pattern is skipped; **US-002 accepts modal or page** — recommend **modal** for fewer routes.

---

### Step 9: Admin Layout — Navigation

- **File:** `apps/web/src/app/admin/layout.tsx`
- Add nav item **Usuarios** → `/admin/users`.
- Highlight active route (`usePathname()`).
- **Do not** add link in `mechanic/layout.tsx`.

---

### Step 10: Shared UI Primitives (if missing)

- **Files:** `apps/web/src/shared/components/`
  - `Button.tsx`, `Modal.tsx` or `Dialog.tsx`, `Toast.tsx` / sonner
  - `LoadingSpinner.tsx`, `EmptyState.tsx`

- Reuse across future features; keep minimal for US-002.

---

### Step 11: E2E Tests

- **File:** `apps/web/e2e/users.spec.ts`

| # | Scenario | Expected |
|---|----------|----------|
| 1 | Admin visits `/admin/users` | Table visible |
| 2 | Mechanic visits `/admin/users` | `/403` or redirect |
| 3 | Admin creates mechanic | User appears in list |
| 4 | Duplicate email on create | Error message |
| 5 | Admin deactivates user | Status → Inactivo |
| 6 | Deactivated user cannot login | Login shows inactive message (cross-feature) |

- **Setup:** Admin seed credentials; create unique email per run.

---

### Step 12: Update Technical Documentation

1. Document `/admin/users` in `apps/web/README.md`.
2. Note admin-only nav item.
3. List React Query keys used (`['users']`).
4. Cross-reference US-002 in entrega 2 frontend checklist.

---

## Implementation Order

1. Step 0 — Branch `feature/US-002-frontend`
2. Step 1 — Types
3. Step 2 — `usersApi`
4. Step 3 — React Query hooks
5. Step 4 — Badge components
6. Step 5 — `UserForm`
7. Step 6 — `DeactivateUserDialog`
8. Step 7 — `UserTable` + `UserList`
9. Step 8 — Admin users page
10. Step 9 — Admin nav link
11. Step 10 — Shared UI primitives (if needed)
12. Step 11 — E2E tests
13. Step 12 — Documentation

---

## Testing Checklist

- [ ] `/admin/users` accessible only to `ADMIN`
- [ ] List shows active + inactive users with correct badges
- [ ] Sort: active first, then name ascending
- [ ] Create user with valid data updates list without full page reload
- [ ] Duplicate email shows Spanish error
- [ ] Deactivate shows confirmation dialog
- [ ] Deactivate updates row to Inactivo
- [ ] Cannot deactivate self (UI disabled + API `400` handled)
- [ ] Last admin deactivate blocked with clear message
- [ ] Mechanic nav has no Usuarios link
- [ ] Table accessible (`th`, keyboard, dialog focus)
- [ ] E2E admin flow green

---

## Error Handling Patterns

### API → UI mapping

| HTTP | Condition | UI message (ES) |
|------|-----------|-----------------|
| `400` | Validation | Field errors from `message` array |
| `400` | Self-deactivate | *No puedes desactivar tu propia cuenta* |
| `400` | Last admin | *Debe permanecer al menos un administrador activo* |
| `403` | Mechanic API call | Handled by auth; should not occur on admin page |
| `409` | Duplicate email | *Este correo ya está registrado* |
| `409` | Already inactive | *El usuario ya está inactivo* |
| `404` | Unknown user | *Usuario no encontrado* |
| Network | — | *Error de conexión. Intenta de nuevo.* |

### React Query error handling

```typescript
// useCreateUser / useDeactivateUser: expose error.message to component
const { mutate, isPending, error } = useCreateUser();
```

- Display errors in form or dialog with `role="alert"`.

---

## UI/UX Considerations

| Area | Requirement |
|------|-------------|
| **Layout** | Table full-width in admin content area; responsive horizontal scroll on mobile |
| **Create flow** | Modal preferred; success toast + list refresh |
| **Deactivate** | Destructive action styling; explicit confirm |
| **Status** | Color badges: green Activo, gray Inactivo |
| **Language** | All labels and messages in **Spanish** |
| **Security UX** | Password field never pre-filled; not shown after create |
| **Empty state** | Friendly message + CTA **Nuevo usuario** |

---

## Dependencies

| Package | Purpose |
|---------|---------|
| `@tanstack/react-query` | List/mutations cache |
| `react-hook-form`, `zod` | Create form |
| US-001 `apiClient`, `useAuth`, `ProtectedRoute` | Auth shell |

No new major dependencies beyond US-001 stack.

---

## Notes

- **Password:** Collected only on create; never stored client-side after submit.
- **Reactivate:** No UI in MVP — inactive users remain in list read-only.
- **List refresh:** `invalidateQueries(['users'])` after create/deactivate; optional manual **Actualizar** button.
- **Parallel:** Can develop against US-002 backend branch or MSW mocks.
- **Branch:** `feature/US-002-frontend` separate from backend branch.
- **US-005 prep:** Mechanic users created here appear in `GET /work-orders/mechanics` later.

---

## Next Steps After Implementation

1. `/plan-frontend-ticket` for US-003 (clients)
2. Merge after US-002 backend + US-001 frontend integrated
3. Manual QA: create mechanic → login as mechanic → admin deactivates → login fails

---

## Implementation Verification

### Code Quality

- [ ] Feature folder matches readme §2.3 (`features/users`)
- [ ] No password in logs or React state after submit
- [ ] Single `usersApi` service

### Functionality

- [ ] Full CRUD slice: list, create, deactivate
- [ ] Business rules reflected in UI (self, last admin)

### Testing

- [ ] E2E admin + mechanic access denial
- [ ] Integration with US-002 API

### Integration

- [ ] Admin nav complete for user management entry point
- [ ] Deactivated user blocked at login (US-001)

### Documentation

- [ ] Step 12 complete
