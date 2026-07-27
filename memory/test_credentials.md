# Test Credentials

## Dev Login (Testing)
- Endpoint: `POST /api/auth/dev-login`
- No credentials needed - creates session automatically
- Returns: `{user_id, email: "test@bpmnmodeler.dev", name: "Dev Tester", role: "subscription", session_token: "<uuid>"}`
- Use `Authorization: Bearer <session_token>` header for authenticated requests
- **NOTE 2026-04-29**: This user has been promoted to `plan: "enterprise"` in DB to enable Custom Schemas testing. To revert: `db.users.update_one({"user_id":"user_test_dev_001"}, {"$unset": {"plan": ""}})`

## Demo Login
- Endpoint: `POST /api/auth/demo-login`
- Email: `demo@bpmnmodeler.app`
- Password: `demo`
- Returns: `{user_id: "user_demo_001", email, name: "Demo User", role: "subscription", is_demo: true, session_token}`
- READ-ONLY: All POST/PUT/DELETE operations blocked (403)
- Session expires in 24 hours

## Google OAuth (Production)
- Login page: `/login` → "Continuar con Google"
- Uses Emergent Auth: `https://auth.emergentagent.com`
- Redirects back with `#session_id=xxx` in URL hash

## Admin User
- Email: oscar.hidalgo.puertas@gmail.com
- Role: admin (auto-assigned on login)
- Admin pages: /translations, /admin/users

## User Roles
- `free` - Gratuito (max 2 diagrams, 6 AI/month, 10 OOP classes, 10 components, no export)
- `subscription` - Suscripcion (default for all new users, unlimited)
- `admin` - Administrador (full access, manage users/translations)

## Test Diagrams
- Invalid XML diagram: `d261a9af-8cfc-44fc-8aa8-417b0e00c60d` (stored as `<test/>`, backend returns valid fallback)
- Valid BPMN diagram: `5dc38ab6-9ab7-4907-9f95-4a98e88e5dc0` (Proceso de Compra)

## Free plan tester (for upgrade modal testing)
- Email: free@bpmnmodeler.dev
- User ID: user_test_free_001
- Role: free
- Session token: 2d4177f7-212e-406a-b389-0fee5abd0df2 (may have been invalidated by admin block tests; re-issue via mongo if needed)
- Pre-seeded with 1 project (My Free Project, 3 diagrams) to trigger limits.

## User active/blocked state (admin-only — added 2026-04-30)
- All users have `is_active: true` by default (missing field is treated as true).
- Admin endpoints:
  - `PATCH /api/admin/users/{user_id}/status` body `{ "is_active": bool }` — toggle active/blocked + audit log + invalidate sessions on block.
  - `GET /api/admin/users/{user_id}/details` — returns `{user, issues, transactions, summary}`.
  - `PUT /api/admin/users/{user_id}/role` body `{ "role": "free"|"subscription"|"admin" }`.
- Self-actions guarded: admins cannot demote or block themselves.
- Blocked users: all auth flows return 403 ("Account blocked. Contact an administrator.") and existing sessions are deleted on block.
