## PSRP-009: feat(dashboard): control-dashboard

**Type:** feat
**Priority:** P0 (Must)
**Estimated Effort:** L (4-5d)
**Sprint Week:** W3
**Dependencies:** PSRP-006, PSRP-008

## Feature Summary
Implementar el dashboard de control del host con estadísticas de RSVP en tiempo real, lista de restricciones dietéticas, conteo de necesidades de transporte, conteo de acompañantes, lista de invitados con estado de RSVP, filtrado por estado de RSVP, y exportación CSV. El backend proporciona endpoints de estadísticas agregadas y el frontend renderiza el dashboard con tarjetas de estadísticas, gráficos y tabla de invitados filtrable.

## Requirements
- [ ] Implement dashboard statistics endpoint: `GET /api/events/{slug}/dashboard` — returns: totalInvited, confirmed, declined, pending, maybe, dietaryRestrictions (list of {guestName, restrictions}), transportNeedsCount, plusOneCount. Requires EventOwner policy (JWT in `aura_session` cookie).
- [ ] Implement CSV export endpoint: `GET /api/events/{slug}/guests/export` — returns CSV file with columns: name, email, phone, category, rsvpStatus, dietaryRestrictions, transportNeeds. Requires EventOwner policy.
- [ ] Implement real-time update mechanism: polling every 5 seconds or SignalR WebSocket for dashboard stats
- [ ] Implement dashboard page (`features/dashboard/pages/dashboard.page.ts`) with: stats cards (total invited, confirmed, declined, pending), dietary restrictions panel, transport needs panel, guest list with RSVP status badges
- [ ] Implement `StatsCardComponent` (label, value, icon, color) following style guide
- [ ] Implement RSVP status filter tabs: All, Confirmed, Declined, Pending, Maybe
- [ ] Implement guest list table with RSVP status badges (color-coded: confirmed=green, declined=red, pending=yellow)
- [ ] Implement "Export CSV" button that triggers file download
- [ ] Implement empty states: "Add guests to get started" (no guests), "Waiting for responses" (no RSVPs yet)
- [ ] Implement real-time stat updates: dashboard polls `GET /api/events/{slug}/dashboard` every 5 seconds when visible
- [ ] Implement `DashboardService` in Angular frontend for API calls and polling logic
- [ ] Write unit tests for dashboard statistics calculation and CSV export

## Technical Notes
- **Backend:**
  - Dashboard stats query: JOIN Guests, Invitations, RSVPs. Aggregate counts by Attendance value. Filter IsDeleted=false
  - Dietary restrictions: query RSVPs WHERE DietaryRestrictions IS NOT NULL AND DietaryRestrictions != ''
  - CSV export: use `CsvHelper` to generate CSV, return as FileResult with content-type `text/csv`
  - Real-time: for MVP, use polling (5-second interval). SignalR can be added in V2
- **Frontend:**
  - Stats cards use Playfair Display for values (32px), Inter for labels (13px)
  - Polling: `interval(5000)` rxjs operator with `switchMap` to fetch stats
  - CSV download: create Blob from response, trigger download via anchor click
  - Empty states use EmptyStateComponent from shared
- **Database:** Guests, Invitations, RSVPs tables (aggregate queries)
- **Integrations:** N/A
- **Key files:**
  - `backend/src/Aura.Api/Controllers/DashboardController.cs`
  - `backend/src/Aura.Core/Interfaces/Services/IDashboardService.cs`
  - `backend/src/Aura.Core/Services/DashboardService.cs`
  - `backend/src/Aura.Core/DTOs/Dashboard/DashboardStatsResponse.cs`
  - `frontend/src/app/features/dashboard/pages/dashboard.page.ts`
  - `frontend/src/app/features/dashboard/components/stats-card.component.ts`
  - `frontend/src/app/features/dashboard/components/guest-table.component.ts`
  - `frontend/src/app/features/dashboard/components/rsvp-chart.component.ts`
  - `frontend/src/app/core/services/dashboard.service.ts`

## Acceptance Criteria
- [ ] AC1: Given an event with guests and RSVPs, when the host views the dashboard, then stats show: total invited, confirmed, declined, pending, dietary restrictions list, transport needs count
- [ ] AC2: Given a guest submits an RSVP, when the host is viewing the dashboard, then stats update within 5 seconds (polling interval)
- [ ] AC3: Given the host clicks "Dietary Restrictions", when the panel expands, then it shows a list of guest names and their dietary restrictions
- [ ] AC4: Given the host clicks "Export CSV", when the download completes, then the CSV file contains: name, email, phone, category, RSVP status, dietary restrictions, transport needs
- [ ] AC5: Given the host filters by "Pending", when the filter is applied, then only guests who haven't responded are displayed
- [ ] AC6: Given an event with no guests, when the dashboard loads, then the empty state "Add guests to get started" is shown

## Related Items
- **PRD section:** 06-mvp-features.md (6.1.3 Control Dashboard, US-CD-01 through US-CD-05, AC-CD-01 through AC-CD-05)
- **Architecture:** 02-components.md (Host Dashboard — Control dashboard)
- **Data model:** entities.md (Guests, Invitations, RSVPs)

## Blockers
Blocked by: PSRP-006, PSRP-008

## Branch Name
`feature/PSRP-009-control-dashboard`

(End of file - total 67 lines)