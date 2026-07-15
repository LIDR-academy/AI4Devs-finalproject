## Why

Currently, there is no way for the host to send invitations to guests via email. Implementing this feature will allow hosts to generate secure invitation tokens and enqueue customized emails with RSVP links directly from the dashboard, improving the guest management experience.

## What Changes

- Create cryptographically secure token generation for invitations (stored as SHA-256 hashes).
- Implement `IInvitationService` and `InvitationService` to handle invitation lifecycles.
- Add `POST /api/events/{slug}/invitations/send` and `GET /api/events/{slug}/invitations` endpoints.
- Update the guest manager dashboard with a "Send Email Invitations" button and delivery status badges.
- Enable automatic polling for delivery status updates in the guest manager.
- Enqueue invitation payloads to the `email:queue` for asynchronous processing.

## Capabilities

### New Capabilities
- `email-invitations`: Manages the lifecycle, token generation, API endpoints, and frontend integration for sending guest email invitations.

### Modified Capabilities

## Impact

- **Database**: Add/update the `Invitations` entity and related contexts.
- **Backend**: New API endpoints and service logic. Integration with Dragonfly queue.
- **Frontend**: Guest Manager component will be updated with new UI elements and polling logic.
