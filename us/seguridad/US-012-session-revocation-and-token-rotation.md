# US-012 — Session Revocation and Token Rotation

## [original] User Story

**As** a workshop administrator,  
**I want** user deactivation, role changes, and session refresh to be enforced immediately and safely,  
**so that** users cannot retain access through stale tokens after their permissions change.

## [enhanced] User Story

**As** a workshop administrator,  
**I want** account deactivation, role changes, logout, and token refresh to invalidate outdated sessions immediately,  
**so that** employees cannot keep privileged access through previously issued tokens after their account state changes.

**MVP scope:** add revocation-aware session control to access-token validation and rotate refresh tokens on every successful refresh.  
**Out of scope:** multi-device session management UI, user-visible session history, and MFA.  
**Source findings:** `reporteDeSeguridad.md` findings 5 and 6.

---

## [original] Acceptance Criteria

- [ ] Deactivation takes effect immediately, not only after access token expiry.
- [ ] Role downgrade takes effect immediately on protected endpoints.
- [ ] Refresh tokens are rotated and old ones become invalid.
- [ ] Logout and refresh use the same revocation-safe session model.

## [enhanced] Acceptance Criteria

### Immediate revocation

- [ ] A deactivated user loses access to protected API endpoints on the next request, even if the current access token has not reached `exp`.
- [ ] A user changed from `ADMIN` to `MECHANIC` loses access to admin-only endpoints on the next request after the role update.
- [ ] Authorization decisions on protected routes use the current effective user state, not only stale JWT claims issued earlier.
- [ ] Refresh attempts by deactivated users or users with invalidated sessions return `401 Unauthorized`.

### Refresh token rotation

- [ ] `POST /api/auth/refresh` returns a fresh access token and rotates the refresh token cookie in the same response.
- [ ] After a successful refresh, the previous refresh token is no longer valid.
- [ ] Reusing a rotated refresh token returns `401` and does not issue a new access token.
- [ ] `POST /api/auth/logout` invalidates the active refresh token and prevents future refresh with that token.

### Account-state changes

- [ ] Deactivation clears refresh state and invalidates access-token authorization immediately.
- [ ] Role changes that affect authorization also invalidate previously issued higher-privilege sessions.
- [ ] Session invalidation happens for:
  - logout
  - user deactivation
  - role changes
  - any future administrative session reset action

### Frontend behavior

- [ ] When refresh fails because the session was revoked, the frontend clears the local access token and redirects to `/login?session=expired`.
- [ ] Existing `credentials: 'include'` behavior remains compatible with rotated refresh cookies.

### Verification

- [ ] Automated tests cover deactivation while a session is active.
- [ ] Automated tests cover admin-to-mechanic downgrade while a session is active.
- [ ] Automated tests cover refresh token rotation, rotated-token reuse rejection, and logout invalidation.

---

## [original] Roles Involved

- Administrator

## [enhanced] Roles Involved

| Role | Responsibility in this US |
|------|----------------------------|
| Administrator | Triggers deactivation and role changes |
| Authenticated employee | Uses login, refresh, and logout flows |
| Backend developer | Implements revocation-aware auth and rotation |

---

## [original] Technical Notes

- Current access tokens remain valid until expiry even when user state changes.
- Current refresh flow does not rotate refresh tokens.

## [enhanced] Technical Specification

### Data model changes

Add a revocation-aware field to `User`, for example:

| Field | Type | Purpose |
|-------|------|---------|
| `sessionVersion` | `Int @default(0)` | Invalidates older access tokens after security-sensitive account changes |

Existing fields still used:

| Field | Use |
|-------|-----|
| `refreshTokenHash` | Hash of the currently valid refresh token |
| `refreshTokenExpiresAt` | Expiration timestamp for the active refresh token |
| `active` | Current account status |
| `role` | Current effective authorization role |

### JWT and request validation

Include `sessionVersion` in the access token payload:

