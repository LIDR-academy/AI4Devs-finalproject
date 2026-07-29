# user-audiences Specification

## Purpose

User-owned configurable audience labels for books (KAN-64 / KAN-65). Default seed on account creation; foundation for Settings CRUD and book selectors in follow-up tickets.

## Requirements

### Requirement: Audiences table

The system SHALL persist user-owned audience rows in an `audiences` table with columns: `id` (UUID PK), `user_id` (FK to users, NOT NULL, ON DELETE CASCADE), `name` (VARCHAR(100) NOT NULL), `is_default` (BOOLEAN NOT NULL DEFAULT false), `created_at`, `updated_at`.

The system SHALL enforce case-insensitive unique audience names per user via a unique index on `(user_id, lower(name))`.

#### Scenario: Distinct names per user

- **WHEN** a user has an audience named `Adulto`
- **THEN** the same user cannot create another audience named `adulto`

#### Scenario: Same name different users

- **WHEN** user A and user B each have an audience named `Adulto`
- **THEN** both rows are valid

### Requirement: Book audience foreign key

The system SHALL store an optional `books.audience_id` UUID column referencing `audiences.id` with `ON DELETE SET NULL`.

#### Scenario: Nullable on existing books

- **WHEN** the migration runs on a database with existing books
- **THEN** every book has `audience_id` NULL
- **AND** existing book data remains valid

#### Scenario: Audience deleted clears book link

- **WHEN** an audience row referenced by a book is deleted
- **THEN** the book's `audience_id` becomes NULL

### Requirement: Default audience seed

The system SHALL automatically create three default audiences for each new user account: `Adulto`, `Juvenil`, and `Infantil`, each with `is_default = true`.

#### Scenario: New user registration

- **WHEN** a new user account is created
- **THEN** the user has exactly three audiences: Adulto, Juvenil, Infantil
- **AND** all three have `is_default = true`

#### Scenario: Seed runs once

- **WHEN** an existing user logs in again via dev-login
- **THEN** no additional default audiences are created

### Requirement: Settings audience management API

The system SHALL provide authenticated REST endpoints to list, create, and delete user-owned audiences as specified in `audiences-settings-api`.

#### Scenario: Settings reflects API state

- **WHEN** the user opens Settings > Público objetivo
- **THEN** the listed audiences match `GET /v1/audiences`
