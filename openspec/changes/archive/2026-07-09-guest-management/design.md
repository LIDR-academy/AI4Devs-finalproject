## Context

The application currently lacks a feature to manage event guests. Issue PSRP-008 requires building a comprehensive guest management module, including manual addition, bulk CSV import with validation, duplicate detection, categorisation, and soft deletion. Business constraints restrict events in "draft" mode to a maximum of 5 guests.

## Goals / Non-Goals

**Goals:**
- Implement `IGuestService` and `GuestService` in the backend for CRUD operations and CSV processing.
- Add `GuestsController` with endpoints for listing, adding, importing, and deleting guests.
- Use `CsvHelper` to parse and validate UTF-8 CSV files, reporting row-level errors.
- Enforce business rules (max 5 guests for draft events, duplicate email detection).
- Implement cascading soft deletes (Guest -> Invitation).
- Build a responsive frontend interface (`guest-manager.page.ts`) with a sortable table, filters, search, and CSV upload zone.

**Non-Goals:**
- Handling massive CSV files (scaling beyond the free tier limits is out of scope for this basic MVP).
- Sending actual email invitations during the import process (handled in a separate epic).

## Decisions

- **CSV Parsing**: We will use the `CsvHelper` NuGet package in the backend for robust CSV parsing. Validation will be performed per-row, allowing us to return specific row and field errors to the frontend.
- **Duplicate Detection**: Emails must be unique per event (`WHERE EventId = @eventId AND Email = @email AND IsDeleted = false`). The backend will flag duplicates and return them to the frontend so the user can decide whether to update or skip them.
- **Soft Delete Cascade**: When a guest is soft-deleted, their associated `Invitation` will also be soft-deleted. This will be implemented in the Application layer (`GuestService`) to ensure domain logic is preserved.
- **Free Tier Constraints**: Implemented in `GuestService`. A check for `Event.Status == "draft"` will throw a `GuestLimitExceededException` if adding new guests pushes the total over 5.

## Risks / Trade-offs

- **Risk**: Memory constraints during CSV import.
  - **Mitigation**: The `CsvHelper` library streams the file. However, since the maximum number of guests is generally limited (e.g., free tier), the dataset size should be manageable.
- **Risk**: Complex soft delete state.
  - **Mitigation**: Use Entity Framework Core's Global Query Filters to automatically exclude `IsDeleted=true` records, keeping query logic clean.
