# monthly-stats-ui Specification

## Purpose
TBD - created by archiving change kan-15-monthly-stats-dashboard. Update Purpose after archive.
## Requirements
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

### Requirement: KPI cards

The dashboard SHALL display KPI cards for books read, pages read, and average rating from the response, formatting `average_rating` as a human-readable value and showing a non-numeric placeholder (for example `—`) when it is `null`.

#### Scenario: KPI values rendered (US-05 scenario 1)

- **WHEN** the stats response has `books_read: 4`, `pages_read: 1320`, and `average_rating: 4.25`
- **THEN** the dashboard shows 4 books, 1320 pages, and an average rating of 4.25

#### Scenario: Null average rating placeholder

- **WHEN** the stats response has `average_rating: null`
- **THEN** the average rating card shows a placeholder instead of a number

### Requirement: Genre distribution chart

The dashboard SHALL render a genre-distribution **pie chart** from `genre_distribution`, with a text legend and accessible labels.

#### Scenario: Genre chart rendered (US-05 scenario 2)

- **WHEN** `genre_distribution` contains multiple genres
- **THEN** the dashboard renders one pie slice per genre with its count in the legend

#### Scenario: Consistent chart card container (KAN-23)

- **WHEN** genre data is available
- **THEN** the chart renders inside a consistent chart-card layout aligned with other dashboard blocks

### Requirement: Format breakdown

The dashboard SHALL render the format breakdown as a **pie chart** from `format_distribution` and highlight `predominant_format` in the legend when present.

#### Scenario: Predominant format highlighted

- **WHEN** the response has `predominant_format: "Físico"`
- **THEN** the format pie legend indicates `Físico` as the predominant format

#### Scenario: Format chart card alignment (KAN-23)

- **WHEN** format data is available
- **THEN** the breakdown renders in a chart-card container with consistent spacing and typography

### Requirement: Month selection recalculates indicators

The dashboard SHALL provide a month selector; changing the month SHALL refetch stats for the selected period and update all KPIs and charts without a full page reload.

#### Scenario: Change month updates dashboard (US-05 scenario 3)

- **WHEN** the user selects a different month in the selector
- **THEN** the client fetches stats for that month and updates all KPIs and charts

### Requirement: Loading, empty, and error states

The dashboard SHALL show a loading state while fetching, an empty state when the month has no qualifying books, and an error state on request failure.

#### Scenario: Empty month

- **WHEN** the selected month returns `books_read: 0` and empty distributions
- **THEN** the dashboard shows an empty-state message rather than blank charts or an error

#### Scenario: Request failure

- **WHEN** the stats request fails
- **THEN** the dashboard shows an error state without crashing the page

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

### Requirement: Structured chart grid layout

The Reading Stats dashboard SHALL render a chart section with **four pie-chart slots** and **two bar-chart slots** when period data is non-empty. All four pie slots SHALL render pie charts when distribution data exists. Both bar slots SHALL render bar charts from the stats time-series breakdown fields.

#### Scenario: Full chart grid visible

- **WHEN** the user views Reading Stats for a period with qualifying books
- **THEN** the chart section shows four pie slots in the first row and two bar slots in the second row

#### Scenario: Genre and format in pie slots

- **WHEN** genre and format distributions have data
- **THEN** they render in the first and second pie slots respectively

#### Scenario: Responsive stacking

- **WHEN** the viewport is narrow
- **THEN** pie and bar slots stack without horizontal page overflow

#### Scenario: Bar charts replace placeholders

- **WHEN** time-series breakdown data is available
- **THEN** the books and pages bar slots render bar charts with labeled axes instead of placeholder cards

#### Scenario: Placeholder slot accessibility

- **WHEN** a pie slot has no chart implementation yet
- **THEN** the slot still exposes a titled card with an accessible name describing the upcoming chart type

### Requirement: Period cover gallery section

The Reading Stats dashboard SHALL render a cover gallery below the chart section when `books_in_period` is non-empty, showing one tile per qualifying book for the active period. The section heading SHALL reference the selected period scope. The gallery SHALL update when the period filter changes (same refetch as KPIs and charts).

#### Scenario: Gallery after charts

- **WHEN** the user views Reading Stats for a period with qualifying books
- **THEN** the cover gallery appears below the chart grid

#### Scenario: No gallery on empty period

- **WHEN** `books_read` is 0
- **THEN** the empty-state message is shown and the cover gallery is not rendered

#### Scenario: Hover and alt text for book identity

- **WHEN** the user hovers a cover tile or a screen reader encounters the image
- **THEN** title and authors are available via `alt` and/or visible overlay text

#### Scenario: Responsive gallery grid

- **WHEN** the viewport is narrow
- **THEN** cover tiles reflow in a grid without horizontal page overflow

### Requirement: Insights section placement

The Reading Stats dashboard SHALL show automatic insights between the KPI cards and the chart section when `insights` is non-empty.

#### Scenario: Insights between KPIs and charts

- **WHEN** the user views Reading Stats for a period with qualifying books
- **THEN** the insights section appears below KPI cards and above the chart grid

#### Scenario: Period change updates insights

- **WHEN** the user changes the period filter
- **THEN** insights update to match the new period

