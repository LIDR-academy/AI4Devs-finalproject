## ADDED Requirements

### Requirement: Sparse user bibliographic overrides

The system SHALL persist per-user bibliographic overrides in `user_book_overrides` keyed by `user_book_id` (FK to `books.id`, ON DELETE CASCADE).

Override columns SHALL be nullable for: `title`, `authors`, `cover_image_url`, `page_count`, `series_name`, `publication_year`.

A null override column SHALL mean "inherit from `catalog_editions`" for that field.

#### Scenario: User edits title only

- **WHEN** a user PATCHes a different title for their library book
- **THEN** `user_book_overrides.title` is set to the new value
- **THEN** other bibliographic fields without overrides continue to reflect `catalog_editions`

#### Scenario: User reverts edit to catalog value

- **WHEN** a user PATCHes a bibliographic field to the same value as `catalog_editions`
- **THEN** the corresponding override column is cleared (removed or set to inherit)
- **THEN** the API response matches the catalog value

### Requirement: Shared catalog is immutable from user edits

The system SHALL NOT update `catalog_editions` rows as a result of user PATCH operations on `/v1/books/{bookId}`.

#### Scenario: User changes cover

- **WHEN** the owner PATCHes `{ "cover_image_url": "https://example.com/custom.jpg" }`
- **THEN** only `user_book_overrides.cover_image_url` (or equivalent) is updated
- **THEN** the `catalog_editions.cover_image_url` for linked edition remains unchanged

### Requirement: Effective metadata resolution

The system SHALL expose bibliographic book fields in API responses as effective values computed as `COALESCE(override, catalog)` for each overridable field.

User-only fields (`notes`, `genre_id`, `audience_id`, reading record fields) SHALL come from `books` and `reading_records` only.

The system SHALL compute `has_overrides` as true when any override column is explicitly set for that library book.

#### Scenario: Two users same edition different titles

- **WHEN** user A and user B share the same `catalog_edition_id`
- **AND** user B has an override title
- **THEN** user A's list shows the catalog title
- **THEN** user B's list shows the override title

#### Scenario: Optional catalog_edition_id in response

- **WHEN** a book is returned in `BookDto` or list item shape
- **THEN** the payload MAY include `catalog_edition_id` and `has_overrides` without breaking existing clients
