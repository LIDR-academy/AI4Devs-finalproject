## ADDED Requirements

### Requirement: Shared catalog editions table

The system SHALL persist canonical bibliographic metadata in a global `catalog_editions` table not scoped by `user_id`.

The table SHALL include at minimum: `id` (UUID PK), `title`, `authors`, `isbn_13`, `isbn_10`, `cover_image_url`, `page_count`, `series_name`, `publication_year`, `catalog_genre` (raw provider genre text), `data_source`, `external_provider_id`, `created_at`, `updated_at`.

#### Scenario: Catalog row has no user_id

- **WHEN** a catalog edition is persisted
- **THEN** the row exists in `catalog_editions` without a `user_id` column or equivalent user scope

#### Scenario: Unique ISBN constraint

- **WHEN** two upsert attempts target the same non-null `isbn_13`
- **THEN** the system reuses the existing `catalog_editions` row

#### Scenario: Unique provider identity constraint

- **WHEN** two upsert attempts target the same `(data_source, external_provider_id)` pair
- **THEN** the system reuses the existing `catalog_editions` row

### Requirement: Catalog edition upsert on API import

The system SHALL upsert `catalog_editions` when metadata is obtained from Open Library, Google Books, or Goodreads import and no matching edition exists locally.

#### Scenario: First user imports edition via API

- **WHEN** catalog metadata is fetched from an external provider for an edition not in `catalog_editions`
- **THEN** a new `catalog_editions` row is created with provider fields mapped to catalog columns

#### Scenario: Second user benefits from cached edition

- **WHEN** another user later adds or searches for the same edition (same ISBN or provider identity)
- **THEN** the system reads metadata from `catalog_editions` without calling the external API for that edition

### Requirement: User library links to catalog edition

The system SHALL store `books.catalog_edition_id` as a foreign key to `catalog_editions.id` for catalog-sourced and migrated library entries.

The system SHALL enforce at most one library row per user per catalog edition via unique constraint on `(user_id, catalog_edition_id)` where `catalog_edition_id` is not null.

#### Scenario: User adds shared edition

- **WHEN** a user adds a book linked to catalog edition `E`
- **THEN** a `books` row is created with `user_id` and `catalog_edition_id = E`
- **THEN** bibliographic fields in API responses are resolved from catalog plus any user overrides
