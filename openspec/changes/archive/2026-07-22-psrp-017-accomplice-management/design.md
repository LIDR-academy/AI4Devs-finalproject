## Context

The current event dashboard enables hosts to configure their event, but it lacks a feature to delegate communication to trusted friends ("accomplices"). Accomplices need to send real-time updates and view RSVPs during the event. To avoid creating full user accounts for accomplices or sharing the host's password, we will implement a "Magic Link" based authentication system for accomplices.

## Goals / Non-Goals

**Goals:**
- Provide an Accomplice Management UI on the host dashboard to invite, view, and revoke accomplices.
- Generate secure magic links with 24-hour expiration (tied to EventDate + 1 day).
- Exchange magic links for short-lived JWTs (role: `accomplice`) with specific claims (eventId, permissions array).
- Secure the `POST /api/live/{slug}/send` endpoint by verifying the `accomplice` JWT and CSRF token.

**Non-Goals:**
- Allowing accomplices to invite other accomplices.
- Creating persistent user accounts or passwords for accomplices.

## Decisions

### 1. Accomplice Authentication: Magic Link + JWT
We will use a stateless token hash approach for the magic link and then exchange it for a JWT:
- The host provides an email and permissions.
- The system generates a cryptographically secure 256-bit token.
- The `TokenHash` (SHA-256) is stored in the database to prevent plain-text exposure if the DB is compromised.
- The plain-text token is emailed via `email:queue` using a predefined template `accomplice-invite`.
- When the accomplice clicks the link (`/accomplice/{token}`), the frontend calls `GET /api/accomplices/verify?token={token}`.
- If valid, the backend hashes the token, looks it up, verifies it's not expired or revoked, and returns a secure HTTP-only cookie (`aura_session`) containing an `accomplice` JWT, plus a CSRF cookie (`aura_csrf`).
- **Rationale**: Combining short-lived magic links with standard JWT sessions leverages our existing JWT/CSRF infrastructure while providing a frictionless login experience for accomplices.

### 2. Permissions Storage
Permissions will be stored as a `jsonb` column (or standard text/JSON string in EF Core) in the `Accomplices` table: `["send_messages", "view_rsvps"]`.
- **Rationale**: A JSON array is flexible and avoids creating a separate `AccomplicePermissions` join table for just two simple flags.

## Risks / Trade-offs

- **Risk: Magic link interception** -> Mitigation: Tokens are sent via email (TLS) and are single-use/short-lived (expire EventDate + 1 day). Hashes are stored, not plain text.
- **Risk: CSRF attacks on accomplice endpoints** -> Mitigation: The verify endpoint will set `aura_csrf` which the frontend must send as a header, identical to the standard host auth flow.
