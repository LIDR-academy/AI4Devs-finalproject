# US-2.1: Google Calendar as Scheduling Engine

**Part of:** US-2.1 — Google Calendar as Scheduling Engine
**Epic:** EP-02 — Core Scheduling Engine

## Tasks

- [ ] T-2.1.1: **Infrastructure** — Set up Google Cloud project, enable Calendar API, create Service Account with private key, create private system calendar, configure env vars
- [ ] T-2.1.2: **Backend** — Define `CalendarProvider` port interface in domain layer (`createEvent`, `updateEvent`, `deleteEvent`, `getFreeBusy`) using domain types
- [ ] T-2.1.3: **Backend** — Implement `GoogleCalendarAdapter` — OAuth2 Service Account auth via `google-auth-library`, event CRUD using REST API v3, `getFreeBusy` query
- [ ] T-2.1.4: **Backend** — Implement error handling and retry logic for Calendar API calls, log duration + status for every request, map failures to 503 with unique error ref
- [ ] T-2.1.5: **Backend** — Implement `GET /classes/available-slots` — query free/busy for date + coach, factor in gym capacity (2 individual + 1 group per hour), return structured available slots
- [ ] T-2.1.6: **Backend** — Wire `CalendarProvider` via dependency injection (config module), ensure all class/block mutations create/update/delete Google Calendar events
