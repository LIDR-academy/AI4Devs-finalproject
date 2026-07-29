# book-tracker-page-ui Specification

## Purpose

Book Tracker page restyle with design-system shell and responsive table behavior that prevents page-level overflow (KAN-22).

## Requirements

### Requirement: Token-based Book Tracker page shell

The Book Tracker page SHALL use shared layout components (`PageHeader`, `Button`) and design tokens for spacing, typography, and colors.

#### Scenario: Page header uses design system (KAN-22)

- **WHEN** the user opens Book Tracker
- **THEN** the page title and «Añadir libro» action use `PageHeader` and primary `Button` from `components/ui/`
- **AND** page CSS does not use hard-coded hex palette values

### Requirement: Horizontally scrollable books table

The books table SHALL render inside a horizontally scrollable container when column content exceeds the viewport width.

#### Scenario: Table scroll on overflow (KAN-22)

- **WHEN** the table is wider than the main content area
- **THEN** the user can scroll horizontally within the table container
- **AND** the app sidebar and page header remain fixed without horizontal body scroll

#### Scenario: Accessible scroll region

- **WHEN** the table container overflows
- **THEN** the scroll wrapper has an accessible name (e.g. `aria-label`)
- **AND** keyboard users can reach inline controls inside the table

### Requirement: Sensible column layout

The Book Tracker table SHALL apply consistent column widths and alignment so inline controls remain usable.

#### Scenario: Column widths (KAN-22)

- **WHEN** the table renders with multiple books
- **THEN** cover, title, date, and action columns have defined min/max widths
- **AND** long titles truncate without crushing adjacent select controls
