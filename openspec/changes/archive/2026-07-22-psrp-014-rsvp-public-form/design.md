## Context

Guests receive unique RSVP links (`/rsvp/{plaintextToken}`) to confirm their attendance and provide details like dietary restrictions or logistic needs. Currently, we lack the public-facing pages and backend endpoints for guests to submit this data. The design involves a backend service to securely handle token-based submissions and enforce deadlines, alongside a standalone frontend page optimized for mobile access.

## Goals / Non-Goals

**Goals:**
- Provide a responsive, mobile-first RSVP form and confirmation page that does not require guests to log in.
- Securely fetch event details and submit RSVPs using SHA-256 token hashing on the backend.
- Enforce the RSVP deadline (prevent submissions if the current time is less than 7 days before the event date).
- Allow idempotent RSVP updates (if a guest changes their mind before the deadline).
- Implement rate limiting to protect the public endpoint from spam/abuse.

**Non-Goals:**
- Managing or integrating payment processing on this public form (out of scope).
- Re-architecting the entire Angular SPA for this single route; it will be built as a standalone page but served from the existing frontend app.

## Decisions

- **Token Security:** The frontend sends the plaintext token in the URL path. The backend computes the SHA-256 hash of this token to look up the `Invitation` record. This protects against timing attacks and token leaks in the database.
- **Frontend Architecture:** The RSVP form will be part of the Angular application but built as a standalone component (`rsvp-form.page.ts`) so it can load quickly without heavy dependencies, specifically tailored for mobile users.
- **Upsert Pattern for RSVPs:** Instead of throwing an error if an RSVP exists, `POST /api/rsvp/{token}` will use an upsert approach. If an `Rsvp` record with the corresponding `InvitationId` exists, it updates the record; otherwise, it creates a new one.
- **Rate Limiting:** We will configure standard ASP.NET Core rate limiting middleware specifically on the `RsvpController` endpoints to limit requests (e.g., 5 per hour per IP/token) to prevent malicious spamming of responses.

## Risks / Trade-offs

- **Risk:** Guests sharing their RSVP link on public platforms.
  - *Mitigation:* The link is single-use tied to the specific guest/invitation. While anyone with the link can submit the RSVP on behalf of the guest, rate limiting prevents automated spam, and the host can manually intervene if discrepancies arise.
- **Risk:** Timezone differences causing deadline confusion.
  - *Mitigation:* The deadline check (`EventDate - 7 days`) is evaluated using UTC timestamps on the server side to ensure consistency.

