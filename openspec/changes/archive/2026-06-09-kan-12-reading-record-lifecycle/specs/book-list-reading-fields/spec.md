## ADDED Requirements

### Requirement: Library list includes reading metadata

The system SHALL extend each item returned by `GET /v1/books` with reading fields required for Book Tracker inline editing, in addition to existing `reading_status`.

#### Scenario: List item shape

- **WHEN** an authenticated user requests their library list
- **THEN** each item includes `reading_status`, `started_on`, `finished_on`, `rating`, and `read_format` (nullable where applicable)

#### Scenario: New book defaults

- **WHEN** a book was created with initial status `pendiente` and no dates
- **THEN** list item shows `reading_status` `pendiente` and null dates, rating, and format

### Requirement: Consistent snake_case API fields

The system SHALL use snake_case field names in JSON responses aligned with `docs/data-model.md` and existing `BookListItem` conventions.

#### Scenario: Field naming

- **WHEN** the list response is serialized
- **THEN** date fields are named `started_on` and `finished_on` (ISO date strings or null)
