## ADDED Requirements

### Requirement: Lists route and month navigation

The application SHALL provide a Lists page at `/lists` that loads the monthly TBR for a selected calendar month, defaulting to the current month.

#### Scenario: Open Lists shows current month (KAN-10 scenario 1)

- **WHEN** the user navigates to `/lists`
- **THEN** the client requests `GET /v1/tbr/{currentYear}/{currentMonth}` and displays the list titled with that month (e.g. `TBR April 2026`)

#### Scenario: Change month

- **WHEN** the user selects a different month via the month control
- **THEN** the client fetches that month's TBR and updates the view

### Requirement: Empty list encourages adding books

The Lists UI SHALL show an empty-state message and a primary action to add books when the monthly TBR has zero entries.

#### Scenario: Empty TBR (KAN-10 scenario 2)

- **WHEN** the loaded list has `entries.length === 0`
- **THEN** the user sees copy encouraging them to add books and a control to open the add-book flow

### Requirement: Add book from library

The Lists UI SHALL allow adding a book from the user's library to the currently displayed monthly TBR.

#### Scenario: Add book to list

- **WHEN** the user selects a library book in the add flow and confirms
- **THEN** the client calls `POST /v1/tbr/{year}/{month}/entries` and refreshes the checklist without a full page reload

### Requirement: Checklist displays completion state

The Lists UI SHALL render each TBR entry with visual distinction when `completed` is true (e.g. check icon and strikethrough).

#### Scenario: Completed entry styling

- **WHEN** an entry has `completed = true`
- **THEN** the row appears completed in the checklist

### Requirement: Invalidate TBR cache on auto-complete

When `PATCH /v1/books/{bookId}/reading-record` returns `meta.tbrAutoCompleted: true`, the client SHALL invalidate the active month's TBR query so the Lists view reflects completion after navigation or refetch.

#### Scenario: Mark read updates TBR display (KAN-10 scenario 3)

- **WHEN** the user marks a book as read from Book Tracker and the PATCH response includes `tbrAutoCompleted: true`
- **THEN** the client's TBR cache for the current month is invalidated and a subsequent Lists view shows the book as completed

### Requirement: Remove entry from list

The Lists UI SHALL allow removing a book from the monthly TBR without deleting the book from the library.

#### Scenario: Remove from TBR

- **WHEN** the user removes an entry from the checklist
- **THEN** the client calls `DELETE /v1/tbr/{year}/{month}/entries/{entryId}` and removes the row on success
