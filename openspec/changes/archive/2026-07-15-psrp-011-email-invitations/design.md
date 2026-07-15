## Context

The host currently lacks the ability to send invitations directly from the platform. We need a way to generate secure tokens per guest, persist invitation records, and asynchronously enqueue the emails using the newly developed Email Dispatcher and Dragonfly queue.

## Goals / Non-Goals

**Goals:**
- Implement secure token generation for guest invitations.
- Create an API to trigger invitation sending and check statuses.
- Update the Guest Manager UI to support this flow with real-time (polling) updates.
- Ensure only one invitation is generated per guest.

**Non-Goals:**
- Handling RSVP form submissions (this is part of PSRP-014).
- Creating new email templates (the worker already supports them).

## Decisions

- **Token Generation**: Use `RandomNumberGenerator.GetBytes(32)` converted to Base64 to generate a cryptographically secure token. The database will only store the SHA-256 hash of this token to prevent compromise if the database is exposed. The plain text token is sent in the email link.
- **Asynchronous Email Processing**: Enqueue payloads to Dragonfly `email:queue`. The `EmailDispatcherWorker` will pick these up and process them asynchronously, creating `DeliveryLog` entries.
- **Status Polling**: The frontend will poll the new `/api/events/{slug}/invitations` endpoint every 10 seconds to update delivery statuses without requiring WebSockets.

## Risks / Trade-offs

- [Risk] Database exposed leading to compromised invitations. → Mitigation: Store only SHA-256 hashes of the invitation tokens, not the raw tokens.
- [Risk] Duplicate invitations sent to the same guest. → Mitigation: Service layer enforces one invitation per guest check before creating a new one.
