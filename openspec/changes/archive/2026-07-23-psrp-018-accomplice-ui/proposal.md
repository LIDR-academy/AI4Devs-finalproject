## Why

With the backend APIs for Accomplice Management implemented (PSRP-017), the host currently has no way to manage accomplices via the application interface. This change adds the Accomplice Management Panel to the frontend, allowing hosts to invite, list, resend invites to, and revoke access from their accomplices, completing the end-to-end feature.

## What Changes

- Add a new "Accomplices" section/panel in the event dashboard UI.
- Implement a form to invite new accomplices (email, permissions).
- Display a list of invited accomplices with their status (Pending, Active, Revoked).
- Add UI actions to resend a magic link and to revoke an accomplice's access.
- Integrate the frontend with the `POST /api/accomplices/{eventSlug}`, `GET /api/accomplices/{eventSlug}`, `POST /api/accomplices/{eventSlug}/resend`, and `POST /api/accomplices/{eventSlug}/revoke` endpoints.

## Capabilities

### New Capabilities
None. The capabilities are already defined under the existing `accomplice-management` spec.

### Modified Capabilities
None. The backend behavior is unchanged; we are only implementing the UI to consume the existing APIs.

## Impact

- Frontend application (`apps/frontend` or similar).
- New Angular components for the Accomplice dashboard view.
- Services in the frontend to communicate with the Accomplice APIs.
