# audiences-settings-api Specification

## Purpose

Authenticated REST API for user-owned audience labels in Settings (KAN-66).

## Requirements

### Requirement: List user audiences

The system SHALL expose `GET /v1/audiences` for the authenticated user returning all owned audiences ordered by name ascending.

#### Scenario: List after registration

- **WHEN** the user calls `GET /v1/audiences`
- **THEN** the response is HTTP 200 with an array including seeded defaults Adulto, Juvenil, Infantil

### Requirement: Create audience

The system SHALL expose `POST /v1/audiences` with body `{ name }` for the authenticated user.

The system SHALL validate `name` length between 1 and 100 characters after trim.

The system SHALL reject case-insensitive duplicate names for the same user with HTTP 409.

#### Scenario: Create new audience

- **WHEN** the user POSTs `{ "name": "Young Adult" }`
- **THEN** the response is HTTP 201 with the created audience including `name: "Young Adult"`

#### Scenario: Reject duplicate

- **WHEN** the user already has `Adulto` and POSTs `{ "name": "adulto" }`
- **THEN** the response is HTTP 409

### Requirement: Delete audience

The system SHALL expose `DELETE /v1/audiences/{id}` for the authenticated owner and respond HTTP 204 on success.

The system SHALL expose `GET /v1/audiences/{id}/affected-books` returning `{ affected_book_count }` for the same owned audience before the client shows a delete confirmation.

#### Scenario: Delete owned audience

- **WHEN** the user DELETEs an audience they own
- **THEN** the response is HTTP 204
- **AND** subsequent GET no longer includes that audience
- **AND** books that referenced the audience have `audience_id` set to null

#### Scenario: Delete other user's audience

- **WHEN** the user DELETEs an audience id not owned by them
- **THEN** the response is HTTP 404

### Requirement: Settings Público objetivo section

The Profile / Settings page SHALL include a **Público objetivo** section listing the user's audiences and allowing add and delete.

#### Scenario: Add from Settings

- **WHEN** the user adds "Young Adult" in Settings > Público objetivo
- **THEN** the new label appears in the list

#### Scenario: Duplicate error in UI

- **WHEN** the user adds a duplicate audience name
- **THEN** the UI shows an error and does not add a duplicate row
