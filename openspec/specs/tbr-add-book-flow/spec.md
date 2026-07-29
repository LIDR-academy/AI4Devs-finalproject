## Purpose

Add to TBR modal flow: pending-only library picker, catalog search to create+add new books, server-side pending eligibility, and cache invalidation after add (KAN-10).

## Requirements

### Requirement: Library picker shows pending books only

The Add to TBR modal SHALL list library books with `reading_status === pendiente` that are not already entries on the displayed monthly TBR. It SHALL NOT list books in `leyendo`, `leido`, or `dnf`.

#### Scenario: Pending book available

- **WHEN** the user opens the Library tab and owns a book with `reading_status` `pendiente` not on the current TBR
- **THEN** that book appears as a selectable option

#### Scenario: In-progress book excluded

- **WHEN** the user opens the Library tab and owns a book with `reading_status` `leyendo`
- **THEN** that book does not appear in the list

#### Scenario: Already on TBR excluded

- **WHEN** a pending book is already an entry on the current monthly TBR
- **THEN** it does not appear in the library picker

#### Scenario: No pending books empty state

- **WHEN** the user has no eligible pending library books
- **THEN** the modal shows a message directing them to use catalog search

### Requirement: Catalog search in Add to TBR modal

The Add to TBR modal SHALL provide a search interface that queries `GET /v1/books/catalog/search` and lets the user select a catalog edition to add.

#### Scenario: Search returns results

- **WHEN** the user enters a query of at least 2 characters in the Search tab
- **THEN** the client displays catalog editions from the search response

#### Scenario: Add catalog edition not in library

- **WHEN** the user selects a catalog edition and confirms
- **THEN** the client calls `POST /v1/books` to create the book
- **AND** the created book has `reading.status` `pendiente`
- **AND** the client calls `POST /v1/tbr/{year}/{month}/entries` with the new `book_id`
- **AND** the TBR checklist refreshes without a full page reload

#### Scenario: Catalog edition already in library as pending

- **WHEN** `POST /v1/books` returns 409 because the edition already exists and the existing book is `pendiente`
- **THEN** the client adds that book to the TBR via `POST /v1/tbr/{year}/{month}/entries`

#### Scenario: Catalog edition already in library but not pending

- **WHEN** the duplicate book in the library has `reading_status` other than `pendiente`
- **THEN** the client does not add it to the TBR and shows an error that only pending books can be added

### Requirement: TBR entry eligibility on server

The system SHALL reject `POST /v1/tbr/{year}/{month}/entries` when the target book's `reading_records.status` is not `pendiente`.

#### Scenario: Add pending book succeeds

- **WHEN** the user posts a `book_id` they own with `reading_records.status` `pendiente`
- **THEN** the system responds with HTTP 201 and creates the TBR entry

#### Scenario: Add non-pending book rejected

- **WHEN** the user posts a `book_id` with `reading_records.status` `leyendo`, `leido`, or `dnf`
- **THEN** the system responds with HTTP 422 and error code `TBR_BOOK_NOT_PENDING`

### Requirement: Cache invalidation after add

After a successful library or catalog add to TBR, the client SHALL invalidate TanStack Query caches for `['books']` and `['tbr', year, month]`.

#### Scenario: Refresh after catalog add

- **WHEN** a catalog edition is created and added to the TBR
- **THEN** subsequent views of Lists and Book Tracker reflect the new book without manual reload
