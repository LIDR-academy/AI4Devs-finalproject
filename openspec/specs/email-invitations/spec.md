# Purpose

The Email Invitations capability allows event hosts to send secure RSVP links to their guests via email, track delivery statuses, and prevent duplicate invitations.

## Requirements

### Requirement: Invitation Token Generation
The system SHALL generate a 256-bit cryptographically secure random token for each invitation, storing only the SHA-256 hash in the database.

#### Scenario: New invitation creation
- **WHEN** the host requests to send invitations
- **THEN** a unique token is generated, hashed, and stored, and the plain token is included in the email RSVP link.

### Requirement: Send Invitations Endpoint
The system SHALL provide an endpoint to create invitations and enqueue them to the `email:queue`.

#### Scenario: Host sends invitations
- **WHEN** the host clicks "Send Email Invitations" for an event with guests
- **THEN** the system creates invitation records and enqueues emails, returning a success response.

### Requirement: Invitation Delivery Status
The system SHALL track and expose the delivery status of each invitation.

#### Scenario: Viewing guest delivery status
- **WHEN** the guest manager dashboard polls for invitations
- **THEN** it displays the current status (pending, sent, delivered, failed) for each guest.

### Requirement: Duplicate Prevention
The system SHALL NOT create duplicate invitations for a guest who already has one.

#### Scenario: Host re-sends invitations
- **WHEN** the host clicks "Send Email Invitations" but a guest already has an invitation
- **THEN** the system skips that guest and only creates invitations for guests without one.
