# Research: Default Password & Force Change on First Login

## Overview

Research covers technology decisions and best practices for implementing the default password and forced password change flow within the existing Node.js/Express/React stack.

## Decisions

### 1. Password Hashing

**Decision**: Use bcrypt with cost factor 12 (existing project standard).

**Rationale**: Already mandated by project constitution (Security-by-Default, PRD Section 10.1). The `CreateCoachee` use case will hash the coachee's phone number using the same `hashPassword` utility already used elsewhere. No new library needed.

**Alternatives considered**: Argon2id (stronger but not in project dependencies; would add complexity). scrypt (Node.js built-in but less battle-tested for web auth than bcrypt).

### 2. must_change_password Flag Storage

**Decision**: Add `must_change_password Boolean @default(true)` column to the `User` model in Prisma schema.

**Rationale**: The flag is a simple boolean attribute on the User entity. Default `true` ensures backward compatibility — existing users default to not requiring a change (unless explicitly set). New coachees get the default `true`. Admin/Coach users are not affected by this change.

**Alternatives considered**: Separate `PasswordPolicy` table (overkill for a single boolean flag). Redis/temporary store (would lose state on restart; the flag must persist).

### 3. Change Password Endpoint Design

**Decision**: `POST /auth/change-password` requiring authentication (any role), accepting `{ currentPassword, newPassword }`.

**Rationale**: Follows existing auth route pattern. The endpoint verifies the current password against the stored bcrypt hash before accepting the new password. This prevents a stolen session from being used to change the password without knowing the current one.

**Alternatives considered**: 
- Token-based change (email link) — would require email infrastructure; overkill for in-app change.
- No current password verification — less secure; a stolen session could change the password.

### 4. Frontend Redirect Logic

**Decision**: After login, check `mustChangePassword` in the response. If `true`, navigate to `/change-password`. The `RootRedirect` component also checks this flag on every navigation for users who haven't changed their password yet.

**Rationale**: This ensures the user cannot bypass the password change by navigating directly to a different URL or refreshing the page. The redirect is enforced at the router level.

**Alternatives considered**: 
- Middleware-only check (backend rejects all other requests) — would require backend state per request and adds complexity.
- Single redirect at login only — user could navigate away from change-password after login but before changing.

### 5. Phone Field Validation

**Decision**: Make phone required (`z.string().min(1).max(20)`) in the coachee creation Zod schema.

**Rationale**: Since phone is now used as the default password, it must be provided. The existing schema had phone as optional/nullable, which is inconsistent with the new requirement.

## Dependencies

- No new npm packages required. All functionality uses existing dependencies (bcrypt, jsonwebtoken, Prisma, Zod).
- Requires Prisma migration to add the `must_change_password` column.
- Requires `prisma db:generate` after migration.

## Integration Patterns

- **Auth flow**: Follows existing `POST /auth/login` pattern. The login response adds one field (`mustChangePassword`). The refresh response similarly adds the field.
- **Zod validation**: Follows existing pattern in `backend/src/infrastructure/routes/` — each route file has inline Zod schemas.
- **Frontend routing**: Follows existing React Router v6 setup in `frontend/src/infrastructure/routes/App.tsx`.
- **Error responses**: Follow the `{ error: { code, message, ref } }` envelope mandated by the constitution.
