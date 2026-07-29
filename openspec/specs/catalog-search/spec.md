## Requirements

### Requirement: Authenticated catalog search by title or author

The system SHALL expose an authenticated endpoint that accepts a search query (`q`) for book title or author name and returns a list of catalog editions normalized for the client.

### Requirement: Open Library as primary source

The system SHALL query the Open Library API first for every catalog search request.

#### Scenario: Results from Open Library

- **WHEN** an authenticated user submits a valid search query and Open Library returns one or more matches
- **THEN** the system returns those editions mapped to the unified `CatalogEdition` shape with `data_source` set to `open_library`
- **THEN** the system does not call Google Books for that request

#### Scenario: Empty Open Library response triggers fallback

- **WHEN** Open Library returns no matches for a valid query
- **THEN** the system automatically queries Google Books exactly once
- **THEN** returned editions use `data_source` set to `google_books` when matches exist

#### Scenario: Open Library failure triggers fallback

- **WHEN** Open Library request fails due to timeout or HTTP error
- **THEN** the system automatically queries Google Books exactly once
- **THEN** the user receives Google Books results when available, without being required to retry manually

### Requirement: Unified catalog edition payload

Each search result item SHALL include at minimum: `title`, `authors`, `data_source`, and `external_provider_id`. It SHALL optionally include `cover_image_url`, `page_count`, `genre`, `isbn_13`, and `isbn_10`.

#### Scenario: Metadata visible to selection UI

- **WHEN** search returns one or more editions
- **THEN** each item includes fields sufficient for the client to render cover, title, author, genre, page count, and ISBN when the upstream API provides them

### Requirement: No results without error for empty catalog

- **WHEN** both Open Library and Google Books return no matches or fail without usable data
- **THEN** the system responds with HTTP 200 and an empty `items` array (or equivalent)
- **THEN** the client can show a no-results state without a server error

### Requirement: Query validation

The system SHALL reject invalid search queries (e.g. shorter than 2 characters after trim) with HTTP 400 and a validation message.

#### Scenario: Query too short

- **WHEN** the user submits `q` with fewer than 2 non-whitespace characters
- **THEN** the system responds with HTTP 400
