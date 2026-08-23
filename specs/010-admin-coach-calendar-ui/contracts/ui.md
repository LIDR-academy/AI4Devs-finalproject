# UI Contracts: Admin/Coach Calendar UI

**Phase 1 output** — frontend component/behavior contracts for this feature. This is a frontend-only feature: the HTTP contracts it consumes are unchanged and documented in `docs/api-specifications.md` (authoritative). The contracts below define the UI surface the feature delivers so implementation and validation are unambiguous.

## Consumed API endpoints (unchanged, documented in `docs/api-specifications.md`)

- `GET /api/v1/classes?start&end&classType?&coachId?&page&limit` → `{ data: TrainingClass[], meta }`
- `GET /api/v1/blocks?start&end&blockType?&page&limit` → `{ data: Block[], meta }` (ACTIVE only)
- `GET /api/v1/classes/available-slots?date&coachId&classType` → `{ date, coachId, availableSlots: [{ start, end, capacityAvailable }] }`
- `GET /api/v1/classes/assignable-coaches` → `{ data: [{ id, name }] }`
- `GET /api/v1/coachees?status=active&...` → `{ data: Coachee[], meta }`
- `POST /api/v1/classes` — create individual/group class (incl. recurrence)
- `POST /api/v1/blocks` — create personal/gym-wide block
- All authenticated (JWT from `apiClient`); errors use `{ error: { code, message, ref } }`.

## Shared component contracts (frontend)

### `ClassCalendar({ onAddClass?: () => void })`
- Renders Schedule-X **week view** for admin and coach; all classes from all Coaches (per-Coach filter stays an available extra on admin).
- Events merged from `useListClasses({ start: weekStart 00:00 gym, end: weekEnd 23:59 gym, limit: 100 })` and `useListBlocks(...)`.
- Each class event: background = class-type color (individual vs group); **canceled** = gray + visible "Canceled" tag. Block events: gray/hatched "Blocked" region visually distinct from classes.
- Click class → `ClassDetailView`; click block → `BlockDetailView`.
- Week navigation via Schedule-X `onRangeUpdate` re-fetch; no direct external-scheduling-service calls from browser.
- Responsive: `useIsMobile()` (<768px) → `MobileDayView`; else desktop grid. Tablet (≥768px) uses the desktop layout without horizontal scrolling.

### `CreateClassModal({ open, onClose, onSuccess })` — **unified modal (Q2:A)**
- Type selector: `INDIVIDUAL | GROUP | BLOCK`.
  - `INDIVIDUAL`: exactly 1 coachee; hides level.
  - `GROUP`: 3–4 coachees; level required; recurrence toggle available.
  - `BLOCK`: replaces class fields with block fields (block-type selector `PERSONAL | GYM_WIDE`, coach picker for Admin personal blocks, hour-aligned start/end selects, description). Class fields hidden. GYM_WIDE offered to Admin only; Coach sees only PERSONAL.
- Assigned Coach defaults to creating user; selectable to any active assignable coach (INDIVIDUAL/GROUP only).
- Date chosen → available slots from `GET /classes/available-slots` rendered as selectable chips; slot selection fills start time; free-text time input retained as fallback.
- Save → `POST /classes` or `POST /blocks` via existing `useCreateClass`/`useCreateBlock`; on success, closes and invalidates `classes`/`blocks` queries so the calendar/Today update immediately (no full page reload).
- On stale-slot/conflict reject: keep all field values, show clear error message, refresh available slots (FR-013).
- Role-aware: Coach cannot create GYM_WIDE; errors are user-friendly, no internals.

### `TodayScheduleList()` — **new, shared by admin & coach Today pages**
- Fetches today's classes: `useListClasses({ start: <today> 00:00 gym, end: <today> 23:59 gym, limit: 100 })`.
- Renders a vertical, chronological-by-start-time list (gym timezone ordering).
- Each row: class-type color stripe, start time, coachee name(s)/group title, assigned coach, individual/group label (visual distinction), and for canceled classes a gray row with a visible "Canceled" tag.
- Empty state when no classes today (FR-018).
- Click row → `ClassDetailView`.

## Removed surface

- `CreateBlockModal` deleted (subsumed by the unified `CreateClassModal` BLOCK type).
- Standalone "Add Block" buttons removed from admin/coach `CalendarPage`; single "Add Class" button remains.

## Layout contract (desktop + tablet)

- 1280px and 768px viewports: calendar grid, Today list, and Add Class modal fully visible/usable **without horizontal scrolling**.
- `MobileDayView` (<768px) retained and kept consistent (class-type color + Canceled tag).