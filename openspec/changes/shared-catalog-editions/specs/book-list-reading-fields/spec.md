## ADDED Requirements

### Requirement: Effective bibliographic fields in library list

The system SHALL resolve bibliographic fields on each `GET /v1/books` list item from `catalog_editions` merged with `user_book_overrides` before serialization.

#### Scenario: List shows user override title

- **WHEN** a library book has a title override
- **THEN** the list item `title` reflects the override value, not the raw catalog title

#### Scenario: List shows catalog cover when no override

- **WHEN** a library book has no cover override
- **THEN** the list item `cover_image_url` reflects `catalog_editions.cover_image_url`

## MODIFIED Requirements

### Requirement: Library list includes reading metadata

The system SHALL extend each item returned by `GET /v1/books` with reading fields required for Book Tracker inline editing, in addition to existing `reading_status`.

Bibliographic fields on each item SHALL be effective values (override merged over catalog).

#### Scenario: List item shape

- **WHEN** an authenticated user requests their library list
- **THEN** each item includes effective bibliographic fields plus `reading_status`, `started_on`, `finished_on`, `rating`, and `read_format` (nullable where applicable)

#### Scenario: New book defaults

- **WHEN** a book was created with initial status `pendiente` and no dates
- **THEN** list item shows `reading_status` `pendiente` and null dates, rating, and format
