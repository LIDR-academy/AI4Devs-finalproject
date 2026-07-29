## MODIFIED Requirements

### Requirement: Reading Stats dashboard route

The frontend SHALL provide an authenticated `/stats` route ("Reading Stats") that loads monthly statistics for a selected month via `GET /v1/stats/{year}/{month}`, defaulting to the current UTC month, and SHALL be reachable from the Home navigation (UC-07, KAN-15).

#### Scenario: Tokenized page shell and period control (KAN-23)

- **WHEN** an authenticated user opens `/stats`
- **THEN** the page header, spacing, and month control use design-system token styling
- **AND** the main content does not introduce horizontal page overflow

### Requirement: Genre distribution chart

The dashboard SHALL render a genre-distribution chart from `genre_distribution`, with a text/legend fallback and accessible labels.

#### Scenario: Consistent chart card container (KAN-23)

- **WHEN** genre data is available
- **THEN** the chart renders inside a consistent chart-card layout aligned with other dashboard blocks

### Requirement: Format breakdown

The dashboard SHALL render the format breakdown from `format_distribution` and highlight `predominant_format` when present.

#### Scenario: Format chart card alignment (KAN-23)

- **WHEN** format data is available
- **THEN** the breakdown renders in a chart-card container with consistent spacing and typography
