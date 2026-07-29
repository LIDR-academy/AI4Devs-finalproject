## Why

KAN-65 added the `audiences` table and default seed. Users need Settings UI and REST endpoints to view and manage their audience labels before assigning them to books (KAN-67) or analyzing stats (KAN-69).

## What Changes

- JWT-protected `GET/POST/DELETE /v1/audiences` scoped by authenticated user.
- Validation: name length 1–100, case-insensitive duplicate → 409.
- Profile / Settings page with **Audiencia** section (list + add + delete).
- API spec and integration tests.

**Non-goals:** Rename; delete confirmation modal (KAN-68); book selector (KAN-67).

## Capabilities

### New Capabilities

- `audiences-settings-api`: REST CRUD (list/create/delete) for user audiences.

### Modified Capabilities

- `user-audiences`: ADD requirements for Settings API and management UI.

## Impact

- Backend: `AudiencesModule` controller + extended service.
- Frontend: `ProfilePage` replaces placeholder; new settings component.
- `docs/api-spec.yml`.
