# book-audience-selector Specification

## Purpose

Wire book create/edit flows to user-owned audience labels via `audience_id` and a closed selector in modals (KAN-67).

## Requirements

### Requirement: Book audience_id on create and patch

The system SHALL accept optional `audience_id` (UUID or null) on `POST /v1/books` and `PATCH /v1/books/{bookId}`.

The system SHALL reject `audience_id` values not owned by the authenticated user.

The system SHALL include `audience_id` in book responses.

#### Scenario: Assign audience on create

- **WHEN** the user POSTs a book with a valid owned `audience_id`
- **THEN** the created book response includes that `audience_id`

#### Scenario: Reject foreign audience_id

- **WHEN** the user POSTs a book with another user's `audience_id`
- **THEN** the response is HTTP 400

#### Scenario: Clear audience on patch

- **WHEN** the user PATCHes `{ "audience_id": null }`
- **THEN** the book `audience_id` is cleared

### Requirement: Closed audience selector in book modals

The add and edit book modals SHALL show a closed selector populated from `GET /v1/audiences` with no free-text input.

#### Scenario: Catalog add starts empty

- **WHEN** the user selects a catalog edition to add
- **THEN** the público objetivo selector is empty

#### Scenario: Persist selection on edit

- **WHEN** the user selects a público objetivo and saves the edit modal
- **THEN** the book `audience_id` is persisted

#### Scenario: Empty audience list notice

- **WHEN** the user has no audiences configured
- **THEN** the modal shows a notice with a link to Settings
- **AND** the user can still save the book without selecting one
