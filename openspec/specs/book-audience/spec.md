# book-audience Specification

## Purpose

Optional audience classification on books (`young_adult`, `new_adult`, `adult`) for Book Tracker and stats (KAN-35).

## Requirements

### Requirement: Book audience field

The system SHALL store an optional audience classification on each book with allowed values `young_adult`, `new_adult`, or `adult`.

#### Scenario: Nullable audience on create

- **WHEN** a book is created without an audience value
- **THEN** the stored audience is null
- **AND** the book is valid

#### Scenario: Audience persisted

- **WHEN** a book is created with `audience: "young_adult"`
- **THEN** GET list and book responses include `audience: "young_adult"`

### Requirement: Audience API

The API SHALL accept optional `audience` on POST `/v1/books` and PATCH `/v1/books/{bookId}` for the authenticated owner.

#### Scenario: Patch audience on existing book

- **WHEN** the owner PATCHes `{ "audience": "new_adult" }`
- **THEN** the book audience updates to `new_adult`

#### Scenario: Clear audience

- **WHEN** the owner PATCHes `{ "audience": null }`
- **THEN** the book audience is cleared

### Requirement: Book Tracker audience column

The Book Tracker SHALL display an Audience column and allow the user to view and change the value via an accessible control.

#### Scenario: Column visible

- **WHEN** the user opens Book Tracker
- **THEN** each row shows the book audience or an empty placeholder

#### Scenario: Accessible selector

- **WHEN** the user focuses the audience control
- **THEN** it has an associated label and visible focus indicator
