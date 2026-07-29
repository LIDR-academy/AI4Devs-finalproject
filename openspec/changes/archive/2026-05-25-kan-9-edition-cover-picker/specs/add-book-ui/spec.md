## MODIFIED Requirements

### Requirement: Edition selection when multiple matches

The user SHALL select exactly one edition from the result list, then complete cover selection (see `add-book-cover-picker`) before saving.

#### Scenario: Multiple editions (KAN-9 Escenario 2)

- **WHEN** the search returns more than one edition
- **THEN** the user can select the specific edition they are reading
- **THEN** the flow continues to the cover picker for that edition
- **THEN** only after cover selection (or explicit no-cover path) can the user save

### Requirement: Save and show book in tracker

The modal SHALL submit the selected edition and **chosen cover** to `POST /v1/books` and refresh the tracker list on success.

#### Scenario: Book appears after save (KAN-9 Escenario 3)

- **WHEN** the user confirms save after selecting an edition and cover (when covers exist)
- **THEN** the client calls `POST /v1/books` with the edition payload and selected `cover_image_url`
- **THEN** the modal closes (or returns to tracker)
- **THEN** the new book appears in the Book Tracker table with the **selected** cover, author, page count, and genre displayed when the API returned them
