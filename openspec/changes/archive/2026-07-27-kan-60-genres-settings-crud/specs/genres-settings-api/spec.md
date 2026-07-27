# genres-settings-api

Genres Settings list/create/delete (KAN-60).

## ADDED Requirements

### Requirement: List genres

The system SHALL expose `GET /v1/genres` returning the authenticated user's genres ordered by name ascending.

#### Scenario: Seeded defaults visible

- **WHEN** a new user calls `GET /v1/genres`
- **THEN** the response includes the seven default genres from registration seed

### Requirement: Create genre

The system SHALL expose `POST /v1/genres` with body `{ "name" }` (trimmed, 1–100 chars). Duplicate names for the same user (case-insensitive) SHALL return 409.

#### Scenario: Create custom genre

- **WHEN** the user posts a new unique name
- **THEN** the genre is created with `is_default = false` and returned

#### Scenario: Reject duplicate name

- **WHEN** the user posts a name that already exists ignoring case
- **THEN** the API returns 409

### Requirement: Delete genre

The system SHALL expose `DELETE /v1/genres/{id}` returning 204 for an owned genre. Books referencing it SHALL have `genre_id` set to null via FK.

#### Scenario: Delete owned genre

- **WHEN** the owner deletes a genre id
- **THEN** the API returns 204 and the genre no longer appears in the list

### Requirement: Settings UI section

The Profile / Settings page SHALL show a Géneros section listing genres with add and delete controls.

#### Scenario: Add from Settings

- **WHEN** the user enters a name and clicks Añadir
- **THEN** the genre appears in the list after a successful create
