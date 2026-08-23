# US-4.5: In-App Notification Center

**Part of:** US-4.5 — In-App Notification Center
**Epic:** EP-04 — Notifications & Automation

## Tasks

- [ ] T-4.5.1: **Backend** — Implement `GET /notifications` — paginated, role-scoped visibility (Admin/Coach: current day only; Coachee: full history ordered by sentAt desc), optional `unreadOnly` filter
- [ ] T-4.5.2: **Backend** — Implement `PATCH /notifications/:id/read` — mark notification as read, validate recipient matches authenticated user
- [ ] T-4.5.3: **Frontend** — Build notification bell icon component with unread count badge (poll or real-time updates)
- [ ] T-4.5.4: **Frontend** — Build notification dropdown panel for Admin/Coach (shows current day's notifications only)
- [ ] T-4.5.5: **Frontend** — Build notification full-screen list for Coachee (shows full chronological history)
- [ ] T-4.5.6: **Frontend** — Implement mark-as-read on notification click/tap, navigate to relevant class detail when applicable
- [ ] T-4.5.7: **Frontend** — Handle empty state ("No notifications"), loading, and error states

---

