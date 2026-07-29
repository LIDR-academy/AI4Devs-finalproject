# stats-insights Specification

## Purpose

Deterministic automatic reading insights on the stats API and Reading Stats UI (KAN-16).

## Requirements

### Requirement: Automatic reading insights on stats API

The system SHALL include `insights` on `GET /v1/stats/{year}/{month}` and `GET /v1/stats?period=year&year=YYYY` responses. Each insight SHALL have `id`, `kind`, `title`, and `body`, with optional structured `data`. Insights SHALL be generated deterministically from period aggregates (no LLM). When `books_read >= 1`, the array SHALL contain at least three insights.

#### Scenario: At least three insights with data

- **WHEN** the user has qualifying books in the requested period
- **THEN** `insights` contains at least three entries

#### Scenario: Empty period returns no insights

- **WHEN** `books_read` is 0
- **THEN** `insights` is `[]`

#### Scenario: Volume comparison insight

- **WHEN** the current period has more qualifying books than the previous comparable period
- **THEN** one insight has `kind: volume_delta` and reflects the percentage change in `body`

#### Scenario: Dominant genre insight

- **WHEN** one genre has the highest count in `genre_distribution`
- **THEN** one insight has `kind: genre_trend` highlighting that genre as the main trend

### Requirement: Insights section on Reading Stats

The Reading Stats page SHALL render an insights section below the KPI cards when `insights` is non-empty. Changing the period filter SHALL refetch stats and update insights without a full page reload.

#### Scenario: Insights visible with data

- **WHEN** the stats response includes insights
- **THEN** the page shows each insight title and body in a dedicated section

#### Scenario: No insights on empty period

- **WHEN** `books_read` is 0
- **THEN** the insights section is not shown

#### Scenario: Accessible insight cards

- **WHEN** insights are rendered
- **THEN** each card exposes its title as a heading and body text for screen readers
