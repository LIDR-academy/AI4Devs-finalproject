# US-3.2: Coachee Dashboard & Calendar

**Part of:** US-3.2 — Coachee Dashboard & Calendar
**Epic:** EP-03 — Coachee Self-Service

## Tasks

- [ ] T-3.2.1: **Backend** — Implement `GET /coachee/dashboard` — return nextClass (soonest future enrolled class or null), joinableClasses (10-day window, group within reach with open spots), activeWaitingListCount
- [ ] T-3.2.2: **Frontend** — Build home screen: next class widget at top (or "No upcoming classes" message), joinable classes list below with join buttons
- [ ] T-3.2.3: **Frontend** — Build 1-week calendar view with color-coded visibility: blue (own, tap to cancel), green (joinable, tap to join), gray (busy, tap to waitlist)
- [ ] T-3.2.4: **Frontend** — Implement visibility logic based on server-provided `visibility` field per class
- [ ] T-3.2.5: **Frontend** — Implement loading skeletons, empty states, and pull-to-refresh on mobile
- [ ] T-3.2.6: **Frontend** — Show active waiting list count on home screen

---

