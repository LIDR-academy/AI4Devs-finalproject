## Requirements

### Requirement: List cover variants for a catalog edition

The system SHALL expose an authenticated endpoint that returns available cover images for a given catalog edition identified by `data_source` and `external_provider_id`.

#### Scenario: Open Library work with multiple editions

- **WHEN** the client requests covers for an Open Library work key (e.g. `/works/OL82563W`)
- **THEN** the system queries Open Library edition data for that work
- **THEN** the response includes a `covers` array with distinct image URLs (up to the configured maximum)
- **THEN** each cover entry includes a stable `id` and a resolvable `url`

#### Scenario: Google Books volume with multiple image links

- **WHEN** the client requests covers for a Google Books `volumeId`
- **THEN** the system returns all distinct image URLs available in `volumeInfo.imageLinks`
- **THEN** URLs are normalized to HTTPS

### Requirement: Default cover suggestion

The response SHALL include `default_cover_id` matching the cover already shown in search results when available, or the first cover in the list otherwise.

#### Scenario: Default preselection

- **WHEN** covers are returned and a default is known
- **THEN** `default_cover_id` references one of the entries in `covers`

### Requirement: Empty cover list is valid

- **WHEN** no cover images can be resolved for the edition
- **THEN** the system responds with HTTP 200 and `covers: []`
- **THEN** the client can still proceed to save the book without a cover image

### Requirement: Cover list size limit

The system SHALL return at most 12 cover variants per request, deduplicated by normalized URL.

#### Scenario: Many editions on a popular work

- **WHEN** Open Library returns more than 12 distinct covers
- **THEN** the response contains no more than 12 entries

### Requirement: Invalid edition reference

- **WHEN** `data_source` or `external_provider_id` is missing or invalid
- **THEN** the system responds with HTTP 400
