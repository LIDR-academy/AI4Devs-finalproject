# Accomplice Management

## Purpose
Manage access and permissions for event accomplices, allowing hosts to invite trusted individuals to help manage events.

## Requirements

### Requirement: Grant Accomplice Access
The system SHALL provide an endpoint to grant access to an accomplice by creating a token and sending a magic link email.

#### Scenario: Host invites a new accomplice
- **WHEN** the host submits an email and permissions (e.g., `send_messages`, `view_rsvps`) via `POST /api/accomplices/{eventSlug}/grant`
- **THEN** the system generates a 256-bit hashed token, creates an Accomplice record, and enqueues a magic link email with type='accomplice-invite'.

### Requirement: Verify Accomplice Token
The system SHALL provide an endpoint to verify the magic link token and issue a session JWT for the accomplice.

#### Scenario: Accomplice clicks the magic link
- **WHEN** the accomplice calls `GET /api/accomplices/verify?token={token}` with a valid, non-expired, and non-revoked token
- **THEN** the system updates the `LastAccessedAt` timestamp and returns an `aura_session` cookie containing a JWT with the `accomplice` role and their permissions.

#### Scenario: Accomplice clicks an expired magic link
- **WHEN** the accomplice uses a token after EventDate + 1 day
- **THEN** the system returns a 401 Unauthorized with "Access has expired".

### Requirement: Revoke Accomplice Access
The system SHALL allow the host to revoke access from a previously invited accomplice.

#### Scenario: Host revokes an accomplice's access
- **WHEN** the host calls `POST /api/accomplices/{eventSlug}/revoke` with the accomplice ID
- **THEN** the system sets `IsRevoked=true` on the Accomplice record, immediately invalidating any future verification attempts.

### Requirement: Resend Accomplice Magic Link
The system SHALL allow the host to generate a new magic link and invalidate the old one.

#### Scenario: Host resends an invite
- **WHEN** the host calls `POST /api/accomplices/{eventSlug}/resend` with the accomplice ID
- **THEN** the system invalidates the previous token, generates a new token, and dispatches a new magic link email.

### Requirement: List Accomplices
The system SHALL allow the host to view all invited accomplices and their current status.

#### Scenario: Host views the accomplice list
- **WHEN** the host calls `GET /api/accomplices/{eventSlug}`
- **THEN** the system returns a list of accomplices with their emails, permissions, `GrantedAt`, `LastAccessedAt`, and `IsRevoked` properties.
