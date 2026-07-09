## Why

Events require a comprehensive system to manage guest lists effectively. Users need the ability to add guests manually or in bulk (via CSV), categorize them, search, and manage RSVPs. This implements PSRP-008, enabling full CRUD for guests, duplicate detection, soft deletes, and enforcing business logic like free tier limits (max 5 guests for draft events).

## What Changes

- Add complete backend CRUD operations for Guests under an Event.
- Add CSV import functionality with parsing, validation, and error reporting.
- Implement duplicate detection based on email uniqueness per event.
- Enforce free tier limits (max 5 guests for events in `draft` status).
- Implement soft delete cascade for guests and their associated invitations.
- Create a new Guest Manager page in the frontend with a data table, filtering (by category), search, and a CSV upload area with preview.

## Capabilities

### New Capabilities
- `guest-management`: Complete guest system including CRUD, CSV import with validation, duplicate detection, soft delete cascade, and free tier limitations.

### Modified Capabilities
- None

## Impact

- **Backend Code:** New `IGuestService`, `GuestService`, `GuestsController`. Addition of `CsvHelper` package for CSV parsing.
- **Frontend Code:** New `guest-manager.page.ts` and related components (`guest-import.component.ts`, `guest-table.component.ts`), `GuestService`.
- **Database:** Introduces global query filters for soft deletes on `Guests` and `Invitations`.
- **Business Logic:** Events in draft status will be restricted to 5 guests.
