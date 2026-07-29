## MODIFIED Requirements

### Requirement: Lists route and month navigation

The application SHALL provide a Lists page at `/lists` that loads the monthly TBR for a selected calendar month, defaulting to the current month.

#### Scenario: Tokenized lists page shell (KAN-24)

- **WHEN** the user opens `/lists`
- **THEN** page header, month controls, and actions use design-system token styling
- **AND** the main content does not introduce horizontal page overflow

### Requirement: Empty list encourages adding books

The Lists UI SHALL show an empty-state message and a primary action to add books when the monthly TBR has zero entries.

#### Scenario: Empty state card styling (KAN-24)

- **WHEN** the monthly list is empty
- **THEN** the empty-state block renders as a soft card aligned with page spacing and typography standards

### Requirement: Checklist displays completion state

The Lists UI SHALL render each TBR entry with visual distinction when `completed` is true (e.g. check icon and strikethrough).

#### Scenario: Checklist card alignment (KAN-24)

- **WHEN** checklist rows are rendered
- **THEN** entries use consistent card-like spacing, borders, and typography
- **AND** completed rows remain visually distinct
