## ADDED Requirements

### Requirement: Post-Event Configuration
The system SHALL allow the host to configure a custom thank you message and an optional photo gallery URL for the event.

#### Scenario: Host saves post-event settings
- **WHEN** the host enters a custom thank you message or photo gallery URL in the Event Editor and saves
- **THEN** these fields are persisted to the Event model and used in the generation of the automated thank you cards.
