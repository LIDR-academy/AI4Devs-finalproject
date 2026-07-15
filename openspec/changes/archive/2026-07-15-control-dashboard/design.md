## Context

Event organizers need a consolidated view to monitor their event's attendance and special requirements. Currently, we have endpoints for guests, invitations, and RSVPs, but no aggregated views.

## Goals / Non-Goals

**Goals:**
- Provide real-time aggregated RSVP statistics.
- Provide lists of specific guest requirements (dietary, transport).
- Allow exporting guest data to CSV.

**Non-Goals:**
- Real-time updates via WebSockets/SignalR (MVP will use polling).
- Complex analytics or historical trend graphs.

## Decisions

- **Architecture:** We will implement a new `DashboardController` in the backend returning a combined `DashboardStatsResponse` DTO to minimize API calls from the frontend.
- **Real-time updates:** We will use 5-second polling on the frontend via RxJS `interval(5000)` combined with `switchMap` instead of WebSockets. *Rationale:* Simpler implementation for MVP, meets the near real-time requirement without adding infrastructure complexity.
- **CSV Export:** Use `CsvHelper` in the backend to generate the CSV directly and return it as a file download. *Rationale:* Easier to handle encoding and formatting consistently on the server than building the CSV string on the client.
- **UI Components:** We will leverage the existing Angular component library for stats cards and data tables.

## Risks / Trade-offs

- **Risk:** Database load from polling. → **Mitigation:** The polling interval is 5 seconds per active dashboard client. Since this is an MVP with expected low concurrent users per event, standard aggregate queries should be sufficient. We can add caching or switch to SignalR in V2.
