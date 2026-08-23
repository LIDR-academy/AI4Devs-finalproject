# US-2.4: Calendar Block Management

**Part of:** US-2.4 — Calendar Block Management
**Epic:** EP-02 — Core Scheduling Engine

## Tasks

- [ ] T-2.4.1: **Backend** — Implement `POST /blocks` — validate blockType (personal/gym-wide), enforce role rules (Coach: personal only, must be self; Admin: personal any coach + gym-wide), hour alignment, create block + Google Calendar event
- [ ] T-2.4.2: **Backend** — Implement `GET /blocks` — required date range (start/end), optional blockType filter, return blocks with creator and coach info
- [ ] T-2.4.3: **Backend** — Implement `DELETE /blocks/:id` — validate authorization (Admin: any; Coach: own personal only), remove Google Calendar event, return status
- [ ] T-2.4.4: **Backend** — Implement overlap validation for blocks: check against existing classes and blocks for the affected coach or gym
- [ ] T-2.4.5: **Backend** — Integrate Google Calendar event into block create/delete flow and ensure blocks affect available slots calculation
