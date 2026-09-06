# Frontend Implementation Plan: US-001 Authentication

## Overview

Implement the **authentication UI and session layer** for MecaTrack (US-001): login form, role-based redirects, protected routes, automatic access-token refresh via `httpOnly` refresh cookie, logout, and placeholder dashboards per role. This is the **first executable frontend slice** of entrega 2 — bootstrap `apps/web` (Next.js 14+ App Router) if not yet present.

**Architecture principles:** feature-folder `auth`, thin API service layer, shared `apiClient` with interceptors, React Context for session user, Next.js `middleware` for route guards, Tailwind for styling, server as source of truth.

**User story reference:** [`us/US-001-autenticacion.md`](../../us/US-001-autenticacion.md)

**Backend dependency:** US-001 backend (`POST /api/auth/login`, `refresh`, `logout`, `GET /api/auth/me`) must be running locally or mocked for integration.

**Out of scope:** password reset, OAuth, MFA, user management UI (US-002).

---

## Architecture Context

### Stack (from `readme.md` §2.2)

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Server state | React Query (optional for auth bootstrap; Context sufficient for MVP) |
| HTTP | `fetch` via shared `apiClient` with `credentials: 'include'` |

### Components and modules

| Area | Files |
|------|-------|
| **Feature `auth`** | `LoginForm`, `LogoutButton`, `useAuth`, `useLogin`, `authApi`, types |
| **Shared** | `apiClient`, `AuthProvider`, route helpers, UI primitives |
| **App routes** | `/login`, `/admin/dashboard`, `/mechanic/dashboard`, `/403` |
| **Guards** | `middleware.ts` (JWT presence + role routing) |

### State management

| State | Storage | Notes |
|-------|---------|-------|
| `accessToken` | **Memory** (module-level variable or React ref) | Short-lived; never `localStorage` |
| `refreshToken` | `httpOnly` cookie (set by API) | Sent automatically with `credentials: 'include'` |
| `user` | `AuthContext` | `{ id, email, fullName, role, active }` from login or `GET /me` |
| Form state | Local component state | `react-hook-form` + `zod` (recommended) |

### Routing map

| Route | Access | Behavior |
|-------|--------|----------|
| `/login` | Public | Redirect to dashboard if already authenticated |
| `/admin/*` | `ADMIN` | Protected; mechanic → `/403` |
| `/mechanic/*` | `MECHANIC` | Protected; admin may access mechanic routes if product allows — **MVP:** admin only `/admin/*` |
| `/` | — | Redirect to `/login` or role dashboard |

---

## Implementation Steps

### Step 0: Create Feature Branch

- **Branch naming (required):** `feature/US-001-frontend`
- **Implementation Steps:**
  1. Base: `feature-entrega2-RFM` (or branch with US-001 backend merged).
  2. `git checkout -b feature/US-001-frontend`
  3. Verify no conflicting WIP on `apps/web`.

---

### Step 1: Bootstrap `apps/web` (if greenfield)

- **Files:** `apps/web/package.json`, `next.config.ts`, `tailwind.config.ts`, `tsconfig.json`
- **Action:** Scaffold Next.js 14 App Router app inside monorepo.
- **Implementation Steps:**
  1. `npx create-next-app@latest apps/web --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"`
  2. Configure `next.config.ts`:
     - `rewrites` or env `NEXT_PUBLIC_API_URL=http://localhost:3001` for API base URL
  3. Add dependencies:
     - `react-hook-form`, `zod`, `@hookform/resolvers`
     - `@tanstack/react-query` (optional; recommended for `useMe` bootstrap)
     - `clsx` / `tailwind-merge` for class utilities
  4. Create `.env.local.example`:
     - `NEXT_PUBLIC_API_URL=http://localhost:3001/api`
  5. Root `package.json` workspaces (if monorepo): include `apps/web`.
- **Notes:** Skip if `apps/web` already exists; only add missing deps.

---

### Step 2: Types — `auth.types.ts`

- **File:** `apps/web/src/features/auth/types/auth.types.ts`

```typescript
export type UserRole = 'ADMIN' | 'MECHANIC';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  active: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export interface RefreshResponse {
  accessToken: string;
}
```

---

### Step 3: API Client with Token Interceptor

- **File:** `apps/web/src/shared/lib/apiClient.ts`

```typescript
export async function apiClient<T>(
  path: string,
  options?: RequestInit,
): Promise<T>
```

