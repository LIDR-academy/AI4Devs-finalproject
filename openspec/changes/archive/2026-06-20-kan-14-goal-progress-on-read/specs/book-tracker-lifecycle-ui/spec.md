## MODIFIED Requirements

### Requirement: Cache coherence

The client SHALL invalidate or update the TanStack Query `['books']` cache after successful reading-record mutations. When the PATCH response includes `meta.tbrAutoCompleted: true`, the client SHALL also invalidate the active month's TBR query `['tbr', year, month]` (UTC calendar month of `reading.finished_on`, or current UTC month as fallback). When a PATCH affects annual goal progress for a UTC calendar year, the client SHALL invalidate `['goals', year]` for each affected year: (a) on transition **to** `leido`, using the UTC year of `reading.finished_on` (or current UTC year when absent); (b) on transition **from** `leido`, using the UTC year of the previous `finished_on`; (c) when `finished_on` changes on a `leido` book, invalidating both the previous and new UTC years when they differ.

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
