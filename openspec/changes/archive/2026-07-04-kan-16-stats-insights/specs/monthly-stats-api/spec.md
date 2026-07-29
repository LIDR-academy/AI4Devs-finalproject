## MODIFIED Requirements

### Requirement: Get monthly reading statistics

The system SHALL expose `GET /v1/stats/{year}/{month}` for the authenticated user, returning month-scoped aggregates computed from `reading_records` joined to `books`: `books_read`, `pages_read`, `average_rating`, `genre_distribution`, `format_distribution`, `predominant_format`, `books_in_period`, and `insights`. A book qualifies for the month when its reading record has `status = 'leido'` and `finished_on` falls within `[YYYY-MM-01, next-month-01)`. No statistics table is persisted; results are computed on read (UC-07, KAN-15).

#### Scenario: Books and pages read (US-05 scenario 1)

- **WHEN** the user has 4 books with `status = leido` and `finished_on` in the requested month, with page counts 300, 320, 400, and 300
- **THEN** the response includes `books_read: 4` and `pages_read: 1320`

#### Scenario: Empty month returns zeroed payload

- **WHEN** the user has no qualifying book in the requested month
- **THEN** the system responds with HTTP 200, zeroed totals, empty distributions, `books_in_period: []`, and `insights: []`

### Requirement: Year-period statistics endpoint

The system SHALL expose `GET /v1/stats?period=year&year=YYYY` for the authenticated user, returning year-scoped aggregates with the same fields as monthly stats except `month` is omitted, including `insights`. A book qualifies when `status = 'leido'` and `finished_on` falls within `[YYYY-01-01, (YYYY+1)-01-01)`.

#### Scenario: Year aggregates returned

- **WHEN** the client requests yearly stats and the user finished books in that year
- **THEN** the response includes populated distributions and at least three `insights` when `books_read >= 1`

#### Scenario: Empty year

- **WHEN** the user has no qualifying books in the requested year
- **THEN** the response returns zeroed totals, empty distributions, and `insights: []`
