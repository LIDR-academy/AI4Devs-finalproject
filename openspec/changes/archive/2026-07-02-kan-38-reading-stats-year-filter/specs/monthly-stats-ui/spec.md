## MODIFIED Requirements

### Requirement: Reading Stats dashboard route

The frontend SHALL provide an authenticated `/stats` route ("Reading Stats") that loads statistics for a selected period. Year mode SHALL call `GET /v1/stats?period=year&year=YYYY`; month mode SHALL call `GET /v1/stats/{year}/{month}`. The default period SHALL be the current UTC calendar year in year mode. The route SHALL be reachable from Home navigation (UC-07).

#### Scenario: Open dashboard for current year (KAN-38)

- **WHEN** an authenticated user navigates to `/stats` without a saved period
- **THEN** the dashboard requests year stats for the current UTC year and renders KPIs and charts

#### Scenario: Unauthenticated access redirects to login

- **WHEN** an unauthenticated user navigates to `/stats`
- **THEN** the client redirects to `/login`

#### Scenario: Navigation from Home

- **WHEN** the user is on Home
- **THEN** a `Reading Stats` link navigates to `/stats`

#### Scenario: Tokenized page shell and period control (KAN-23)

- **WHEN** an authenticated user opens `/stats`
- **THEN** the page header, spacing, and period control use design-system token styling
- **AND** the main content does not introduce horizontal page overflow

## ADDED Requirements

### Requirement: Year and month period filter

The dashboard SHALL provide a period filter with **year** and **month** modes. Year mode SHALL show a year selector; month mode SHALL show a month selector. Changing the period SHALL refetch stats and update all KPIs and charts without a full page reload.

#### Scenario: Select full year updates dashboard (US-08)

- **WHEN** the user selects year mode and chooses 2025
- **THEN** the client fetches year stats for 2025 and updates all KPIs and charts

#### Scenario: Month mode still works

- **WHEN** the user switches to month mode and selects June 2025
- **THEN** the client fetches monthly stats for 2025-06 and updates all KPIs and charts

### Requirement: Period filter persistence

The dashboard SHALL persist the selected period mode and value in `localStorage` and restore it on subsequent visits to `/stats`.

#### Scenario: Return visit restores filter

- **WHEN** the user selects month mode for March 2024, navigates away, and returns to `/stats`
- **THEN** the dashboard loads March 2024 monthly stats

### Requirement: Accessible period controls

Period mode and value controls SHALL have associated labels, be operable by keyboard, and show visible focus styles.

#### Scenario: Keyboard operation

- **WHEN** the user tabs to the period controls
- **THEN** each control is focusable and activatable without a pointer device

### Requirement: Year-mode loading and empty states

In year mode, loading, empty (`books_read: 0`), and error states SHALL behave like month mode with copy referencing the selected year.

#### Scenario: Empty year

- **WHEN** the selected year returns `books_read: 0`
- **THEN** the dashboard shows an empty-state message for that year rather than blank charts or an error
