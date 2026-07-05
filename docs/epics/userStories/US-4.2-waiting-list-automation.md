# US-4.2: Waiting List Automation

**Part of:** US-4.2 — Waiting List Automation
**Epic:** EP-04 — Notifications & Automation

## Tasks

- [ ] T-4.2.1: **Backend** — Implement `ProcessWaitingListService` domain service: when enrollment is canceled, check if waiting list exists, notify all waitlisted Coachees simultaneously (#1), enroll first responder first-come-first-served
- [ ] T-4.2.2: **Backend** — Integrate waiting list processing into class cancellation (DELETE /classes/:id) and enrollment cancellation (DELETE /classes/:id/enrollment) flows
- [ ] T-4.2.3: **Backend** — Implement notification #1: "¡Hay hueco(s) libre(s) en [clase/nivel]! Corre a reservarlo." — sent to all waitlisted Coachees simultaneously
- [ ] T-4.2.4: **Backend** — Implement notification #4 (group cancel with waiting list → Coach): "[Coachee] canceló. Se ha notificado a [N] coache(s) en waiting list." and notification #5 (group cancel without waiting list → Coach): "[Coachee] canceló. El hueco está libre." — mutually exclusive
- [ ] T-4.2.5: **Backend** — Implement notification #6 (spot claimed → Coach): "[Coachee] ha ocupado el hueco libre en [clase/hora]"
- [ ] T-4.2.6: **Backend** — Implement notification #9 (waiting list join → Coachee): "Te has apuntado a la waiting list de [clase/hora]." and #10 (waiting list leave → Coachee): "Has salido de la waiting list de [clase/hora]"

---

