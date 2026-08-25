# US-2.3: Class Viewing & Cancellation

**Part of:** US-2.3 — Class Viewing & Cancellation
**Epic:** EP-02 — Core Scheduling Engine

## Tasks

- [ ] T-2.3.1: **Backend** — Implement `GET /classes` — required date range (start/end), optional filters (classType, coachId), pagination, role-scoped visibility (Admin/Coach: all classes; Coachee: filtered with visibility field)
- [ ] T-2.3.2: **Backend** — Implement `GET /classes/:id` — full details including enrolledCoachees, enrollmentCount, capacity, hasWaitingList, waitingListCount, recurrenceSeriesId; Coachee gets `coacheeStatus` (isEnrolled, isOnWaitingList, isWithinReach)
- [ ] T-2.3.3: **Backend** — Implement `DELETE /classes/:id` with `scope` query param: `"single"` (cancel one instance) or `"series"` (cancel all future instances), validate authorization (assigned Coach or Admin)
- [ ] T-2.3.4: **Backend** — Implement `DELETE /recurring-series/:id` — cancel entire series, mark all future instances as canceled (past unchanged), return canceledInstanceCount
- [ ] T-2.3.5: **Backend** — Implement class cancellation logic: set status="canceled", update/remove Google Calendar event, prepare notification triggers (wired in EP-04)
- [ ] T-2.3.6: **Frontend** — Build class list and class detail views for Admin/Coach roles with cancel action
