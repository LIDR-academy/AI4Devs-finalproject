## ADDED Requirements

### Requirement: Reading Stats dashboard route

The frontend SHALL provide an authenticated `/stats` route ("Reading Stats") that loads monthly statistics for a selected month via `GET /v1/stats/{year}/{month}`, defaulting to the current UTC month, and SHALL be reachable from the Home navigation (UC-07, KAN-15).

#### Scenario: Open dashboard for current month

- **WHEN** an authenticated user navigates to `/stats`
- **THEN** the dashboard requests stats for the current UTC year and month and renders the KPIs and charts

#### Scenario: Unauthenticated access redirects to login

- **WHEN** an unauthenticated user navigates to `/stats`
- **THEN** the client redirects to `/login`

#### Scenario: Navigation from Home

- **WHEN** the user is on Home
- **THEN** a `Reading Stats` link navigates to `/stats`

### Requirement: KPI cards

The dashboard SHALL display KPI cards for books read, pages read, and average rating from the response, formatting `average_rating` as a human-readable value and showing a non-numeric placeholder (for example `—`) when it is `null`.

#### Scenario: KPI values rendered (US-05 scenario 1)

- **WHEN** the stats response has `books_read: 4`, `pages_read: 1320`, and `average_rating: 4.25`
- **THEN** the dashboard shows 4 books, 1320 pages, and an average rating of 4.25

#### Scenario: Null average rating placeholder

- **WHEN** the stats response has `average_rating: null`
- **THEN** the average rating card shows a placeholder instead of a number

### Requirement: Genre distribution chart

The dashboard SHALL render a genre-distribution chart from `genre_distribution`, with a text/legend fallback and accessible labels.

#### Scenario: Genre chart rendered (US-05 scenario 2)

- **WHEN** `genre_distribution` contains multiple genres
- **THEN** the dashboard renders one chart segment/bar per genre with its count

### Requirement: Format breakdown

The dashboard SHALL render the format breakdown from `format_distribution` and highlight `predominant_format` when present.

#### Scenario: Predominant format highlighted

- **WHEN** the response has `predominant_format: "fisico"`
- **THEN** the format breakdown indicates `fisico` as the predominant format

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
