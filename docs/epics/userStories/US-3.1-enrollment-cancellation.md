# US-3.1: Class Enrollment & Cancellation

**Part of:** US-3.1 — Class Enrollment & Cancellation
**Epic:** EP-03 — Coachee Self-Service

## Tasks

- [ ] T-3.1.1: **Backend** — Implement `POST /classes/:id/enrollment` — Coachee joins group class, validate capacity (not full), level reach, overlap, not already enrolled, Coachee role only
- [ ] T-3.1.2: **Backend** — Implement `DELETE /classes/:id/enrollment` — Coachee cancels own attendance, remove ClassEnrollment, prepare waiting list trigger (wired in EP-04)
- [ ] T-3.1.3: **Backend** — Implement validation error responses: CLASS_FULL (4/4), LEVEL_MISMATCH (outside ±1), OVERLAP_DETECTED, ALREADY_ENROLLED, FORBIDDEN (non-Coachee)
- [ ] T-3.1.4: **Frontend** — Build "Join" button on class cards (green classes) with confirmation dialog and success/error feedback
- [ ] T-3.1.5: **Frontend** — Build "Cancel" button on enrolled class cards with confirmation dialog
- [ ] T-3.1.6: **Frontend** — Handle error responses with user-friendly toasts (e.g., "Class is full", "Level mismatch — this class requires a different level")

---

