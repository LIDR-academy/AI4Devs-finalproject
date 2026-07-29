# book-cover-search-api Specification

## Purpose

Cover search for owned books in edit context, composing catalog search and per-edition cover resolution (KAN-77, KAN-76 epic).

## Requirements

### Requirement: Cover search for owned book

The system SHALL expose `GET /v1/books/{bookId}/cover-search` for the authenticated owner.

When `q` is omitted, the system SHALL search using the saved book's `title` and `authors` as the default query.

When `q` is provided, the system SHALL use that string (minimum 2 characters after trim) instead of the default.

The system SHALL return HTTP 404 when the book does not exist or is not owned by the user.

#### Scenario: Default search from saved book metadata

- **GIVEN** an owned book titled "Fourth Wing" by "Rebecca Yarros"
- **WHEN** the user calls `GET /v1/books/{bookId}/cover-search` without `q`
- **THEN** the system searches the catalog using a query derived from title and authors
- **AND** returns editions with resolved covers

#### Scenario: Refined search query

- **WHEN** the user calls `GET /v1/books/{bookId}/cover-search?q=Fourth Wing hardcover`
- **THEN** the system searches using that query

#### Scenario: Foreign book rejected

- **WHEN** the user requests cover search for another user's book id
- **THEN** the response is HTTP 404

### Requirement: Per-edition cover resolution

For each catalog search hit, the system SHALL resolve covers using the same logic as `GET /v1/books/catalog/covers` for that edition's `data_source` and `external_provider_id`, including the search result `cover_image_url` as hint when present.

Each edition in the response SHALL include at most 12 cover options.

#### Scenario: Edition with covers included

- **WHEN** a catalog edition resolves at least one cover image
- **THEN** the response `items` includes that edition with `covers` and `default_cover_id`

#### Scenario: Edition without covers omitted

- **WHEN** a catalog edition resolves zero covers
- **THEN** that edition is not included in `items`

### Requirement: Empty results without error

- **WHEN** catalog search returns no editions or no edition has resolvable covers
- **THEN** the system responds HTTP 200 with `items: []`
