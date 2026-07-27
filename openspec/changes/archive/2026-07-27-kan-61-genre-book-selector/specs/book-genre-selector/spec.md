# book-genre-selector

Closed genre selector in add/edit book modals (KAN-61).

## ADDED Requirements

### Requirement: Genre select in book forms

Add and edit book UIs SHALL present a closed select of the user's genres from `GET /v1/genres`. Free-text genre input SHALL NOT be available.

#### Scenario: Options from user list

- **WHEN** the user opens the genre dropdown while editing a book
- **THEN** only their personal genre labels are listed

#### Scenario: Empty genres list

- **WHEN** the user has no genres
- **THEN** the UI shows a notice linking to Settings
- **AND** the book can still be saved without a genre

### Requirement: Persist genre_id

Create and patch book requests SHALL accept `genre_id` (UUID or null). The id MUST belong to the authenticated user.

#### Scenario: Save selected genre

- **WHEN** the user selects a genre and saves
- **THEN** the book stores that `genre_id` and responses include `genre_id` plus display `genre` name

#### Scenario: Reject foreign genre_id

- **WHEN** the client sends a `genre_id` not owned by the user
- **THEN** the API returns 400
