## ADDED Requirements

### Requirement: Inline read format column

The Book Tracker SHALL display an editable read format control per row.

#### Scenario: Select format inline (UC-04, KAN-30)

- **WHEN** the user chooses Físico, Ebook, or Audio from the row format selector
- **THEN** the client PATCHes `read_format` and the row updates

#### Scenario: Empty until chosen

- **WHEN** a book is created or status changes without explicit format selection
- **THEN** `read_format` remains null and the selector shows empty

#### Scenario: Accessible format control

- **WHEN** the format selector receives keyboard focus
- **THEN** it has an associated label and is operable without a mouse

## MODIFIED Requirements

### Requirement: Completion modal on mark as read

The UI SHALL open a completion modal when a PATCH response includes `meta.openCompletionModal: true`, offering finish date (default today), read format (Físico / Ebook / Audio), and 1–5 star rating.

#### Scenario: Modal on transition to read (KAN-12 scenario 3)

- **WHEN** the user changes status to Leído from Leyendo and the API returns `openCompletionModal`
- **THEN** a modal opens with finish date, format selector, and star rating

#### Scenario: Dismiss modal without optional fields (KAN-12 scenario 4)

- **WHEN** the user closes the modal without saving optional fields
- **THEN** the book remains Leído and optional fields can be completed later inline

#### Scenario: Save modal fields

- **WHEN** the user confirms the modal with format and rating
- **THEN** the client PATCHes `finished_on`, `read_format`, and `rating` and refreshes the row

#### Scenario: Format optional in modal (KAN-30)

- **WHEN** the user saves the completion modal without selecting a format
- **THEN** `read_format` stays null until set inline later