- **Implementation Steps:**
  1. Base URL from `process.env.NEXT_PUBLIC_API_URL`.
  2. Always `credentials: 'include'` for refresh cookie.
  3. Attach `Authorization: Bearer ${getAccessToken()}` when token exists.
  4. On `401` (except login/refresh endpoints): call `POST /auth/refresh` once, retry original request; on refresh failure → `clearSession()` + redirect `/login`.
  5. Serialize JSON body; parse error responses (`statusCode`, `message`).
  6. **Never log** tokens or passwords.
- **Token store:** `apps/web/src/shared/lib/tokenStore.ts` — `getAccessToken`, `setAccessToken`, `clearAccessToken` (in-memory only).

---

### Step 4: Auth API Service

- **File:** `apps/web/src/features/auth/services/authApi.ts`

```typescript
export const authApi = {
  login(data: LoginRequest): Promise<LoginResponse>;
  refresh(): Promise<RefreshResponse>;
  logout(): Promise<void>;
  me(): Promise<AuthUser>;
};
```

| Method | Endpoint | Notes |
|--------|----------|-------|
| `login` | `POST /auth/login` | On success: `setAccessToken(response.accessToken)` |
| `refresh` | `POST /auth/refresh` | Update access token |
| `logout` | `POST /auth/logout` | Clear token + user; cookie cleared by API |
| `me` | `GET /auth/me` | Bootstrap session on app load |

---

### Step 5: AuthProvider and `useAuth`

- **Files:**
  - `apps/web/src/features/auth/context/AuthProvider.tsx`
  - `apps/web/src/features/auth/hooks/useAuth.ts`

```typescript
interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}
```

- **Implementation Steps:**
  1. On mount: call `authApi.me()` if access token exists (or try `refresh` first if no token but cookie may exist).
  2. `login`: call API → set user + token → redirect by role.
  3. `logout`: call API → clear state → `router.push('/login')`.
  4. Wrap app in `AuthProvider` via `apps/web/src/app/providers.tsx`.
  5. Export `useAuth()` hook with context guard.

#### Role redirect helper

- **File:** `apps/web/src/features/auth/utils/roleRedirect.ts`

```typescript
export function getDashboardPath(role: UserRole): string {
  return role === 'ADMIN' ? '/admin/dashboard' : '/mechanic/dashboard';
}
```

---

### Step 6: `useLogin` Hook

- **File:** `apps/web/src/features/auth/hooks/useLogin.ts`

- Wraps form submission: validation errors, maps API errors to UI messages (Spanish).
- Returns `{ login, isPending, error }`.

---

### Step 7: `LoginForm` Component

- **File:** `apps/web/src/features/auth/components/LoginForm.tsx`

```typescript
export function LoginForm(): JSX.Element
```

| Requirement | Implementation |
|-------------|----------------|
| Fields | `email` (required, email format), `password` (required, min 8 client-side) |
| Submit | Disabled when invalid or `isPending` |
| Loading | Spinner on button or `disabled` + "Iniciando sesión..." |
| Errors | `aria-live="polite"` region for API errors |
| Generic 401 | Show: *"Correo o contraseña incorrectos"* (Spanish UI; API message in English OK) |
| 403 inactive | Show: *"Tu cuenta está inactiva. Contacta al administrador del taller."* |
| 429 | Show: *"Demasiados intentos. Intenta de nuevo más tarde."* |
| Labels | Spanish; `htmlFor` + `id` on inputs |

- Use `react-hook-form` + `zod` schema for client validation.
- Tailwind: centered card layout, WCAG AA contrast.

---

### Step 8: Login Page

- **File:** `apps/web/src/app/login/page.tsx`

- Public route; render `LoginForm`.
- If `useAuth().isAuthenticated` → `redirect(getDashboardPath(user.role))` (client effect or server check via cookie — prefer client bootstrap for MVP).
- Metadata: `title: "Iniciar sesión — MecaTrack"`.

---

### Step 9: Next.js Middleware — Route Protection

- **File:** `apps/web/src/middleware.ts`

- **MVP approach:** Middleware cannot read `httpOnly` cookie content easily for JWT decode without edge-compatible JWT lib. **Two options:**

**Option A (recommended MVP):** Middleware checks for presence of session marker cookie **or** lightweight non-httpOnly `session=1` set by client after login (less ideal).

