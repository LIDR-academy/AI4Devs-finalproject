## ADDED Requirements

### Requirement: Token-Based Access
The system SHALL grant access to the public RSVP form only if a valid token is provided.

#### Scenario: Valid token access
- **WHEN** a guest visits the RSVP link with a valid token
- **THEN** the system fetches the event and guest information and displays the form

#### Scenario: Invalid token access
- **WHEN** a guest visits the RSVP link with an invalid or tampered token
- **THEN** the system rejects the request and displays "This invitation link is not valid"

### Requirement: RSVP Submission
The system SHALL allow guests to submit or update their RSVP response (attendance, dietary restrictions, plus-one, message, transport needs) idempotently.

#### Scenario: Initial submission
- **WHEN** a guest submits their RSVP for the first time
- **THEN** the system creates a new RSVP record, updates the guest status, and shows a confirmation page

#### Scenario: Updating existing RSVP
- **WHEN** a guest submits their RSVP again
- **THEN** the system updates the existing RSVP record instead of creating a duplicate

### Requirement: RSVP Deadline Enforcement
The system SHALL enforce an RSVP deadline set to 7 days before the event date, after which submissions or updates are rejected.

#### Scenario: Attempting to RSVP past deadline
- **WHEN** a guest attempts to submit or update an RSVP less than 7 days before the event
- **THEN** the system returns a 403 Forbidden error and displays "RSVP deadline has passed"

### Requirement: Rate Limiting
The system SHALL limit the number of RSVP submissions to prevent spam.

#### Scenario: Rate limit exceeded
- **WHEN** a guest submits more than 5 RSVPs within an hour
- **THEN** the system rejects the request and returns a 429 Too Many Requests status
