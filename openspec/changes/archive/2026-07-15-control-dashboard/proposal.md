## Why

The event host needs a control dashboard to monitor RSVP statistics in real-time, view dietary restrictions, track transport needs, and manage the guest list effectively. This solves the problem of event organizers not having a centralized view of their event's attendance and special requirements.

## What Changes

- Add a new dashboard page for the host (`frontend/src/app/features/dashboard/pages/dashboard.page.ts`).
- Add real-time statistics cards (invited, confirmed, declined, pending, maybe).
- Add panels for dietary restrictions and transport needs.
- Add a guest list table with RSVP status and filtering capabilities.
- Add CSV export functionality for the guest list.
- Add backend endpoints for dashboard statistics and CSV export.

## Capabilities

### New Capabilities
- `control-dashboard`: Host dashboard with real-time RSVP statistics, guest list filtering, dietary restrictions tracking, and data export.

### Modified Capabilities

## Impact

- Frontend: New dashboard feature module including pages and components, plus API service integration.
- Backend: New `DashboardController` and `DashboardService` with new endpoints for stats and CSV export.
- Database: Read-only aggregate queries on existing Guests, Invitations, and RSVPs tables.
