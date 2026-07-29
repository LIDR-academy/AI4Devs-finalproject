## MODIFIED Requirements

### Requirement: Cache coherence

The client SHALL invalidate or update the TanStack Query `['books']` cache after successful reading-record mutations. When the PATCH response includes `meta.tbrAutoCompleted: true`, the client SHALL also invalidate the active month's TBR query `['tbr', year, month]` (UTC calendar month of `reading.finished_on`, or current UTC month as fallback). When status transitions to `leido`, the client SHALL invalidate `['goals', year]` where `year` is the UTC calendar year of `reading.finished_on` (or current UTC year when `finished_on` is absent).

#### Scenario: Books list refresh after patch

- **WHEN** a reading-record PATCH succeeds
- **THEN** the Book Tracker list query is invalidated or optimistically updated

#### Scenario: TBR cache invalidation on auto-complete (KAN-13)

- **WHEN** PATCH returns `meta.tbrAutoCompleted: true`
- **THEN** the client invalidates `['tbr', year, month]` for the active month so `/lists` shows the entry completed on next fetch

#### Scenario: Goals cache invalidation on mark as read (KAN-11)

- **WHEN** a reading-record PATCH transitions status to `leido`
- **THEN** the client invalidates `['goals', year]` for the UTC year of `reading.finished_on` so the Home goal card reflects the new count on next fetch
