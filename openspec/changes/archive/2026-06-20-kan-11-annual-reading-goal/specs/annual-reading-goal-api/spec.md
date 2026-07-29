## ADDED Requirements

### Requirement: Annual reading goal persistence

The system SHALL persist annual reading goals in `annual_reading_goals` with `UNIQUE (user_id, year)` and `CHECK (target_book_count > 0)`.

#### Scenario: One goal per user per year

- **WHEN** a goal is saved for user U and year 2026
- **THEN** a second upsert for the same (U, 2026) updates `target_book_count` without inserting a duplicate row

#### Scenario: Target must be positive

- **WHEN** `target_book_count` is 0 or negative
- **THEN** the system responds with HTTP 400

### Requirement: Get annual goal with progress

The system SHALL expose `GET /v1/goals/{year}` for the authenticated user returning the goal (or `null`), `books_read`, `progress_percent`, and optional `forecast`.

#### Scenario: Goal with progress (US-03 scenario 2)

- **WHEN** the user has `target_book_count = 50` for 2026 and 20 books with `status = leido` and `finished_on` in 2026
- **THEN** the response includes `books_read: 20`, `progress_percent: 40`, and goal metadata

#### Scenario: No goal set

- **WHEN** the user has no row in `annual_reading_goals` for the requested year
- **THEN** the system responds with HTTP 200, `goal: null`, `books_read` count, and `progress_percent: null`

#### Scenario: Books outside year excluded

- **WHEN** a book has `status = leido` but `finished_on` in 2025 while requesting year 2026
- **THEN** that book is not counted in `books_read`

#### Scenario: Invalid year

- **WHEN** `year` is outside 1970–2100
- **THEN** the system responds with HTTP 400

### Requirement: Upsert annual goal

The system SHALL expose `PUT /v1/goals/{year}` accepting `{ "target_book_count": <integer> }` that creates or updates the goal for the authenticated user.

#### Scenario: Save new goal (US-03 scenario 1)

- **WHEN** the user sends `PUT /v1/goals/2026` with `{ "target_book_count": 50 }` and no goal exists
- **THEN** the system persists the goal and responds with HTTP 200 including updated progress fields

#### Scenario: Edit existing goal

- **WHEN** the user changes `target_book_count` from 50 to 30 mid-year
- **THEN** the same row is updated, `updated_at` changes, and `progress_percent` is recalculated

#### Scenario: User scoping

- **WHEN** an unauthenticated request is made
- **THEN** the system responds with HTTP 401

### Requirement: Forecast calculation

When sufficient data exists (`books_read >= 1` and at least 7 UTC days elapsed since the later of Jan 1 of the goal year or the first `finished_on` in that year), the system SHALL include a `forecast` object with `projected_year_end_count`, `on_track`, `pace_books_per_week`, `required_books_per_week`, and `status` (`ahead` | `on_track` | `behind`).

#### Scenario: Forecast with sufficient data (US-03 scenario 3)

- **WHEN** the user has an active goal and sufficient reading data in the year
- **THEN** `GET /v1/goals/{year}` includes `forecast` with pace-based projection and `on_track` boolean

#### Scenario: Insufficient data for forecast

- **WHEN** the user has a goal but fewer than 7 days of elapsed reading period or zero books read
- **THEN** `forecast` is `null`

#### Scenario: Forecast recalculates after new book read

- **WHEN** the user marks another book `leido` with `finished_on` in the goal year and then calls `GET /v1/goals/{year}`
- **THEN** `books_read` and `forecast` reflect the new count
