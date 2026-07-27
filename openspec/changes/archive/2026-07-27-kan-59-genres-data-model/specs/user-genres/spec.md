# user-genres

User-configurable genre labels for books (KAN-59 data model).

## ADDED Requirements

### Requirement: Genres table

The system SHALL store genres in a `genres` table with `id`, `user_id`, `name`, `is_default`, `created_at`, and `updated_at`. Names SHALL be unique per user case-insensitively via `UNIQUE (user_id, lower(name))`.

#### Scenario: Per-user genre row

- **WHEN** a genre is created for a user
- **THEN** it is scoped to that `user_id`

### Requirement: Book genre foreign key

Books SHALL reference genre via `genre_id` (UUID, nullable, FK → `genres.id`, ON DELETE SET NULL). The legacy `books.genre` text column SHALL be removed after migration.

#### Scenario: Legacy genre migration

- **WHEN** the migration runs on existing books with free-text `genre`
- **THEN** each distinct genre value per user becomes a `genres` row
- **AND** each book is linked via `genre_id` without duplicate genre rows per user

### Requirement: Default genre seed

On new user registration, the system SHALL seed exactly these default genres with `is_default = true`: Fantasía, Thriller, Ciencia ficción, Romance, Histórica, Ficción, No ficción.

#### Scenario: New user defaults

- **WHEN** a new user account is created
- **THEN** the user has 7 default genre rows
- **AND** seed runs only once per user
