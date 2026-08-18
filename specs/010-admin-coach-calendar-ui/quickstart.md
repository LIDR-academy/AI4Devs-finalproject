# Quickstart — Admin/Coach Calendar UI

**Phase 1 output** — runnable validation guide proving the feature works end-to-end. Implementation details live in `tasks.md` and the implementation phase; this guide only describes how to run and check the result.

## Prerequisites

- PostgreSQL running (local Postgres or `docker compose up db`), backend migrated & seeded
- Google Calendar Service Account key available (`backend/secrets/coacher-calendar-sa-key.json`) for real slots/calendar behavior — without it, run backend tests for the degraded 503 paths only
- Node 22 + npm

## Setup commands

```bash
# Backend (port 3001)
cd backend && npm install && npm run db:generate && npm run db:migrate && npm run db:seed && npm run dev

# Frontend (port 5173, proxies /api to localhost:3001)
cd frontend && npm install && npm run dev
```

Log in with an Admin and a Coach account (existing seed/created users), plus a Coachee (to enroll in classes).

## Functional validation scenarios

### S1 — Week calendar shows all classes + color coding (US-1)
1. Create at least one individual and one group class assigned to **different Coaches** on the current week (via `POST /classes` or the UI modal).
2. As Admin, open **Calendar** (`.md:flex` desktop width, e.g. 1280px).
3. **Expect**: both classes render in their day/1-hour slot; individual and group cells use **different colors** (class-type colors); label shows coachee name (individual) / "Group class - <level>" (group); all Coaches' classes are visible.
4. Add a personal block and a gym-wide block for this week (`POST /blocks`). **Expect**: gray "Blocked" regions distinct from classes, shown on every day they cover.
5. Navigate previous/next week. **Expect**: that week's classes/blocks reload correctly.

### S2 — Canceled class is gray with "Canceled" tag (US-1/US-3)
1. Cancel one class via `DELETE /classes/:id` (or the detail view).
2. **Expect** on the week calendar **and** on the Today list: the canceled slot is gray with a visible **"Canceled"** tag, still positioned at its original time; its original time is never offered as an available slot in the modal.

### S3 — Add Class modal creates classes AND blocks (US-2)
1. Click **Add Class** (single button).
2. Choose **Individual**: date → available slots appear (only selectable slots offered); pick one Coachee (exactly 1 required); Assigned Coach defaults to you; Save. **Expect**: the class appears on the calendar immediately (no reload).
3. Open the modal again, choose **Group**, select 3–4 coachees + level; Save. **Expect**: validation enforced (0–2 coachees or missing level → clear error, nothing created).
4. Open the modal again, choose **Block** → class fields disappear; pick **Personal** (Coach: your own calendar; Admin: any coach) with hour-aligned start/end; Save. **Expect**: gray blocked region appears.
5. As Admin choose **Block → Gym-wide**; Save. **Expect**: gym-wide region appears. As a **Coach**, **Gym-wide must not be selectable**.

### S4 — Stale slot conflict (FR-013)
1. Open the modal, pick a date+slot; before saving, create a second class in that slot from another session/modal.
2. Save the first. **Expect**: clear conflict error, modal **stays open with values intact**, and refreshed available slots no longer show the taken slot.

### S5 — Today page vertical list (US-3)
1. Schedule several classes today at different times (both types, incl. one then canceled).
2. Open **Today** (Admin and Coach).
3. **Expect**: a vertical chronological list ordered by start time; individual vs group visually distinct; canceled row gray with "Canceled" tag; empty state message on a day with no classes.

### S6 — Responsive desktop + tablet (US-4)
1. At 1280px and 768px widths, open Calendar and Today.
2. **Expect**: no horizontal scrolling; classes, blocks, and the Add Class modal fully reachable on both widths.

### S7 — No browser→Google Calendar calls
1. Open devtools → Network while loading Calendar and the modal's slots.
2. **Expect**: zero requests to `calendar.google.com`/Google APIs; all payloads come from `/api/v1/*` (classes, blocks, available-slots).

## Automated checks

```bash
# Frontend unit tests — class-type color mapping, Today ordering (Red-Green per Constitution §II)
cd frontend && npm run typecheck && npm run lint && npm test

# Backend regression guard (unchanged suites)
cd backend && npm run typecheck && npm run lint && npm test
```

**Expected outcome**: all new/extended frontend unit tests pass (class-type colors; canceled => gray; Today chronological ordering); backend suites still green (no backend changes).

## Reference

- Entities & derivation rules: `data-model.md`
- Component/API contracts: `contracts/ui.md`
- HTTP contracts: `docs/api-specifications.md` (authoritative)