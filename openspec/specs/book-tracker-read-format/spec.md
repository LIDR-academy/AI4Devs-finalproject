# book-tracker-read-format Specification

## Purpose

Selectable read format in Book Tracker, completion modal, and book form; options load from the user's configured formats (`/v1/formats`). Format remains null until the user chooses (KAN-30, KAN-73, UC-04).

## Requirements

### Requirement: Inline read format column

The Book Tracker SHALL display an editable read format control per row, populated from the authenticated user's formats.

#### Scenario: Select format inline (UC-04, KAN-30, KAN-73)

- **WHEN** the user chooses a format from the row format selector
- **THEN** the client PATCHes `format_id` and the row updates

#### Scenario: Empty until chosen

- **WHEN** a book is created or status changes without explicit format selection
- **THEN** `format_id` remains null and the selector shows empty

#### Scenario: Accessible format control

- **WHEN** the format selector receives keyboard focus
- **THEN** it has an associated label and is operable without a mouse

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
