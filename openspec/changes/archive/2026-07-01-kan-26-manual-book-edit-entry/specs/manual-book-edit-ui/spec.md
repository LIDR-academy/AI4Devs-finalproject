## ADDED Requirements

### Requirement: Book Tracker edit entry point

The Book Tracker table SHALL provide an edit control on each row that opens the shared book form modal.

#### Scenario: Pencil opens edit modal (US-07 Escenario 1 entry)

- **WHEN** the user activates the edit control on a book row
- **THEN** `BookFormModal` opens in edit mode for that book
- **AND** the modal header identifies the book being edited

#### Scenario: Accessible edit control

- **WHEN** the edit control receives focus
- **THEN** it has an accessible name including the book title
- **AND** it is keyboard activatable

### Requirement: Book form modal shell

The application SHALL provide a `BookFormModal` dialog reusable for create and edit flows.

#### Scenario: Edit mode shell

- **WHEN** the modal opens in edit mode
- **THEN** the dialog uses focus trap and closes on Escape or Cancel
- **AND** Save is present but disabled until the full form is implemented (KAN-28)

#### Scenario: Modal closes without side effects

- **WHEN** the user closes the modal without saving
- **THEN** no API mutation occurs
- **AND** the Book Tracker list is unchanged
