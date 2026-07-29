## ADDED Requirements

### Requirement: Partial update of reading record

The system SHALL expose an authenticated `PATCH /v1/books/{bookId}/reading-record` endpoint that partially updates the `reading_records` row for the given book owned by the authenticated user.

#### Scenario: Successful patch of status

- **WHEN** the user sends a valid JSON body with at least one allowed field and a `bookId` that belongs to them
- **THEN** the system responds with HTTP 200 and a body containing `reading` (full record) and `book` with `id` and `page_count`

#### Scenario: Book not found or not owned

- **WHEN** the `bookId` does not exist or belongs to another user
- **THEN** the system responds with HTTP 404

#### Scenario: Empty or invalid body

- **WHEN** the request body is empty or fails `class-validator` rules
- **THEN** the system responds with HTTP 400

### Requirement: Allowed patch fields

The system SHALL accept only these optional fields in the request body: `status`, `started_on`, `finished_on`, `rating`, `read_format`. The body MUST contain at least one field.

#### Scenario: Valid status enum

- **WHEN** the client sends `status` with value `pendiente`, `leyendo`, `leido`, or `dnf`
- **THEN** the system persists the new status on `reading_records`

#### Scenario: Valid read format

- **WHEN** the client sends `read_format` as `fisico`, `ebook`, or `audio`
- **THEN** the system persists the value on `reading_records`

### Requirement: Auto-fill started date on reading

The system SHALL set `started_on` to the current UTC calendar date when `status` changes to `leyendo` and the request does not include `started_on`.

#### Scenario: Pending to reading without start date

- **WHEN** the record is `pendiente` and the patch sets `status` to `leyendo` without `started_on`
- **THEN** the response `reading.started_on` is today's date (UTC)

### Requirement: Auto-fill finished date on completed

The system SHALL set `finished_on` to the current UTC calendar date when `status` changes to `leido` and the request does not include `finished_on`.

#### Scenario: Transition to read without finish date

- **WHEN** the patch sets `status` to `leido` without `finished_on`
- **THEN** the response `reading.finished_on` is today's date (UTC)

### Requirement: Completion progress when page count known

The system SHALL set `current_page` to `books.page_count` and `progress_percent` to 100 when transitioning to `leido` and the book has a non-null `page_count`.

#### Scenario: Mark read with page count

- **WHEN** status changes to `leido` and `page_count` is 304
- **THEN** `reading.current_page` is 304 and `progress_percent` reflects 100%

### Requirement: Open completion modal metadata

The system SHALL include `meta.openCompletionModal: true` in the response when `status` transitions to `leido` from any other status. The system SHALL NOT set `meta.openCompletionModal` when the record was already `leido`.

#### Scenario: First transition to read

- **WHEN** status changes from `leyendo` to `leido`
- **THEN** the response includes `meta.openCompletionModal` equal to true

#### Scenario: Patch rating on already read book

- **WHEN** status is already `leido` and the patch only updates `rating`
- **THEN** the response does not include `meta.openCompletionModal` true

### Requirement: No TBR side effects in this capability

The system SHALL NOT set `meta.tbrAutoCompleted` or invoke TBR services in this change.

#### Scenario: Mark read without TBR module

- **WHEN** status changes to `leido`
- **THEN** the response omits `tbrAutoCompleted` or sets it false

### Requirement: Date order validation

The system SHALL reject patches where both `started_on` and `finished_on` are set and `finished_on` is before `started_on`.

#### Scenario: Finish before start

- **WHEN** the client sends `started_on` 2026-04-10 and `finished_on` 2026-04-01
- **THEN** the system responds with HTTP 422 and a stable error code (e.g. `FINISHED_BEFORE_STARTED`)

### Requirement: Rating range validation

The system SHALL accept `rating` only as integer 1–5 or omit/null to clear when supported by API contract.

#### Scenario: Invalid rating

- **WHEN** the client sends `rating` 0 or 6
- **THEN** the system responds with HTTP 400
