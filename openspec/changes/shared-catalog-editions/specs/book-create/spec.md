## MODIFIED Requirements

### Requirement: Create book in user library after edition selection

The system SHALL provide an authenticated `POST` endpoint to persist a selected catalog edition into the authenticated user's library.

The system SHALL upsert or reuse a row in `catalog_editions` from the request metadata before creating the user library link.

The system SHALL persist a user-scoped `books` row referencing `catalog_edition_id` rather than duplicating full bibliographic metadata on `books`.

#### Scenario: Successful create from catalog selection

- **WHEN** the user submits a valid `CreateBookRequest` body including required `title`, `authors`, and `data_source`
- **THEN** the system upserts or finds a matching `catalog_editions` row
- **THEN** the system persists a `books` row scoped to the authenticated `user_id` linked to that catalog edition
- **THEN** the system responds with HTTP 201 and the created book payload with effective bibliographic fields

#### Scenario: Create reuses existing catalog edition

- **WHEN** the user adds an edition whose `isbn_13` or `(data_source, external_provider_id)` already exists in `catalog_editions`
- **THEN** the system links the new `books` row to the existing catalog edition
- **THEN** the system does not call external catalog APIs solely to resolve metadata already stored locally

### Requirement: Persist catalog provenance

The system SHALL store `data_source` and `external_provider_id` on `catalog_editions` when provided by the catalog search result so editions remain traceable to Open Library or Google Books.

#### Scenario: Provenance from Open Library

- **WHEN** the request includes `data_source: open_library` and an `external_provider_id`
- **THEN** those values are stored on the linked `catalog_editions` row unchanged

### Requirement: Duplicate detection

The system SHALL reject duplicate adds for the same user when a library row already exists for the same catalog edition (resolved by `isbn_13`, or `data_source` + `external_provider_id`, or existing `catalog_edition_id` link).

#### Scenario: Duplicate ISBN

- **WHEN** the user attempts to add a book whose resolved catalog edition is already linked in their library
- **THEN** the system responds with HTTP 409 and a conflict code the client can surface