**Option B (better security):** Middleware only protects route prefixes; full auth validated client-side + API 401. Use middleware for coarse redirects:

1. `/login` — if `accessToken` cookie is NOT used, skip middleware auth; rely on `AuthProvider` bootstrap.
2. For `/admin/*` and `/mechanic/*`: read JWT from **custom header not possible in middleware for browser navigation**.

**Recommended pattern for US-001:**

- Store access token in memory; on first load call `refresh` + `me` in `AuthProvider`.
- `middleware.ts`: check optional `Authorization` not available on document requests.
- Use **client-side `ProtectedLayout`** components for `/admin` and `/mechanic` route groups that show loading until `useAuth` resolves, then redirect unauthenticated users to `/login?returnUrl=...`.

- **File:** `apps/web/src/shared/components/ProtectedRoute.tsx`

```typescript
export function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}): JSX.Element | null
```

- Show spinner while `isLoading`; redirect to `/login` if unauthenticated; redirect to `/403` if wrong role.

---

### Step 10: Dashboard Placeholders and Layouts

#### Admin

- **Files:**
  - `apps/web/src/app/admin/layout.tsx` — wrap with `ProtectedRoute allowedRoles={['ADMIN']}`
  - `apps/web/src/app/admin/dashboard/page.tsx` — placeholder: *"Panel de administración"* + user name

#### Mechanic

- **Files:**
  - `apps/web/src/app/mechanic/layout.tsx` — `ProtectedRoute allowedRoles={['MECHANIC']}`
  - `apps/web/src/app/mechanic/dashboard/page.tsx` — placeholder: *"Panel del mecánico"*

#### Shared authenticated chrome

- **File:** `apps/web/src/shared/components/AppHeader.tsx`
  - Logo/title, user `fullName`, `LogoutButton`

---

### Step 11: `LogoutButton` Component

- **File:** `apps/web/src/features/auth/components/LogoutButton.tsx`

```typescript
export function LogoutButton(): JSX.Element
```

- Calls `useAuth().logout()`; accessible label *"Cerrar sesión"*.

---

### Step 12: 403 Page

- **File:** `apps/web/src/app/403/page.tsx`
- Message: *"No tienes permiso para acceder a esta página."*
- Link back to user's dashboard or login.

---

### Step 13: Root Layout and Providers

- **Files:**
  - `apps/web/src/app/layout.tsx` — fonts, global styles
  - `apps/web/src/app/providers.tsx` — `QueryClientProvider` (optional) + `AuthProvider`
  - `apps/web/src/app/page.tsx` — redirect to login or dashboard

---

### Step 14: E2E Tests (Playwright recommended)

- **File:** `apps/web/e2e/auth.spec.ts`
- **Setup:** Playwright config pointing at `localhost:3000`; API at `3001` with seed users.

| # | Scenario | Expected |
|---|----------|----------|
| 1 | Visit `/login` | Form visible |
| 2 | Invalid credentials | Generic error message |
| 3 | Admin login | Redirect `/admin/dashboard` |
| 4 | Logout | Redirect `/login` |
| 5 | Mechanic login | Redirect `/mechanic/dashboard` |
| 6 | Mechanic visits `/admin/dashboard` | `/403` or redirect |
| 7 | Unauthenticated `/admin/dashboard` | Redirect `/login` |
| 8 | Inactive user login | Inactive message (seed user) |

- **Alternative:** Cypress in `cypress/e2e/auth.cy.ts` if team standard prefers Cypress.

---

### Step 15: Update Technical Documentation

1. Add `apps/web/README.md` with env vars, dev startup, seed credentials reference.
2. Update root `readme.md` §1.4 (install) when entrega 2 documents local run — note `npm run dev` in `apps/web`.
3. Document auth flow diagram in `apps/web/README.md` (login → token → refresh).
4. UI copy in Spanish; code/comments in English.

---

## Implementation Order

1. Step 0 — Branch `feature/US-001-frontend`
2. Step 1 — Bootstrap `apps/web`
3. Step 2 — Types
4. Step 3 — `apiClient` + token store
5. Step 4 — `authApi`
6. Step 5 — `AuthProvider` + `useAuth`
7. Step 6 — `useLogin`
8. Step 7 — `LoginForm`
9. Step 8 — Login page
10. Step 9 — `ProtectedRoute` (+ optional middleware)
11. Step 10 — Admin/mechanic layouts + dashboard placeholders
12. Step 11 — `LogoutButton` + `AppHeader`
13. Step 12 — 403 page
14. Step 13 — Root layout + providers
15. Step 14 — E2E tests
16. Step 15 — Documentation

