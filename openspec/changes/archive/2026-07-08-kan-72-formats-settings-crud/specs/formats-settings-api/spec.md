## ADDED Requirements

### Requirement: List user formats

The system SHALL expose `GET /v1/formats` for the authenticated user returning all owned formats ordered by name ascending.

#### Scenario: List after registration

- **WHEN** the user calls `GET /v1/formats`
- **THEN** the response is HTTP 200 with an array including seeded defaults Audio, Ebook, Físico

### Requirement: Create format

The system SHALL expose `POST /v1/formats` with body `{ name }` for the authenticated user.

The system SHALL validate `name` length between 1 and 100 characters after trim.

The system SHALL reject case-insensitive duplicate names for the same user with HTTP 409.

#### Scenario: Create new format

- **WHEN** the user POSTs `{ "name": "Audiolibro por capítulos" }`
- **THEN** the response is HTTP 201 with the created format including that name

#### Scenario: Reject duplicate

- **WHEN** the user already has `Físico` and POSTs `{ "name": "físico" }`
- **THEN** the response is HTTP 409

### Requirement: Delete format

The system SHALL expose `DELETE /v1/formats/{id}` for the authenticated owner and respond HTTP 204 on success.

#### Scenario: Delete owned format

- **WHEN** the user DELETEs a format they own
- **THEN** the response is HTTP 204
- **AND** subsequent GET no longer includes that format
- **AND** reading records that referenced the format have `format_id` set to null

#### Scenario: Delete other user's format

- **WHEN** the user DELETEs a format id not owned by them
- **THEN** the response is HTTP 404

### Requirement: Settings Formato section

The Profile / Settings page SHALL include a **Formato** section listing the user's formats and allowing add and delete.

#### Scenario: Add from Settings

- **WHEN** the user adds "Audiolibro por capítulos" in Settings > Formato
- **THEN** the new label appears in the list

#### Scenario: Duplicate error in UI

- **WHEN** the user adds a duplicate format name
- **THEN** the UI shows an error and does not add a duplicate row
