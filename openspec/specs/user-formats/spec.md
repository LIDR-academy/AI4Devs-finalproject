# user-formats Specification

## Purpose

User-owned configurable read format labels for reading records (KAN-70 / KAN-71). Default seed on account creation; foundation for Settings CRUD and reading-flow selectors in follow-up tickets.

## Requirements

### Requirement: Formats table

The system SHALL persist user-owned format rows in a `formats` table with columns: `id` (UUID PK), `user_id` (FK to users, NOT NULL, ON DELETE CASCADE), `name` (VARCHAR(100) NOT NULL), `is_default` (BOOLEAN NOT NULL DEFAULT false), `created_at`, `updated_at`.

The system SHALL enforce case-insensitive unique format names per user via a unique index on `(user_id, lower(name))`.

#### Scenario: Distinct names per user

- **WHEN** a user has a format named `Físico`
- **THEN** the same user cannot create another format named `físico`

### Requirement: Reading record format foreign key

The system SHALL store an optional `reading_records.format_id` UUID column referencing `formats.id` with `ON DELETE SET NULL`.

The system SHALL migrate existing `read_format` enum values to `format_id` for each user's default formats without data loss.

The system SHALL remove the `read_format` column after migration.

#### Scenario: Migrate fisico to Físico format

- **WHEN** a reading record has `read_format = 'fisico'`
- **AND** the book owner has a default format named `Físico`
- **THEN** after migration the record has `format_id` pointing to that format

#### Scenario: Format deleted clears reading link

- **WHEN** a format row referenced by a reading record is deleted
- **THEN** the reading record's `format_id` becomes NULL

### Requirement: Default format seed

The system SHALL automatically create three default formats for each new user account: `Audio`, `Ebook`, and `Físico`, each with `is_default = true`.

#### Scenario: New user registration

- **WHEN** a new user account is created
- **THEN** the user has exactly three formats: Audio, Ebook, Físico
- **AND** all three have `is_default = true`

#### Scenario: Seed runs once

- **WHEN** an existing user logs in again via dev-login
- **THEN** no additional default formats are created
