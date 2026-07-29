## MODIFIED Requirements

### Requirement: Loading and error states

The modal SHALL show loading feedback during search and save, and non-blocking error messages on network or API failures without losing the user's query.

#### Scenario: Search network error

- **WHEN** the catalog search request fails
- **THEN** the modal shows an error message and allows the user to retry search

#### Scenario: Save failure

- **WHEN** `POST /books` returns 409 or 400
- **THEN** the modal remains open and displays an actionable message (e.g. duplicate book)

#### Scenario: Manual create when no results (UC-01 alt 3b, KAN-29)

- **WHEN** the user searched with at least 2 characters and the catalog returns no editions
- **THEN** the modal offers «Crear manualmente»
- **WHEN** the user activates it
- **THEN** the empty book form opens for manual entry
- **AND** saving adds the book to the tracker with `data_source: manual`
