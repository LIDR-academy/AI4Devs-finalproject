# US-2.2: Class Creation (Individual, Group, Recurring)

**Part of:** US-2.2 — Class Creation (Individual, Group, Recurring)
**Epic:** EP-02 — Core Scheduling Engine

## Tasks

- [x] T-2.2.1: **Backend** — Implement `POST /classes` for individual class: validate exactly 1 Coachee, assigned coach, gym capacity (max 2 individual concurrent), overlap check, duration 60 min, create Class + ClassEnrollment, create Google Calendar event
- [x] T-2.2.2: **Backend** — Implement `POST /classes` for group class: validate min 3 max 4 Coachees, required level, gym capacity (max 1 group concurrent), overlap check for all Coachees, level reach validation
- [x] T-2.2.3: **Backend** — Implement recurring series: when `recurrence.enabled=true`, create `RecurrenceSeries` record and generate weekly `TrainingClass` instances (same day/time/level/coach/type, no auto end date)
- [x] T-2.2.4: **Backend** — Implement domain validators as pure functions: `CapacityValidator` (gym + class level), `OverlapChecker` (Coachee + Coach), `ReachCalculator` (level within ±1)
- [x] T-2.2.5: **Backend** — Integrate Google Calendar event creation into class creation flow (event title: coachee name + level for individual, "Group class" + level for group; description includes coach, recurrence status, notes, and enrolled coachees for group)
- [x] T-2.2.6: **Frontend** — Build Add Class modal with conditional field logic: class type toggle hides/shows fields, Coachee multi-select, Coach dropdown, level selector, date/time picker
- [x] T-2.2.7: **Frontend** — Build available time slots display in Add Class modal (fetched from `GET /classes/available-slots`, selectable)
- [x] T-2.2.8: **Frontend** — Build recurrence toggle UI with day-of-week and start-date selectors
