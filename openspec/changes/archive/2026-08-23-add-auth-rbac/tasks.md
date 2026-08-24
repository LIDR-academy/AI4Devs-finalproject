## 1. Backend: accounts app and models

- [x] 1.1 Create `apps/accounts` Django app
- [x] 1.2 Custom `User` model (`AbstractUser` subclass, `USERNAME_FIELD="email"`, no `username`), set as `AUTH_USER_MODEL` before first migration
- [x] 1.3 `Role` model and `Permission` model (`codigo` unique) with M2M `Role.permissions`
- [x] 1.4 `User.rol` FK to `Role`, `activo` boolean
- [x] 1.5 Data migration seeding roles `administrador`, `operador`, `ejecutivo` and a baseline permission set
- [x] 1.6 Management command to create a bootstrap administrator from env vars (no committed credentials)

## 2. Backend: JWT auth endpoints

- [x] 2.1 `POST /api/auth/login` (email + password → access + refresh)
- [x] 2.2 `POST /api/auth/refresh`
- [x] 2.3 `GET /api/auth/me` (email, role, permission codes)
- [x] 2.4 Generic `401` message on invalid credentials (no user-vs-password distinction)
- [x] 2.5 Reject login for inactive users with a clear message

## 3. Backend: permission enforcement

- [x] 3.1 `RequiresPermission(code)` DRF permission class checking `request.user.role.permissions`
- [x] 3.2 `emit_audit_event(user, action, **details)` stub (no-op/log for now; replaced by `add-audit-log`)
- [x] 3.3 Wire `emit_audit_event` into login, user create, role/permission change

## 4. Backend: user and role management

- [x] 4.1 User CRUD endpoints gated by permission codes (`usuario.crear`, `usuario.editar`, ...)
- [x] 4.2 Role CRUD + permission assignment endpoints gated by permission codes
- [x] 4.3 Guard: reject deactivating/deleting the last active administrator

## 5. Frontend: auth flow

- [x] 5.1 `AuthProvider` context: in-memory access token, `localStorage` refresh token, silent refresh on load
- [x] 5.2 Wire `setAuthTokenProvider` from `httpClient.ts` to the auth context
- [x] 5.3 `LoginPage` calling `POST /api/auth/login`
- [x] 5.4 Route guard component redirecting unauthenticated users to `/login`
- [x] 5.5 Basic user/role management screens (list + create, minimal styling)

## 6. Tests

- [x] 6.1 Login: success, wrong password, unknown email, inactive user (all assert generic 401 where applicable)
- [x] 6.2 Refresh: valid token renews access; expired/invalid token rejected
- [x] 6.3 `RequiresPermission`: allowed vs `403` for missing permission
- [x] 6.4 `/api/auth/me` returns correct role and permission codes
- [x] 6.5 Last-administrator guard rejects deactivation/deletion
- [x] 6.6 Duplicate email rejected at creation
- [x] 6.7 Frontend: route guard redirects when unauthenticated (component test)
