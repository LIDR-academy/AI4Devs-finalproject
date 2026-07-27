# format-delete-confirmation Specification

## Purpose

Affected-reading count preview and Settings confirmation UX before deleting a formato (KAN-74).

## Requirements

### Requirement: Affected reading count preview

The system SHALL expose `GET /v1/formats/{id}/affected-readings` for the authenticated owner returning `{ affected_reading_count: number }`.

The count SHALL include only reading records owned by the user (via the parent book) with `format_id` equal to the format id.

The system SHALL return HTTP 404 when the format id is not owned by the user.

#### Scenario: Count readings assigned to format

- **GIVEN** format A is assigned on 2 reading records for the user's books
- **WHEN** the user calls `GET /v1/formats/{A}/affected-readings`
- **THEN** the response is HTTP 200 with `{ affected_reading_count: 2 }`

#### Scenario: Zero readings assigned

- **GIVEN** format B has no reading records assigned
- **WHEN** the user calls `GET /v1/formats/{B}/affected-readings`
- **THEN** the response is HTTP 200 with `{ affected_reading_count: 0 }`

### Requirement: Delete confirmation in Settings

The Settings Formato section SHALL fetch the affected reading count when the user clicks delete.

When `affected_reading_count > 0`, the UI SHALL show a confirmation dialog stating how many readings are affected and that those readings will have no format after delete.

When `affected_reading_count` is 0, the UI SHALL delete immediately without a confirmation dialog.

#### Scenario: Confirm when readings assigned

- **WHEN** the user clicks delete on a format assigned to 2 readings
- **THEN** a confirmation dialog shows the count and impact message
- **AND** delete proceeds only after confirm

#### Scenario: Direct delete when none assigned

- **WHEN** the user clicks delete on a format with zero assigned readings
- **THEN** the format is deleted without a confirmation dialog

#### Scenario: Readings cleared after confirmed delete

- **WHEN** the user confirms delete of a format assigned to readings
- **THEN** those reading records have `format_id` null after reload
