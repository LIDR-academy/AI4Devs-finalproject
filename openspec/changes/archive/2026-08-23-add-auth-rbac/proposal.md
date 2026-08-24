## Why

EyeMaster handles sensitive commercial and financial data. Every other module (clients, companies, assignments, financial cache, reports) needs to know *who* is calling and *what* they're allowed to do before any of it is safe to expose. Nothing beyond the scaffold and the ERP gateway can be built without authentication and permission checks in place — this is the second cornerstone after connectivity.

## What Changes

- Custom Django user model with **email as the login field** (no username).
- `Role` and `Permission` models with a many-to-many relationship; each user has exactly one role; permissions are identified by **code** (e.g. `cliente.crear`).
- Seed a base set of roles (`administrador`, `operador`, `ejecutivo`) so the system is usable immediately after migration.
- JWT authentication endpoints: `POST /api/auth/login`, `POST /api/auth/refresh`, `GET /api/auth/me`.
- A DRF permission class that checks the caller's role permissions **by code**, not by Django's built-in permission system.
- User CRUD and Role CRUD endpoints, restricted to users with the relevant permission.
- Frontend: login screen, JWT storage, route guard that redirects unauthenticated users, and wiring of the `setAuthTokenProvider` hook already present in `httpClient.ts`.

## Capabilities

### New Capabilities
- `auth`: Authentication (JWT issuance/refresh/identity) and role-based authorization (roles, permissions-by-code, per-endpoint enforcement), covering R-SEG-01..05 from `documentacion-funcional.md` §6.1.

### Modified Capabilities
<!-- None. -->

## Impact

- **New code:** `backend/apps/accounts/` (custom user, `Role`, `Permission` models, migrations, seed data, serializers, views), JWT views wired in `core/urls.py`, `frontend/src/pages/LoginPage.tsx`, `frontend/src/auth/` (token storage, route guard).
- **Dependencies:** none new (`djangorestframework-simplejwt` already installed by `bootstrap-project`).
- **Downstream:** every subsequent change (clients, companies, commercial structure, financial cache, reporting) depends on the permission class and the authenticated-user context this change provides.
- **Docs:** implements HU-01 and Epic 01 from `documentacion-funcional.md` §9.1 and §10.1.
