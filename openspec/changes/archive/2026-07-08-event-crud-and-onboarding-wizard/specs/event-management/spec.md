## ADDED Requirements

### Requirement: Event Creation
The system SHALL allow authenticated users to create a new event. The system MUST generate a unique URL-friendly slug based on the event name. The system MUST enqueue a DataRetentionJob scheduled for 30 days after the event date.

#### Scenario: Successful event creation
- **WHEN** an authenticated user submits valid event data
- **THEN** a new event is created with status "draft", a unique slug is generated, and a DataRetentionJob is scheduled

#### Scenario: Duplicate slug resolution
- **WHEN** an event is created that resolves to an existing slug
- **THEN** the system appends an incrementing number (e.g. `-2`) to ensure uniqueness

### Requirement: Event Retrieval
The system SHALL allow the event owner to retrieve the event details including guest counts and RSVP stats.

#### Scenario: Owner retrieves event
- **WHEN** the event owner requests the event via its slug
- **THEN** the system returns the event details and associated statistics

#### Scenario: Unauthorized retrieval attempt
- **WHEN** a user who is not the event owner requests the event via its slug
- **THEN** the system returns a 403 Forbidden error

### Requirement: Event Update
The system SHALL allow the event owner to update event details.

#### Scenario: Successful update
- **WHEN** the event owner submits valid updated event data
- **THEN** the event is updated successfully
