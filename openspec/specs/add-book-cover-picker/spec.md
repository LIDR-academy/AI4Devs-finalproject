## Requirements

### Requirement: Cover selection step after edition selection

After the user selects a catalog edition in the add-book modal, the UI SHALL load available covers and present a dedicated cover selection step before saving.

#### Scenario: Multiple covers available

- **WHEN** the user selects an edition and the covers endpoint returns more than one cover
- **THEN** the modal shows a grid (or equivalent) of cover thumbnails
- **THEN** the user can select exactly one cover
- **THEN** the primary action remains disabled until a cover is selected or the user explicitly confirms without cover when none exist

#### Scenario: Single cover available

- **WHEN** only one cover is returned
- **THEN** that cover is preselected
- **THEN** the user can proceed to save without an extra mandatory click on the cover

#### Scenario: No covers available

- **WHEN** the covers endpoint returns an empty list
- **THEN** the UI shows a placeholder consistent with the app visual style
- **THEN** the user can still save the book

### Requirement: Selected cover is persisted

The cover URL sent in `POST /v1/books` SHALL be the URL of the cover selected in the picker step, not merely the first cover from the search result list.

#### Scenario: Save with chosen cover

- **WHEN** the user selects edition A and cover B, then confirms save
- **THEN** the create request body includes `cover_image_url` equal to cover B's URL
- **THEN** the book appears in Book Tracker with that cover image

### Requirement: Loading and error feedback for covers

The cover picker step SHALL show loading state while covers are fetched and an actionable error message on failure, with retry without losing the selected edition.

#### Scenario: Covers fetch fails

- **WHEN** the covers request fails
- **THEN** the modal displays an error and offers retry
- **THEN** the selected edition remains selected
