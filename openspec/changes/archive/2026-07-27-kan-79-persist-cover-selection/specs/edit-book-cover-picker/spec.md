# edit-book-cover-picker

## MODIFIED Requirements

### Requirement: Cover selection updates form only

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
