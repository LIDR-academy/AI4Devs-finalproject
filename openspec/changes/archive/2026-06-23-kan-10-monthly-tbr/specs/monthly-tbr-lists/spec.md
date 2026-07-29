## ADDED Requirements

### Requirement: Monthly TBR persistence

The system SHALL persist monthly TBR data in `monthly_tbr_lists` and `tbr_entries` tables with `UNIQUE (user_id, year, month)` on lists and `UNIQUE (monthly_tbr_id, book_id)` on entries.

#### Scenario: One list per user per month

- **WHEN** a monthly TBR is created for user U and calendar month (2026, 4)
- **THEN** a second create attempt for the same (U, 2026, 4) does not insert a duplicate row

#### Scenario: One book per list

- **WHEN** book B is already an entry in list L
- **THEN** adding B again to L is rejected with HTTP 409

### Requirement: Get or create monthly TBR

The system SHALL expose `GET /v1/tbr/{year}/{month}` that returns the monthly TBR for the authenticated user, creating an empty list when none exists for that month.

#### Scenario: First access creates list (KAN-10 scenario 1)

- **WHEN** the user requests `GET /v1/tbr/{year}/{month}` and no list exists for that month
- **THEN** the system creates an empty list and responds with HTTP 200 including `list` metadata and `entries: []`

#### Scenario: Existing list returned

- **WHEN** a list already exists for the requested month (manual or auto-created)
- **THEN** the system responds with HTTP 200 and does not create a duplicate

#### Scenario: Invalid month

- **WHEN** `month` is outside 1–12
- **THEN** the system responds with HTTP 400

### Requirement: Auto-create job before month start

The system SHALL run a scheduled job that creates an empty monthly TBR with `auto_created = true` for each user when the next calendar day is the first day of a month and no list yet exists for that target month.

#### Scenario: Job creates upcoming month list

- **WHEN** the job runs on the last day of April 2026 and user U has no list for May 2026
- **THEN** an empty list for (2026, 5) is inserted with `auto_created = true`

#### Scenario: Job skips existing manual list

- **WHEN** user U already created the May 2026 list manually
- **THEN** the job does not insert a second list for (2026, 5)

### Requirement: Add book to monthly TBR

The system SHALL expose `POST /v1/tbr/{year}/{month}/entries` accepting `{ "book_id": "<uuid>" }` that adds the book to the user's list for that month after `getOrCreate`.

#### Scenario: Successful add

- **WHEN** the user posts a `book_id` they own and the book is not already in the list
- **THEN** the system responds with HTTP 201 and the new entry with `completed = false` and ascending `sort_order`

#### Scenario: Book not owned

- **WHEN** the `book_id` does not exist or belongs to another user
- **THEN** the system responds with HTTP 404

### Requirement: Remove book from monthly TBR

The system SHALL expose `DELETE /v1/tbr/{year}/{month}/entries/{entryId}` that removes an entry from the user's list for that month.

#### Scenario: Successful remove

- **WHEN** the entry belongs to the authenticated user's list for the given month
- **THEN** the system deletes the entry and responds with HTTP 204 or 200

#### Scenario: Entry not found

- **WHEN** the entry id does not exist in the user's list for that month
- **THEN** the system responds with HTTP 404

### Requirement: Entry payload includes book summary

The system SHALL embed a book summary on each entry in `GET /v1/tbr/{year}/{month}` responses: `id`, `title`, `authors`, `cover_image_url`, and `reading_status`.

#### Scenario: List with entries

- **WHEN** the list has one or more entries
- **THEN** each entry includes the book summary fields for rendering the checklist

### Requirement: User scoping

All TBR endpoints SHALL scope data by the authenticated user's `user_id` from the JWT.

#### Scenario: Cross-user access

- **WHEN** a user requests TBR data or mutates entries for resources they do not own
- **THEN** the system responds with HTTP 404
