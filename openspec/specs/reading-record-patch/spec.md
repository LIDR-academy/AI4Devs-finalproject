## Requirements

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

### Requirement: TBR auto-complete on mark as read

When `status` transitions to `leido` from any other status, the system SHALL invoke `TBRService.markCompletedIfInActiveMonthTbr(userId, bookId, finishedOn)` to mark matching open entries in the user's **active calendar month** TBR as completed. The active month SHALL be derived from the persisted `finished_on` date (UTC calendar month) after server auto-fill rules apply.

#### Scenario: Book in active-month TBR marked read (KAN-13 / US-04 scenario 8)

- **WHEN** status changes to `leido` and the book has an open entry (`completed = false`) in the user's TBR for the active month
- **THEN** that entry is set to `completed = true` with `completed_at` populated and the response includes `meta.tbrAutoCompleted: true`

#### Scenario: Book not in active-month TBR

- **WHEN** status changes to `leido` and the book has no open entry in the active month's TBR
- **THEN** the response omits `tbrAutoCompleted` or sets it to `false`

#### Scenario: Already completed TBR entry

- **WHEN** status changes to `leido` and the book's TBR entry for the active month is already `completed = true`
- **THEN** the system does not error and `meta.tbrAutoCompleted` is omitted or `false`

#### Scenario: No transition to read

- **WHEN** status is already `leido` and the patch only updates `rating` or dates
- **THEN** TBR auto-complete is not invoked and `meta.tbrAutoCompleted` is not set

#### Scenario: TBR update failure does not fail PATCH

- **WHEN** status transitions to `leido` but the TBR completion update fails internally
- **THEN** the reading record remains saved with status `leido` and the response omits `meta.tbrAutoCompleted`

### Requirement: Date order validation

The system SHALL reject patches where both `started_on` and `finished_on` are set and `finished_on` is before `started_on`.

#### Scenario: Finish before start

- **WHEN** the client sends `started_on` 2026-04-10 and `finished_on` 2026-04-01
- **THEN** the system responds with HTTP 422 and a stable error code (e.g. `FINISHED_BEFORE_STARTED`)

### Requirement: Rating range validation

The system SHALL accept `rating` as a number from 0.5 to 5.0 inclusive in steps of 0.5, or omit/null to clear when supported by API contract.

#### Scenario: Valid half-star rating

- **WHEN** the client sends `rating: 3.5` on a `leido` book
- **THEN** the system persists `3.5` and returns it in the reading record response

#### Scenario: Invalid rating below range

- **WHEN** the client sends `rating: 0` or `rating: 0.25`
- **THEN** the system responds with HTTP 400

#### Scenario: Invalid rating above range

- **WHEN** the client sends `rating: 5.5` or `rating: 6`
- **THEN** the system responds with HTTP 400

#### Scenario: Invalid non-half-step rating

- **WHEN** the client sends `rating: 3.3`
- **THEN** the system responds with HTTP 400
