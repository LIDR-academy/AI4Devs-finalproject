## 1. Backend Implementation

- [x] 1.1 Create `DashboardStatsResponse` DTO in `Aura.Core/DTOs/Dashboard/`.
- [x] 1.2 Create `IDashboardService` interface in `Aura.Core/Interfaces/Services/`.
- [x] 1.3 Implement `DashboardService` in `Aura.Core/Services/` that queries Guests, Invitations, and RSVPs to build the stats.
- [x] 1.4 Register `IDashboardService` in the dependency injection container.
- [x] 1.5 Create `DashboardController` in `Aura.Api/Controllers/` with `GET /api/events/{slug}/dashboard` endpoint.
- [x] 1.6 Implement CSV export logic in `DashboardService` using `CsvHelper`.
- [x] 1.7 Add `GET /api/events/{slug}/guests/export` endpoint in `DashboardController` for CSV export.
- [x] 1.8 Write unit tests for dashboard statistics calculation and CSV export.

## 2. Frontend Implementation

- [x] 2.1 Create `DashboardService` in `frontend/src/app/core/services/` to call the new backend endpoints.
- [x] 2.2 Create `control-dashboard` page component `frontend/src/app/features/dashboard/pages/dashboard.page.ts`.
- [x] 2.3 Implement `StatsCardComponent` for displaying the invited, confirmed, declined, pending stats.
- [x] 2.4 Implement dietary restrictions panel.
- [x] 2.5 Implement transport needs panel.
- [x] 2.6 Implement guest list table component with RSVP status badges.
- [x] 2.7 Implement RSVP status filtering logic in the guest list table.
- [x] 2.8 Implement CSV export button that calls the export endpoint and downloads the file.
- [x] 2.9 Implement real-time updates via 5-second polling in the dashboard page component.
- [x] 2.10 Add empty states ("Add guests to get started" and "Waiting for responses").
- [x] 2.11 Add route for the new dashboard page in the router configuration.