---

## Testing Checklist

- [ ] Login form validation (email format, password min 8)
- [ ] Admin → `/admin/dashboard`; mechanic → `/mechanic/dashboard`
- [ ] Invalid credentials show generic Spanish message
- [ ] Inactive account shows Spanish inactive message
- [ ] Logout clears session and redirects to login
- [ ] Protected routes redirect unauthenticated users to `/login`
- [ ] Wrong role → `/403`
- [ ] Authenticated user visiting `/login` redirects to dashboard
- [ ] Access token refresh on 401 (manual or automated test)
- [ ] No tokens/passwords in browser console logs
- [ ] E2E auth flow green
- [ ] Accessibility: labels, focus, `aria-live` on errors

---

## Error Handling Patterns

### API error mapping (`authApi` / `useLogin`)

| HTTP | API `message` (EN) | UI message (ES) |
|------|-------------------|-----------------|
| `400` | Validation array | Field-level errors from `message` |
| `401` | Invalid email or password | *Correo o contraseña incorrectos* |
| `403` | Inactive account | *Tu cuenta está inactiva. Contacta al administrador del taller.* |
| `429` | Too Many Requests | *Demasiados intentos. Intenta de nuevo más tarde.* |
| Network | — | *Error de conexión. Verifica tu red e intenta de nuevo.* |

### Refresh failure

- Clear token + user state → redirect `/login?session=expired` (optional query for banner).

### Component pattern

```typescript
// LoginForm: local error state + aria-live region
{error && (
  <p role="alert" aria-live="polite" className="text-red-600">
    {error}
  </p>
)}
```

---

## UI/UX Considerations

| Area | Requirement |
|------|-------------|
| **Layout** | Centered card on login; max-width ~400px |
| **Responsive** | Usable on tablet/mobile (workshop floor) |
| **Loading** | Disable submit + visible feedback during login |
| **Language** | UI labels and messages in **Spanish** |
| **Accessibility** | WCAG AA contrast; keyboard navigable; focus first invalid field |
| **Security UX** | Never indicate which credential field failed on 401 |

---

## Dependencies

| Package | Purpose |
|---------|---------|
| `next`, `react`, `react-dom` | Framework |
| `typescript` | Types |
| `tailwindcss` | Styling |
| `react-hook-form`, `zod`, `@hookform/resolvers` | Form validation |
| `@tanstack/react-query` | Optional session bootstrap |
| `@playwright/test` | E2E (devDependency) |

No React Bootstrap — project uses Tailwind per `readme.md`.

---

## Notes

- **CORS:** API must allow `credentials` from `http://localhost:3000` (`CORS_ORIGIN`).
- **Cookie path:** Refresh cookie set by API on `/api/auth` — ensure frontend calls same API origin or proxy via Next.js rewrites to avoid cross-site cookie issues in dev.
- **Next.js rewrite (dev):** Optional `next.config.ts` rewrite `/api/*` → `http://localhost:3001/api/*` so cookies are same-origin.
- **Parallel work:** Frontend can start with mocked `authApi` until US-001 backend is ready.
- **Branch:** `feature/US-001-frontend` separate from `feature/US-001-backend`.
- **Blocks:** US-002–US-009 frontend slices assume auth shell exists.

---

## Next Steps After Implementation

1. Merge `feature/US-001-frontend` after US-001 backend is integrated
2. `/plan-frontend-ticket` for US-002 or `/develop-frontend` for next US
3. Wire real API URL in Docker Compose for full-stack local dev

---

## Implementation Verification

### Code Quality

- [ ] Feature folder structure matches readme §2.3
- [ ] Access token only in memory
- [ ] `apiClient` is single HTTP entry point for auth

### Functionality

- [ ] Full login → dashboard → logout flow per role
- [ ] Session persists across page refresh (via refresh cookie + `me`)

### Testing

- [ ] E2E covers admin and mechanic paths
- [ ] Manual test with seed users from API

### Integration

- [ ] Works against US-001 backend on local stack
- [ ] `credentials: 'include'` verified in Network tab

### Documentation

- [ ] Step 15 complete