```json
{
  "sub": "user-id",
  "email": "admin@taller.com",
  "role": "ADMIN",
  "sessionVersion": 3
}
```

On protected requests:

1. Extract token payload.
2. Load current user state from the database by `sub`.
3. Reject the request if:
   - user does not exist
   - `active = false`
   - token `sessionVersion` does not match DB `sessionVersion`
4. Expose the current DB-backed role to downstream guards so `RolesGuard` does not rely on stale role claims alone.

### API endpoints

#### `POST /api/auth/refresh`

- **Request:** refresh cookie only
- **Response `200`:**

```json
{
  "accessToken": "new-access-token"
}
```

- **Headers:** `Set-Cookie: refreshToken=<new-token>; HttpOnly; SameSite=Strict; Path=/api/auth; ...`
- **Errors:** `401` for revoked, expired, reused, or invalid refresh tokens

#### `POST /api/auth/logout`

- Invalidates current refresh token
- Clears cookie
- Bumps or otherwise invalidates session state as needed

#### `PATCH /api/users/:id/role`

Add or formalize an admin-only role update endpoint if one does not yet exist.

**Request body:**

```json
{
  "role": "MECHANIC"
}
```

**Behavior:** updates role and invalidates higher-privilege existing sessions immediately.

### Files to modify

```text
apps/api/prisma/schema.prisma
apps/api/src/modules/auth/auth.controller.ts
apps/api/src/modules/auth/auth.service.ts
apps/api/src/modules/auth/strategies/jwt.strategy.ts
apps/api/src/common/guards/jwt-auth.guard.ts
apps/api/src/common/guards/roles.guard.ts
apps/api/src/modules/users/users.service.ts
apps/api/src/modules/users/users.controller.ts
apps/web/src/shared/lib/apiClient.ts
apps/web/src/features/auth/
```

### Suggested implementation flow

1. Extend `User` with `sessionVersion`.
2. Update token issuance to include `sessionVersion`.
3. Update auth validation to compare token session version against DB state and use current DB role.
4. Rotate refresh tokens during `POST /api/auth/refresh`.
5. Invalidate sessions on logout, deactivate, and role change.
6. Add admin-only role update endpoint if the project still lacks one.
7. Update frontend session-expired handling if necessary.

### Tests required

| Layer | Minimum scenarios |
|------|--------------------|
| Unit | token issuance includes `sessionVersion`; refresh rotates token hash |
| Integration | deactivated user with old token gets `401`/`403`; downgraded admin loses admin access immediately |
| Integration | refresh succeeds once, old refresh token fails on reuse |
| E2E | admin role downgrade or deactivation forces next protected interaction back to login |

### Non-functional requirements

| Area | Requirement |
|------|-------------|
| Security | No token values in logs; stale privilege windows minimized |
| Reliability | Session invalidation must be deterministic across auth and refresh flows |
| Compatibility | Frontend refresh flow remains compatible with rotated cookies |
| Performance | Auth validation should remain efficient for normal protected requests |

### Definition of Done

- [ ] Role changes and deactivation are enforced immediately.
- [ ] Refresh token rotation is implemented and tested.
- [ ] Old refresh tokens cannot be reused after rotation.
- [ ] Logout, deactivation, and role change all invalidate stale sessions.
- [ ] Session revocation logic is covered by integration or e2e tests.

### Dependencies

| Relation | Detail |
|----------|--------|
| Depends on | `US-001` authentication and `US-002` user management |
| Related to | Any future role-editing UI for administrators |
| Blocks | Immediate privilege enforcement and safer long-lived sessions |

---

## [original] Priority

High.

## [enhanced] Priority

**High (P1)** — the current implementation leaves a real privilege window after deactivation or role downgrade and allows refresh-token replay until expiry.

**Estimated effort:** 2–3 days including schema change, auth changes, and integration tests.

---

## Metadata

| Field | Value |
|-------|-------|
| **ID** | US-012 |
| **Module** | `security` / `auth` / `users` |
| **Refinement status** | Enhanced locally |
