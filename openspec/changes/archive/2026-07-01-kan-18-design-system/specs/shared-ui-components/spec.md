## ADDED Requirements

### Requirement: Shared UI component library

The frontend SHALL provide reusable base components under `frontend/src/components/ui/` that consume design tokens exclusively (no hard-coded hex in component CSS).

#### Scenario: Barrel export

- **WHEN** a feature imports from `components/ui`
- **THEN** Button, Card, Table, Input, Select, Modal, Badge, StarRating, ChartCard, PageHeader, and SidebarItem are available

### Requirement: Button component

The Button component SHALL support primary, secondary, and ghost variants and be keyboard activatable.

#### Scenario: Primary button

- **WHEN** rendered with `variant="primary"`
- **THEN** it uses the primary brand color token for background
- **AND** it shows a visible focus ring on keyboard focus

### Requirement: Modal accessibility

The Modal component SHALL trap focus while open, close on Escape, and expose `role="dialog"` with `aria-modal="true"`.

#### Scenario: Escape closes modal

- **WHEN** the modal is open and the user presses Escape
- **THEN** the modal invokes its close handler

### Requirement: Table scroll container

The Table component SHALL render inside a horizontally scrollable wrapper when content overflows.

#### Scenario: Wide table scrolls

- **WHEN** table columns exceed the container width
- **THEN** the user can scroll horizontally within the TableScroll wrapper

### Requirement: StarRating keyboard navigation

StarRating SHALL support arrow-key navigation between stars when focused.

#### Scenario: Arrow key increases rating

- **WHEN** a star button is focused and the user presses ArrowRight
- **THEN** focus moves to the next star and the rating updates accordingly

### Requirement: WCAG contrast for base components

Base components SHALL use token pairs documented in `docs/design-system-palette.md` that meet WCAG 2.1 AA contrast for normal text and focus indicators.

#### Scenario: Primary button contrast documented

- **WHEN** reviewing the palette documentation
- **THEN** primary button foreground/background pair is listed with AA compliance noted
