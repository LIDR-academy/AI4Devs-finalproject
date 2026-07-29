## ADDED Requirements

### Requirement: Reusable book form

The application SHALL provide a single book form component for create and edit modes with all book and reading fields editable.

#### Scenario: Edit save updates tracker

- **WHEN** the user edits fields in the modal and saves
- **THEN** the client PATCHes book and reading-record APIs
- **AND** the Book Tracker list reflects changes after close

#### Scenario: Create manual book

- **WHEN** the form opens in create mode and the user saves valid data
- **THEN** the client POSTs a manual book and optional reading fields
- **AND** the new book appears in the library list

#### Scenario: Client validation

- **WHEN** title is empty or finish date precedes start date
- **THEN** the form shows errors and does not call the API

## MODIFIED Requirements

### Requirement: Book form modal shell

The application SHALL provide a `BookFormModal` dialog reusable for create and edit flows.

#### Scenario: Edit mode shell

- **WHEN** the modal opens in edit mode
- **THEN** the dialog uses focus trap and closes on Escape or Cancel
- **AND** Save submits the form when validation passes
