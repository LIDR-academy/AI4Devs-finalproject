# edit-book-cover-picker Specification

Edit book modal cover search and selection (KAN-78).

## Requirements

### Requirement: Cover search button in edit modal

The edit book modal SHALL display a **Buscar portada** button adjacent to the cover URL field when editing an existing book (`book` prop is set). The button SHALL NOT appear in create mode.

#### Scenario: Edit mode shows search button

- **WHEN** the user opens the edit book modal for a saved book
- **THEN** a **Buscar portada** button is visible next to the cover URL input

#### Scenario: Create mode hides search button

- **WHEN** the user opens the add/create book modal
- **THEN** no **Buscar portada** button is shown

### Requirement: Cover search panel

When the user activates cover search, the UI SHALL call `GET /v1/books/{bookId}/cover-search` with an optional `q` query parameter, show a loading state, and render returned covers in a grid reusing the add-book `CoverPicker` visual.

#### Scenario: Initial search on activate

- **WHEN** the user clicks **Buscar portada**
- **THEN** the system searches using a default query of book title and authors
- **AND** displays a loading indicator until results arrive

#### Scenario: Refine search

- **WHEN** the user edits the search field and triggers search again
- **THEN** the system calls cover-search with the updated `q` value

#### Scenario: Empty results

- **WHEN** cover-search returns no covers
- **THEN** the message **No se han encontrado portadas para esta búsqueda** is shown
- **AND** the manual cover URL field remains editable

### Requirement: Cover selection and persistence

Selecting a cover from the grid or editing the URL field SHALL update `cover_image_url` in the modal form state. The value SHALL persist to the book when the user clicks **Guardar** via `PATCH /v1/books/{bookId}`.

#### Scenario: Select cover fills URL field

- **WHEN** the user selects a cover from the grid
- **THEN** the cover URL input reflects the selected cover URL
- **AND** no API persist occurs until **Guardar**

#### Scenario: Grid selection persists on save

- **WHEN** the user selects a cover from the grid and clicks **Guardar** without further edits
- **THEN** the client PATCHes `cover_image_url` with the selected URL
- **AND** reloading the book shows the saved cover

#### Scenario: Manual URL overrides grid selection

- **WHEN** the user selects a cover from the grid and then pastes a different URL manually
- **AND** clicks **Guardar**
- **THEN** the manually entered URL is persisted (last user action wins)

#### Scenario: URL validation regardless of source

- **WHEN** the cover URL field contains an invalid URL (from grid or manual entry)
- **THEN** the form shows a validation error and does not call the API
