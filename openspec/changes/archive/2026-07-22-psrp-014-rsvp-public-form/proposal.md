## Why

We need to provide guests with a way to easily respond to event invitations. By sending them a unique, token-based link, guests can view event details and submit their RSVP (including attendance, dietary restrictions, and logistic needs) via a lightweight, mobile-optimized public form without needing an account.

## What Changes

- Add a standalone, mobile-optimized public RSVP form accessible via `/rsvp/{token}`.
- Implement backend token verification using SHA-256 hashing to securely match invitations.
- Provide `GET /api/rsvp/{token}` to fetch event and guest information for the form.
- Provide `POST /api/rsvp/{token}` to idempotently submit or update RSVP details.
- Implement an RSVP deadline check (guests cannot RSVP or modify less than 7 days before the event).
- Implement rate limiting (e.g., 5 submissions per hour per token) to prevent spam.
- Create a confirmation page displaying success, "Add to Calendar", and "Get Directions" options.

## Capabilities

### New Capabilities
- `rsvp-public-form`: The ability for guests to view event details, submit RSVP information (attendance, dietary restrictions, plus-ones), and receive confirmation via a secure, token-based public form.

### Modified Capabilities
None.

## Impact

- **Backend**: New `RsvpController`, `IRsvpService`, `RsvpService`, and endpoints for fetching and submitting RSVP data.
- **Frontend**: New standalone RSVP form (`rsvp-form.page.ts`) and confirmation page (`rsvp-confirmation.page.ts`).
- **Database**: `RSVPs` table integration with unique `InvitationId`, using the `Events` table for deadline validation.
- **Security**: Token-based access and submission verification using hashed tokens.
