# US-3.3: Waiting List Join/Leave

**Part of:** US-3.3 — Waiting List Join/Leave
**Epic:** EP-03 — Coachee Self-Service

## Tasks

- [ ] T-3.3.1: **Backend** — Implement `POST /classes/:id/waiting-list` — Coachee joins waiting list, validate: Coachee role, class exists, not already enrolled, not already on list, waiting list not full (max 4), level reach
- [ ] T-3.3.2: **Backend** — Implement `DELETE /classes/:id/waiting-list` — Coachee leaves waiting list, validate: Coachee identity matches entry
- [ ] T-3.3.3: **Backend** — Implement `GET /waiting-lists` — return all active waiting lists for authenticated Coachee with class details and hasOpenSpots flag
- [ ] T-3.3.4: **Frontend** — Build "Join waiting list" button on full green group classes with confirmation flow
- [ ] T-3.3.5: **Frontend** — Build waiting list management section showing all active lists with class info, hasOpenSpots indicator, and "Leave" option
- [ ] T-3.3.6: **Frontend** — Build gray busy block tap flow: tap → modal with "Join waiting list for this time slot" option

---

