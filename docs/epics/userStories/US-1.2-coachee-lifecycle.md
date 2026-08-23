# US-1.2: Coachee Lifecycle Management

**Part of:** US-1.2 — Coachee Lifecycle Management
**Epic:** EP-01 — Auth & User Foundation

## Tasks

- [ ] T-1.2.1: **Backend** — Implement `POST /coachees` — validate input (name, email, phone, classTypePreference, levelId), check email uniqueness, create user with role=coachee, return 201 (no password in response)
- [ ] T-1.2.2: **Backend** — Implement `GET /coachees` — paginated list with multi-select filters (status, levelId), exclude financial fields, return `{ data, meta }` envelope
- [ ] T-1.2.3: **Backend** — Implement `GET /coachees/:id` (full profile) and `PUT /coachees/:id` (partial update) with email uniqueness check
- [ ] T-1.2.4: **Backend** — Implement `PATCH /coachees/:id/status` (activate/deactivate, Admin only) and `PATCH /coachees/:id/level` (change level, Admin/Coach, wire notification trigger)
- [ ] T-1.2.5: **Frontend** — Build Coachees page: table with columns (Name, Email, Phone, Class Type, Status), pagination, multi-select filters (status, level), three-dot action menu (Activate/Deactivate)
- [ ] T-1.2.6: **Frontend** — Build Add Coachee modal with form fields, level selector, validation, and save flow
- [ ] T-1.2.7: **Frontend** — Build Coachee detail view and inline level change UI
