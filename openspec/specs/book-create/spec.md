## Requirements

### Requirement: Create book in user library after edition selection

The system SHALL provide an authenticated `POST` endpoint to persist a selected catalog edition into the authenticated user's library.

#### Scenario: Successful create from catalog selection

- **WHEN** the user submits a valid `CreateBookRequest` body including required `title`, `authors`, and `data_source`
- **THEN** the system persists a row in `books` scoped to the authenticated `user_id`
- **THEN** the system responds with HTTP 201 and the created book payload

### Requirement: Initial reading status pending

The system SHALL create an associated reading record with status `pendiente` when a book is added through this flow.

#### Scenario: Reading record on create

- **WHEN** a book is successfully created via `POST /books`
- **THEN** the response includes a reading summary with `status` equal to `pendiente`
- **THEN** the book is eligible to appear in Book Tracker as a new pending item

### Requirement: Persist catalog provenance

The system SHALL store `data_source` and `external_provider_id` when provided by the catalog search result so editions remain traceable to Open Library or Google Books.

#### Scenario: Provenance from Open Library

- **WHEN** the request includes `data_source: open_library` and an `external_provider_id`
- **THEN** those values are stored on the `books` row unchanged

### Requirement: Duplicate detection

The system SHALL reject duplicate adds for the same user when an equivalent book already exists (same `isbn_13`, or same `data_source` + `external_provider_id`).

#### Scenario: Duplicate ISBN

- **WHEN** the user attempts to add a book with an `isbn_13` already present in their library
- **THEN** the system responds with HTTP 409 and a conflict code the client can surface

### Requirement: Request validation

The system SHALL validate the request body with NestJS pipes and `class-validator` rules aligned with README §4 (`CreateBookRequest`).

#### Scenario: Missing required fields

- **WHEN** `title`, `authors`, or `data_source` is missing
- **THEN** the system responds with HTTP 400 and field-level validation errors
