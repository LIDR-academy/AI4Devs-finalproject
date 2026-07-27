## MODIFIED Requirements

### Requirement: Book tracker read format persistence

The system SHALL allow users to set and clear reading format in tracker/edit flows using owned format ids from `formats`.

#### Scenario: Select owned format

- **WHEN** the user selects a format from the reading form/tracker selector
- **THEN** the client sends `format_id` in PATCH reading-record
- **AND** the selected format persists after reload

#### Scenario: Reject foreign format id

- **WHEN** the user submits a `format_id` not owned by their account
- **THEN** the API responds HTTP 400 with code `FORMAT_NOT_FOUND`

#### Scenario: Clear format selection

- **WHEN** the user clears the format selector
- **THEN** the client sends `format_id: null`
- **AND** the reading record stores null format
