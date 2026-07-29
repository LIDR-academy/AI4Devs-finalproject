# shared-ui-components Specification

## Purpose

Reusable base React components under `frontend/src/components/ui/` consuming design tokens (KAN-18).

## Requirements

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

StarRating SHALL support arrow-key navigation in 0.5 steps when focused and SHALL expose the current rating as accessible text for screen readers.

#### Scenario: Arrow key increases rating by half step

- **WHEN** the control is focused with value `3` and the user presses ArrowRight
- **THEN** the rating updates to `3.5`

#### Scenario: Half-star display

- **WHEN** `value` is `3.5`
- **THEN** three stars render full, the fourth renders half-filled, and the fifth is empty

#### Scenario: Half-star selection

- **WHEN** the user activates the left half of the fourth star
- **THEN** `onChange` is called with `3.5`

### Requirement: WCAG contrast for base components

Base components SHALL use token pairs documented in `docs/design-system-palette.md` that meet WCAG 2.1 AA contrast for normal text and focus indicators.

#### Scenario: Primary button contrast documented

- **WHEN** reviewing the palette documentation
- **THEN** primary button foreground/background pair is listed with AA compliance noted
