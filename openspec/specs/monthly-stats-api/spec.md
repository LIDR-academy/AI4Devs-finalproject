# monthly-stats-api Specification

## Purpose
TBD - created by archiving change kan-15-monthly-stats-dashboard. Update Purpose after archive.
## Requirements
### Requirement: Get monthly reading statistics

The system SHALL expose `GET /v1/stats/{year}/{month}` for the authenticated user, returning month-scoped aggregates computed from `reading_records` joined to `books`: `books_read`, `pages_read`, `average_rating`, `genre_distribution`, `format_distribution`, `predominant_format`, `books_in_period`, and `insights`. A book qualifies for the month when its reading record has `status = 'leido'` and `finished_on` falls within `[YYYY-MM-01, next-month-01)`. No statistics table is persisted; results are computed on read (UC-07, KAN-15).

#### Scenario: Books and pages read (US-05 scenario 1)

- **WHEN** the user has 4 books with `status = leido` and `finished_on` in the requested month, with page counts 300, 320, 400, and 300
- **THEN** the response includes `books_read: 4` and `pages_read: 1320`

#### Scenario: Null page count counts as zero pages

- **WHEN** a qualifying book has `page_count = null`
- **THEN** that book increments `books_read` but contributes 0 to `pages_read`

#### Scenario: Empty month returns zeroed payload

- **WHEN** the user has no qualifying book in the requested month
- **THEN** the system responds with HTTP 200, `books_read: 0`, `pages_read: 0`, `average_rating: null`, `predominant_format: null`, empty distribution arrays, `books_in_period: []`, and `insights: []`

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

### Requirement: Average rating aggregation

The system SHALL compute `average_rating` as the mean of non-null `reading_records.rating` (0.5–5 in 0.5 steps) across the period's qualifying books, rounded to two decimals, and SHALL return `null` when no qualifying book has a rating.

#### Scenario: Average over rated books only

- **WHEN** three qualifying books have ratings 5, 4, and null
- **THEN** `average_rating` is `4.5` (computed over the two rated books)

#### Scenario: Average includes half-star ratings

- **WHEN** two qualifying books have ratings `4` and `3.5`
- **THEN** `average_rating` is `3.75`

#### Scenario: No rated books

- **WHEN** no qualifying book in the month has a rating
- **THEN** `average_rating` is `null`

### Requirement: Genre distribution

The system SHALL return `genre_distribution` as an array of `{ genre, count }` grouped by `books.genre` over the month's qualifying books, bucketing `null` genre as `"unknown"`, ordered by `count` descending.

#### Scenario: Distribution by genre (US-05 scenario 2)

- **WHEN** the month's qualifying books include 2 of genre `Fantasy` and 1 of genre `Sci-Fi`
- **THEN** `genre_distribution` contains `{ "genre": "Fantasy", "count": 2 }` and `{ "genre": "Sci-Fi", "count": 1 }`

#### Scenario: Null genre bucketed as unknown

- **WHEN** a qualifying book has `genre = null`
- **THEN** it is counted under the `"unknown"` bucket in `genre_distribution`

### Requirement: Format distribution and predominant format

The system SHALL return `format_distribution` as an array of `{ format, count }` grouped by the linked `formats.name` for `reading_records.format_id` (bucketing `null` or missing format as `"unknown"`), ordered by count descending.

The system SHALL set `predominant_format` to the non-`unknown` format name with the highest count, deterministically breaking ties by alphabetical order of the format name (`es` locale), or `null` when no qualifying book records a format.

#### Scenario: Distribution with default format names

- **WHEN** the user finished 2 books as `Físico` and 1 as `Ebook` in the period
- **THEN** `format_distribution` includes `{ format: "Físico", count: 2 }` and `{ format: "Ebook", count: 1 }`
- **AND** `predominant_format` is `"Físico"`

#### Scenario: Custom format names

- **WHEN** the user has a custom format `Audiolibro por capítulos` assigned to finished books
- **THEN** `format_distribution` includes that exact name in a bucket
- **AND** `predominant_format` reflects the most frequent custom name when it leads

#### Scenario: Null format_id after format delete

- **WHEN** finished books have `format_id` null (e.g. after format delete)
- **THEN** those books contribute to the `unknown` bucket
- **AND** stats computation does not error

#### Scenario: No format recorded

- **WHEN** no finished book in the period has a format assigned
- **THEN** `predominant_format` is `null`

### Requirement: Year-period statistics endpoint

The system SHALL expose `GET /v1/stats?period=year&year=YYYY` for the authenticated user, returning year-scoped aggregates with the same fields as monthly stats except `month` is omitted, including `insights`. A book qualifies when `status = 'leido'` and `finished_on` falls within `[YYYY-01-01, (YYYY+1)-01-01)`. Results are computed on read; empty years return zeroed totals and empty distributions with HTTP 200.

#### Scenario: Year aggregates returned

- **WHEN** the client requests `GET /v1/stats?period=year&year=2026` and the user finished 3 books in 2026
- **THEN** the response includes `year: 2026`, `books_read: 3`, populated distributions, `books_in_period` with 3 entries, and at least three `insights`

#### Scenario: Empty year

- **WHEN** the user has no qualifying books in the requested year
- **THEN** the response returns `books_read: 0`, `pages_read: 0`, `average_rating: null`, empty distributions, `predominant_format: null`, `books_in_period: []`, and `insights: []`

#### Scenario: Invalid year rejected

- **WHEN** `year` is outside 1970–2100 or `period` is not `year`
- **THEN** the API responds with 400

#### Scenario: Authentication required

- **WHEN** the request lacks a valid JWT
- **THEN** the API responds with 401

