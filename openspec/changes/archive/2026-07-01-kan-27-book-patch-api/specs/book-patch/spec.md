## ADDED Requirements

### Requirement: Partial book metadata update

The API SHALL allow the book owner to PATCH `/v1/books/{bookId}` with any subset of book metadata fields.

#### Scenario: Update title and authors

- **WHEN** the owner PATCHes `{ "title": "New Title", "authors": "New Author" }`
- **THEN** the book metadata updates and the response reflects new values

#### Scenario: Clear nullable field

- **WHEN** the owner PATCHes `{ "genre": null }`
- **THEN** the book genre is cleared

#### Scenario: Empty body rejected

- **WHEN** the owner PATCHes `{}`
- **THEN** the API returns 400

#### Scenario: Cross-user isolation

- **WHEN** another user PATCHes the book
- **THEN** the API returns 404

### Requirement: Manual book create

The API SHALL accept `POST /v1/books` with `data_source: manual` and optional metadata fields.

#### Scenario: Manual create with metadata

- **WHEN** the user POSTs a manual book with title, authors, page_count, genre, and audience
- **THEN** the book is created with `data_source: manual` and reading status `pendiente`

#### Scenario: Invalid page count rejected

- **WHEN** PATCH or POST includes `page_count` less than 0
- **THEN** the API returns 400
