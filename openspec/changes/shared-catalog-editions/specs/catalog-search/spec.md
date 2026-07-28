## ADDED Requirements

### Requirement: Local catalog search before external APIs

The system SHALL query `catalog_editions` for matching rows before calling Open Library or Google Books on catalog search requests.

#### Scenario: Local hit avoids external call for known edition

- **WHEN** an authenticated user searches by ISBN that exists in `catalog_editions`
- **THEN** the system returns the local edition in results
- **THEN** the system does not call external catalog APIs for that ISBN match

#### Scenario: Local results merged with external results

- **WHEN** a title or author search finds matches in `catalog_editions` and external APIs return additional editions
- **THEN** the response includes local and external editions deduplicated by ISBN or provider identity
- **THEN** external-only editions are upserted into `catalog_editions` for future reuse

## MODIFIED Requirements

### Requirement: Open Library as primary source

The system SHALL query the local `catalog_editions` table first, then query the Open Library API for matches not already satisfied locally.

#### Scenario: Results from Open Library

- **WHEN** an authenticated user submits a valid search query, local catalog has no sufficient matches, and Open Library returns one or more matches
- **THEN** the system returns those editions mapped to the unified `CatalogEdition` shape with `data_source` set to `open_library`
- **THEN** new editions are persisted to `catalog_editions`
- **THEN** the system does not call Google Books for that request when Open Library returns matches

#### Scenario: Empty Open Library response triggers fallback

- **WHEN** local catalog and Open Library return no matches for a valid query
- **THEN** the system automatically queries Google Books exactly once
- **THEN** returned editions use `data_source` set to `google_books` when matches exist
- **THEN** new Google Books editions are persisted to `catalog_editions`

#### Scenario: Open Library failure triggers fallback

- **WHEN** Open Library request fails due to timeout or HTTP error after local search
- **THEN** the system automatically queries Google Books exactly once
- **THEN** the user receives Google Books results when available, without being required to retry manually

### Requirement: Unified catalog edition payload

Each search result item SHALL include at minimum: `title`, `authors`, `data_source`, and `external_provider_id`. It SHALL optionally include `cover_image_url`, `page_count`, `genre`, `isbn_13`, `isbn_10`, and `catalog_edition_id` when persisted locally.

#### Scenario: Metadata visible to selection UI

- **WHEN** search returns one or more editions
- **THEN** each item includes fields sufficient for the client to render cover, title, author, genre, page count, and ISBN from effective local or provider data
