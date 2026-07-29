## ADDED Requirements

### Requirement: Affected book count preview

The system SHALL expose `GET /v1/audiences/{id}/affected-books` for the authenticated owner returning `{ affected_book_count: number }`.

The system SHALL return HTTP 404 when the audience id is not owned by the user.

#### Scenario: Count assigned books

- **WHEN** the user has 3 books with `audience_id` set to audience A
- **AND** the user calls `GET /v1/audiences/{A}/affected-books`
- **THEN** the response is HTTP 200 with `{ affected_book_count: 3 }`

#### Scenario: No assigned books

- **WHEN** no books reference the audience
- **THEN** the response is HTTP 200 with `{ affected_book_count: 0 }`

### Requirement: Delete confirmation in Settings

The Settings público objetivo section SHALL fetch the affected book count when the user clicks delete.

When `affected_book_count > 0`, the UI SHALL show a confirmation dialog stating how many books are affected and that those books will have no público objetivo after delete.

When `affected_book_count` is 0, the UI SHALL delete immediately without a confirmation dialog.

#### Scenario: Confirm delete with assigned books

- **WHEN** the user clicks delete on an audience assigned to 2 books
- **THEN** a confirmation dialog shows the count of 2 books
- **AND** delete proceeds only after the user confirms

#### Scenario: Direct delete without books

- **WHEN** the user clicks delete on an audience with zero assigned books
- **THEN** the audience is removed without a confirmation dialog

#### Scenario: Books cleared after delete

- **WHEN** the user confirms delete of an audience assigned to books
- **THEN** those books have `audience_id` null after the operation completes
