## ADDED Requirements

### Requirement: Add book entry point on Book Tracker

The Book Tracker page SHALL provide a control labeled «Añadir libro» that starts the add-book flow.

#### Scenario: Open search modal (KAN-9 Escenario 1)

- **WHEN** the user is on the Book Tracker page and clicks «Añadir libro»
- **THEN** a modal opens containing a search field for title or author name

### Requirement: Debounced catalog search in modal

The modal SHALL query the backend catalog search endpoint as the user types, with debounce to avoid excessive requests.

#### Scenario: Search after typing

- **WHEN** the user enters at least 2 characters in the search field
- **THEN** the client requests catalog search results from the API after a debounce interval
- **THEN** the modal displays a list of matching editions with visible metadata (cover, title, author, genre, page count, ISBN when available)

### Requirement: Edition selection when multiple matches

The user SHALL be able to select exactly one edition from the result list before saving.

#### Scenario: Multiple editions (KAN-9 Escenario 2)

- **WHEN** the search returns more than one edition
- **THEN** the user can select the specific edition they are reading
- **THEN** only the selected edition is used for the save request

### Requirement: Save and show book in tracker

The modal SHALL submit the selected edition to `POST /books` and refresh the tracker list on success.

#### Scenario: Book appears after save (KAN-9 Escenario 3)

- **WHEN** the user confirms save after selecting an edition
- **THEN** the client calls `POST /books` with the edition payload
- **THEN** the modal closes (or returns to tracker)
- **THEN** the new book appears in the Book Tracker table with cover, author, page count, and genre displayed when the API returned them

### Requirement: Loading and error states

The modal SHALL show loading feedback during search and save, and non-blocking error messages on network or API failures without losing the user's query.

#### Scenario: Search network error

- **WHEN** the catalog search request fails
- **THEN** the modal shows an error message and allows the user to retry search

#### Scenario: Save failure

- **WHEN** `POST /books` returns 409 or 400
- **THEN** the modal remains open and displays an actionable message (e.g. duplicate book)
