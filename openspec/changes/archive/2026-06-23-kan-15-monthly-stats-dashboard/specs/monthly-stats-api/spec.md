## ADDED Requirements

### Requirement: Get monthly reading statistics

The system SHALL expose `GET /v1/stats/{year}/{month}` for the authenticated user, returning month-scoped aggregates computed from `reading_records` joined to `books`: `books_read`, `pages_read`, `average_rating`, `genre_distribution`, `format_distribution`, and `predominant_format`. A book qualifies for the month when its reading record has `status = 'leido'` and `finished_on` falls within `[YYYY-MM-01, next-month-01)`. No statistics table is persisted; results are computed on read (UC-07, KAN-15).

#### Scenario: Books and pages read (US-05 scenario 1)

- **WHEN** the user has 4 books with `status = leido` and `finished_on` in the requested month, with page counts 300, 320, 400, and 300
- **THEN** the response includes `books_read: 4` and `pages_read: 1320`

#### Scenario: Null page count counts as zero pages

- **WHEN** a qualifying book has `page_count = null`
- **THEN** that book increments `books_read` but contributes 0 to `pages_read`

#### Scenario: Empty month returns zeroed payload

- **WHEN** the user has no qualifying book in the requested month
- **THEN** the system responds with HTTP 200, `books_read: 0`, `pages_read: 0`, `average_rating: null`, `predominant_format: null`, and empty distribution arrays

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

The system SHALL compute `average_rating` as the mean of non-null `reading_records.rating` (1–5) across the month's qualifying books, rounded to two decimals, and SHALL return `null` when no qualifying book has a rating.

#### Scenario: Average over rated books only

- **WHEN** three qualifying books have ratings 5, 4, and null
- **THEN** `average_rating` is `4.5` (computed over the two rated books)

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

The system SHALL return `format_distribution` as an array of `{ format, count }` grouped by `reading_records.read_format` (bucketing `null` as `"unknown"`), and SHALL set `predominant_format` to the non-`unknown` format with the highest count, deterministically breaking ties by enum order `fisico` > `ebook` > `audio`, or `null` when no qualifying book records a format.

#### Scenario: Predominant format selection

- **WHEN** the month's qualifying books have `read_format` of 3 `fisico` and 1 `ebook`
- **THEN** `format_distribution` reflects both counts and `predominant_format` is `"fisico"`

#### Scenario: No recorded format

- **WHEN** no qualifying book in the month has a `read_format`
- **THEN** `predominant_format` is `null`
