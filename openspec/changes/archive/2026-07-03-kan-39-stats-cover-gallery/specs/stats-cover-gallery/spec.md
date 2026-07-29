## ADDED Requirements

### Requirement: Period book summaries on stats API

The system SHALL include `books_in_period` on `GET /v1/stats/{year}/{month}` and `GET /v1/stats?period=year&year=YYYY` responses. Each entry SHALL contain `id`, `title`, `authors`, `cover_image_url`, and `finished_on` for books that qualify for the period (`status = leido`, `finished_on` within period bounds), ordered by `finished_on` ascending then `title` ascending.

#### Scenario: Gallery data matches books read count

- **WHEN** the user has 4 qualifying books in June 2025
- **THEN** `books_in_period` has length 4 and `books_read` is 4

#### Scenario: Empty period returns empty array

- **WHEN** no books qualify for the period
- **THEN** `books_in_period` is `[]`

#### Scenario: User isolation

- **WHEN** another user has qualifying books in the same period
- **THEN** those books are not included in `books_in_period`

### Requirement: Cover gallery on Reading Stats

The Reading Stats page SHALL render a cover gallery section below the chart grid when `books_in_period` is non-empty. Changing the period filter SHALL refetch stats and update the gallery without a full page reload.

#### Scenario: Gallery visible for non-empty period

- **WHEN** the stats response includes 3 entries in `books_in_period`
- **THEN** the page shows 3 cover tiles at the bottom of the dashboard

#### Scenario: Period change updates gallery

- **WHEN** the user switches from year 2025 to year 2024
- **THEN** the gallery shows books finished in 2024 only

#### Scenario: Accessible cover labels

- **WHEN** a book has a cover image URL
- **THEN** the image `alt` text includes the book title and authors

#### Scenario: Missing cover placeholder

- **WHEN** a book has `cover_image_url: null`
- **THEN** the tile shows a placeholder and title/author remain visible on hover

#### Scenario: Responsive layout

- **WHEN** the viewport is narrow
- **THEN** the gallery wraps without horizontal page overflow
