## Why

Hosts need a way to delegate responsibilities to trusted individuals ("accomplices") without sharing their own credentials. This change allows hosts to invite accomplices via a magic link, manage their permissions (e.g., sending live messages, viewing RSVPs), and revoke access when necessary, enabling secure and controlled delegation of event management tasks.

## What Changes

- Add a new `AccompliceService` and corresponding endpoints to grant, revoke, and resend access for accomplices.
- Generate secure, short-lived tokens (256-bit random, SHA-256 hashed) and JWTs for accomplice authentication.
- Integrate with `email:queue` to dispatch magic link emails to invited accomplices.
- Add an Accomplice Management UI section in the Event Dashboard for hosts to manage their team (invite form, list, status badges, revoke/resend actions).
- Implement endpoint `GET /api/accomplices/verify` to validate magic link tokens and issue JWTs.

## Capabilities

### New Capabilities
- `accomplice-management`: The capability for hosts to invite accomplices via magic links, manage their permissions (send_messages, view_rsvps), and revoke access, along with the accomplice verification flow.

### Modified Capabilities
- None

## Impact

- **Backend**: New `IAccompliceService`, `AccompliceService`, `AccomplicesController`. `LiveMessagesController` will need to enforce the new JWT role (`accomplice`) and CSRF validation.
- **Frontend**: Event dashboard will have a new Accomplice Management component. A new `AccompliceService` in Angular will communicate with the backend.
- **Database**: Adds an `Accomplices` table or updates the existing model with `TokenHash`, `Permissions`, `ExpiresAt`, `IsRevoked`.
- **Infrastructure**: Leverages the existing RabbitMQ `email:queue` to send magic links.
