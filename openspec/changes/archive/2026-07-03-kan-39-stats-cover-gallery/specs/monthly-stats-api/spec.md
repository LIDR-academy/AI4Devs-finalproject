## MODIFIED Requirements

### Requirement: Get monthly reading statistics

The system SHALL expose `GET /v1/stats/{year}/{month}` for the authenticated user, returning month-scoped aggregates computed from `reading_records` joined to `books`: `books_read`, `pages_read`, `average_rating`, `genre_distribution`, `format_distribution`, `predominant_format`, and `books_in_period`. A book qualifies for the month when its reading record has `status = 'leido'` and `finished_on` falls within `[YYYY-MM-01, next-month-01)`. No statistics table is persisted; results are computed on read (UC-07, KAN-15).

#### Scenario: Books and pages read (US-05 scenario 1)

- **WHEN** the user has 4 books with `status = leido` and `finished_on` in the requested month, with page counts 300, 320, 400, and 300
- **THEN** the response includes `books_read: 4` and `pages_read: 1320`

#### Scenario: Null page count counts as zero pages

- **WHEN** a qualifying book has `page_count = null`
- **THEN** that book increments `books_read` but contributes 0 to `pages_read`

#### Scenario: Empty month returns zeroed payload

- **WHEN** the user has no qualifying book in the requested month
- **THEN** the system responds with HTTP 200, `books_read: 0`, `pages_read: 0`, `average_rating: null`, `predominant_format: null`, empty distribution arrays, and `books_in_period: []`

#### Scenario: Books outside month excluded

- **WHEN** a book has `status = leido` with `finished_on` on the last day of the previous month or the first day of the next month
- **THEN** that book is not counted in the requested month

#### Scenario: Non-read books excluded

- **WHEN** a book in the requested month has `status` other than `leido` (for example `leyendo` or `dnf`)
- **THEN** it is excluded from all monthly aggregates

#### Scenario: Invalid month or year

- **WHEN** `month` is outside 1–12 or `year` is outside 1970–2100
- **THEN** the system responds with HTTP 400

#### Scenario: User scoping

- **WHEN** an unauthenticated request is made
- **THEN** the system responds with HTTP 401

#### Scenario: Stats are user-isolated

- **WHEN** another user has qualifying books in the same month
- **THEN** those books are not included in the requesting user's statistics

### Requirement: Year-period statistics endpoint

The system SHALL expose `GET /v1/stats?period=year&year=YYYY` for the authenticated user, returning year-scoped aggregates with the same fields as monthly stats except `month` is omitted, including `books_in_period`. A book qualifies when `status = 'leido'` and `finished_on` falls within `[YYYY-01-01, (YYYY+1)-01-01)`. Results are computed on read; empty years return zeroed totals and empty distributions with HTTP 200.

#### Scenario: Year aggregates returned

- **WHEN** the client requests `GET /v1/stats?period=year&year=2026` and the user finished 3 books in 2026
- **THEN** the response includes `year: 2026`, `books_read: 3`, populated distributions, and `books_in_period` with 3 entries

#### Scenario: Empty year

- **WHEN** the user has no qualifying books in the requested year
- **THEN** the response returns `books_read: 0`, `pages_read: 0`, `average_rating: null`, empty distributions, `predominant_format: null`, and `books_in_period: []`

#### Scenario: Invalid year rejected

- **WHEN** `year` is outside 1970–2100 or `period` is not `year`
- **THEN** the API responds with 400

#### Scenario: Authentication required

- **WHEN** the request lacks a valid JWT
- **THEN** the API responds with 401
