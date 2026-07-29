## ADDED Requirements

### Requirement: Year-period statistics endpoint

The system SHALL expose `GET /v1/stats?period=year&year=YYYY` for the authenticated user, returning year-scoped aggregates with the same fields as monthly stats except `month` is omitted. A book qualifies when `status = 'leido'` and `finished_on` falls within `[YYYY-01-01, (YYYY+1)-01-01)`. Results are computed on read; empty years return zeroed totals and empty distributions with HTTP 200.

#### Scenario: Year aggregates returned

- **WHEN** the client requests `GET /v1/stats?period=year&year=2026` and the user finished 3 books in 2026
- **THEN** the response includes `year: 2026`, `books_read: 3`, and populated distributions

#### Scenario: Empty year

- **WHEN** the user has no qualifying books in the requested year
- **THEN** the response returns `books_read: 0`, `pages_read: 0`, `average_rating: null`, empty distributions, and `predominant_format: null`

#### Scenario: Invalid year rejected

- **WHEN** `year` is outside 1970–2100 or `period` is not `year`
- **THEN** the API responds with 400

#### Scenario: Authentication required

- **WHEN** the request lacks a valid JWT
- **THEN** the API responds with 401
