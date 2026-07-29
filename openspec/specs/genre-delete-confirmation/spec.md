# genre-delete-confirmation Specification

## Purpose

Affected-book count preview and Settings confirmation UX before deleting a genre (KAN-62).

## Requirements

### Requirement: Affected book count preview

The system SHALL expose `GET /v1/genres/{id}/affected-books` for the authenticated owner returning `{ affected_book_count: number }`.

The count SHALL include only books owned by the user with `genre_id` equal to the genre id.

The system SHALL return HTTP 404 when the genre id is not owned by the user.

#### Scenario: Count books assigned to genre

- **GIVEN** genre A is assigned on 5 books for the user
- **WHEN** the user calls `GET /v1/genres/{A}/affected-books`
- **THEN** the response is HTTP 200 with `{ affected_book_count: 5 }`

#### Scenario: Zero books assigned

- **GIVEN** genre B has no books assigned
- **WHEN** the user calls `GET /v1/genres/{B}/affected-books`
- **THEN** the response is HTTP 200 with `{ affected_book_count: 0 }`

### Requirement: Delete confirmation in Settings

The Settings Géneros section SHALL fetch the affected book count when the user clicks delete.

When `affected_book_count > 0`, the UI SHALL show a confirmation dialog stating how many books are affected and that those books will have no genre after delete.

When `affected_book_count` is 0, the UI SHALL delete immediately without a confirmation dialog.

#### Scenario: Confirm when books assigned

- **WHEN** the user clicks delete on a genre assigned to 5 books
- **THEN** a confirmation dialog shows the count and impact message
- **AND** delete proceeds only after confirm

#### Scenario: Direct delete when none assigned

- **WHEN** the user clicks delete on a genre with zero assigned books
- **THEN** the genre is deleted without a confirmation dialog

#### Scenario: Books cleared after confirmed delete

- **WHEN** the user confirms delete of a genre assigned to books
- **THEN** those books have `genre_id` null after reload
