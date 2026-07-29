## ADDED Requirements

### Requirement: Home dashboard shell

The Home page SHALL use design-system primitives and token-based styling for page-level layout.

#### Scenario: Home header with design-system typography (KAN-21)

- **WHEN** an authenticated user opens Home
- **THEN** the page title is rendered through the shared page header pattern
- **AND** spacing/colors come from semantic tokens

### Requirement: Responsive Home section layout

The Home page SHALL present the dashboard sections in a responsive grid without horizontal overflow.

#### Scenario: Grid adapts to viewport

- **WHEN** viewport width changes across desktop/tablet sizes
- **THEN** section cards reflow using responsive columns
- **AND** the main content area does not create horizontal page scrolling

### Requirement: Required Home sections are visible

The Home page SHALL show sections for in-progress books, monthly KPIs, annual goal, and current TBR.

#### Scenario: Section structure on Home

- **WHEN** Home renders
- **THEN** the user sees cards for "Libros en curso", "KPIs del mes", "Meta anual", and "TBR actual"
- **AND** sections without implemented data clearly indicate pending functionality
