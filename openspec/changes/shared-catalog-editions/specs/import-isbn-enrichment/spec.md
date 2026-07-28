## MODIFIED Requirements

### Requirement: Enrich imported books by ISBN

The system SHALL after Goodreads import resolve metadata by checking `catalog_editions` by ISBN (`isbn13` preferred, else `isbn10`) before calling Open Library or Google Books.

When catalog metadata is missing locally, the system SHALL lookup external catalog APIs, upsert `catalog_editions`, link the imported `books` row, and set missing cover (via catalog) and missing user `genre_id` (via existing genre resolution).

The system SHALL skip external catalog lookup when the linked catalog edition already provides cover and genre resolution is satisfied for the user library row.

#### Scenario: ISBN import uses local catalog cache

- **WHEN** a newly imported book has ISBN matching an existing `catalog_editions` row with cover metadata
- **THEN** no external catalog API call is made for that ISBN
- **THEN** the user library row links to the existing catalog edition

#### Scenario: ISBN import gains cover and genre from API

- **WHEN** a newly imported book has ISBN, no local catalog row exists, and external catalog returns metadata
- **THEN** a `catalog_editions` row is created
- **THEN** missing cover and genre resolution are applied to the user library row

#### Scenario: Already enriched book skipped

- **WHEN** a linked catalog edition and user library row already have cover and genre satisfied
- **THEN** no external catalog lookup is performed

#### Scenario: Catalog miss leaves Goodreads data

- **WHEN** local catalog and external APIs return no ISBN match
- **THEN** the book remains imported with Goodreads-only fields on a manual or partial catalog link
