# goals-page-ui Specification

## Purpose

Dedicated Goals route UI for annual reading goal tracking with design-system layout (KAN-25).

## Requirements

### Requirement: Dedicated Goals route UI

The application SHALL provide a dedicated Goals page UI at `/goals` instead of a generic placeholder.

#### Scenario: Goals page shell (KAN-25)

- **WHEN** an authenticated user navigates to `/goals`
- **THEN** the page renders a design-system header and annual-goal section
- **AND** the main content uses tokenized spacing without horizontal overflow

### Requirement: Annual goal presentation on Goals page

The Goals page SHALL show annual goal progress and forecast with coherent card alignment.

#### Scenario: Goal card with progress and forecast

- **WHEN** goal data is available
- **THEN** the user sees target progress, progress bar, and forecast message in the Goals layout
- **AND** create/edit interactions remain available
