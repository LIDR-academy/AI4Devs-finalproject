## MODIFIED Requirements

### Requirement: Partial book metadata update

The API SHALL allow the book owner to PATCH `/v1/books/{bookId}` with any subset of book metadata fields.

Bibliographic fields (`title`, `authors`, `cover_image_url`, `page_count`, `series_name`, `publication_year`) SHALL be written to `user_book_overrides` when they differ from the linked `catalog_editions` values, and SHALL revert overrides when the PATCH value equals the catalog value.

User-only fields (`notes`, `genre_id`, `audience_id`, legacy `audience`) SHALL continue to be updated on the `books` row directly.

The API response SHALL return effective metadata (override merged over catalog).

#### Scenario: Update title and authors

- **WHEN** the owner PATCHes `{ "title": "New Title", "authors": "New Author" }`
- **THEN** user overrides are stored for those fields
- **THEN** the response reflects the new effective values
- **THEN** the shared `catalog_editions` row is not modified

#### Scenario: Update cover_image_url

- **WHEN** the owner PATCHes `{ "cover_image_url": "https://covers.openlibrary.org/b/id/1-L.jpg" }`
- **THEN** the effective cover URL is updated via override
- **THEN** the shared catalog cover URL remains unchanged

#### Scenario: Clear cover_image_url

- **WHEN** the owner PATCHes `{ "cover_image_url": null }`
- **THEN** the effective cover URL is cleared for that user
- **THEN** other users linked to the same catalog edition still see the catalog cover

#### Scenario: Invalid cover_image_url rejected

- **WHEN** the owner PATCHes `{ "cover_image_url": "not-a-url" }`
- **THEN** the API returns 400

#### Scenario: Clear nullable field

- **WHEN** the owner PATCHes `{ "genre_id": null }`
- **THEN** the book genre is cleared on the user library row

#### Scenario: Empty body rejected

- **WHEN** the owner PATCHes `{}`
- **THEN** the API returns 400

#### Scenario: Cross-user isolation

- **WHEN** another user PATCHes the book
- **THEN** the API returns 404
