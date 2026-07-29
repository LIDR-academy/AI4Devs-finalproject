## MODIFIED Requirements

### Requirement: Cache coherence

The client SHALL invalidate or update the TanStack Query `['books']` cache after successful reading-record mutations. When the PATCH response includes `meta.tbrAutoCompleted: true`, the client SHALL also invalidate the active month's TBR query `['tbr', year, month]` (UTC calendar month of `reading.finished_on`, or current UTC month as fallback).

#### Scenario: List refresh after patch

- **WHEN** a PATCH succeeds
- **THEN** the tracker table reflects the updated reading fields without manual refresh

#### Scenario: TBR cache invalidation on auto-complete (KAN-13)

- **WHEN** the user marks a book as read from Book Tracker and the PATCH response includes `meta.tbrAutoCompleted: true`
- **THEN** the client invalidates `['tbr', year, month]` for the active month so `/lists` shows the entry completed on next fetch
