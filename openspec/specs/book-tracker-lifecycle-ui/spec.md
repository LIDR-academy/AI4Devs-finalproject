## Purpose

Book Tracker reading lifecycle UI: inline status changes, dates, rating, the completion modal, and client-side cache coherence with dependent views (books list, monthly TBR, annual goals, and monthly stats).
## Requirements
### Requirement: Inline status change in Book Tracker

The Book Tracker UI SHALL allow changing a book's reading status from the table row without a full page reload.

#### Scenario: Immediate status update (KAN-12 scenario 1)

- **WHEN** the user selects a new status from the row selector
- **THEN** the client calls `PATCH /v1/books/{bookId}/reading-record` and updates the row after success without reloading the page

### Requirement: Start date on reading status

The UI SHALL show and allow editing `started_on` when the book is `leyendo`, `leido`, or `dnf`. When the user changes status to `leyendo` from `pendiente`, the start date field SHALL reflect the server-assigned today date.

#### Scenario: Auto start date (KAN-12 scenario 2)

- **WHEN** the user sets status to Leyendo from Pendiente
- **THEN** the start date column shows today's date and remains editable

### Requirement: Completion modal on mark as read

The UI SHALL open a completion modal when a PATCH response includes `meta.openCompletionModal: true`, offering finish date (default today), read format (Físico / Ebook / Audio), and 1–5 star rating.

#### Scenario: Modal on transition to read (KAN-12 scenario 3)

- **WHEN** the user changes status to Leído from Leyendo and the API returns `openCompletionModal`
- **THEN** a modal opens with finish date, format selector, and star rating

#### Scenario: Dismiss modal without optional fields (KAN-12 scenario 4)

- **WHEN** the user closes the modal without saving optional fields
- **THEN** the book remains Leído and optional fields can be completed later inline

#### Scenario: Save modal fields

- **WHEN** the user confirms the modal with format and rating
- **THEN** the client PATCHes `finished_on`, `read_format`, and `rating` and refreshes the row

#### Scenario: Format optional in modal (KAN-30)

- **WHEN** the user saves the completion modal without selecting a format
- **THEN** `read_format` stays null until set inline later

### Requirement: Inline star rating for read books

The UI SHALL allow assigning 1–5 stars inline in the table for books in status `leido` without opening the modal.

#### Scenario: Inline rating (KAN-12 scenario 5)

- **WHEN** the user edits the rating cell on a Leído book without rating
- **THEN** the client PATCHes `rating` and updates the stars in place

### Requirement: Inline date editing

The UI SHALL provide date pickers for start and finish dates on rows in `leyendo` or `leido` status.

#### Scenario: Edit dates inline (KAN-12 scenario 6)

- **WHEN** the user edits start or finish date in the row
- **THEN** the client PATCHes the corresponding date field and updates the display

### Requirement: Client-side date validation feedback

The UI SHALL surface server 422 errors when finish date is before start date and SHALL NOT show the invalid value as saved.

#### Scenario: Invalid date range (KAN-12 scenario 7)

- **WHEN** the user sets finish date before start date and the API returns 422
- **THEN** the UI shows a validation error and keeps the previous valid value

### Requirement: Accessible controls

Status selectors and star rating controls SHALL be operable via keyboard following WCAG 2.1 AA patterns for the MVP.

#### Scenario: Keyboard status change

- **WHEN** the user focuses the status control and uses keyboard interaction
- **THEN** they can change status without requiring a mouse

### Requirement: Cache coherence

The client SHALL invalidate or update the TanStack Query `['books']` cache after successful reading-record mutations. When the PATCH response includes `meta.tbrAutoCompleted: true`, the client SHALL also invalidate the active month's TBR query `['tbr', year, month]` (UTC calendar month of `reading.finished_on`, or current UTC month as fallback). When a PATCH affects annual goal progress for a UTC calendar year, the client SHALL invalidate `['goals', year]` for each affected year: (a) on transition **to** `leido`, using the UTC year of `reading.finished_on` (or current UTC year when absent); (b) on transition **from** `leido`, using the UTC year of the previous `finished_on`; (c) when `finished_on` changes on a `leido` book, invalidating both the previous and new UTC years when they differ. When a PATCH affects monthly statistics, the client SHALL likewise invalidate `['stats', year, month]` for each affected UTC calendar month: (a) on transition **to** `leido`, using the UTC year/month of `reading.finished_on` (or current UTC month when absent); (b) on transition **from** `leido`, using the UTC year/month of the previous `finished_on`; (c) when `finished_on` changes on a `leido` book, invalidating both the previous and new UTC months when they differ.

#### Scenario: List refresh after patch

- **WHEN** a PATCH succeeds
- **THEN** the tracker table reflects the updated reading fields without manual refresh

#### Scenario: TBR cache invalidation on auto-complete (KAN-13)

- **WHEN** the user marks a book as read from Book Tracker and the PATCH response includes `meta.tbrAutoCompleted: true`
- **THEN** the client invalidates `['tbr', year, month]` for the active month so `/lists` shows the entry completed on next fetch

#### Scenario: Goals cache invalidation on mark as read (KAN-11 / KAN-14)

- **WHEN** a reading-record PATCH transitions status to `leido`
- **THEN** the client invalidates `['goals', year]` for the UTC year of `reading.finished_on` so the Home goal card reflects the new count on next fetch

#### Scenario: Goals cache invalidation on revert from read (KAN-14)

- **WHEN** a reading-record PATCH transitions status from `leido` to another status
- **THEN** the client invalidates `['goals', year]` for the UTC year of the previous `finished_on` so the Home goal card reflects the decremented count on next fetch

#### Scenario: Goals cache invalidation on finish date year change (KAN-14)

- **WHEN** a reading-record PATCH changes `finished_on` on a `leido` book to a date in a different UTC calendar year
- **THEN** the client invalidates `['goals', year]` for both the previous and new UTC years

#### Scenario: Stats cache invalidation on mark as read (KAN-15)

- **WHEN** a reading-record PATCH transitions status to `leido`
- **THEN** the client invalidates `['stats', year, month]` for the UTC year/month of `reading.finished_on` so the Reading Stats dashboard reflects the new totals on next fetch

#### Scenario: Stats cache invalidation on revert from read (KAN-15)

- **WHEN** a reading-record PATCH transitions status from `leido` to another status
- **THEN** the client invalidates `['stats', year, month]` for the UTC year/month of the previous `finished_on`

#### Scenario: Stats cache invalidation on finish date month change (KAN-15)

- **WHEN** a reading-record PATCH changes `finished_on` on a `leido` book to a date in a different UTC calendar month
- **THEN** the client invalidates `['stats', year, month]` for both the previous and new UTC months

