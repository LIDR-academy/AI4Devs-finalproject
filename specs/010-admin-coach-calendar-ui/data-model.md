# Data Model: Admin/Coach Calendar UI

**Phase 1 output** — entity/state model for the frontend consolidation pass. **No database changes** (backend Prisma schema untouched). All domain entities already exist in `frontend/src/domain/types/`; this document captures what the UI consumes and the pure derivation rules it adds.

## Entities

### Reused backend-mapped types (unchanged)

- **TrainingClass** (`domain/types/class.ts`) — the unit rendered on calendar slots and the Today list. Fields used by the UI: `id`, `classType` (`INDIVIDUAL | GROUP`), `assignedCoach`, `level` (nullable; level color is **detail-only**, not calendar background), `startTime` (ISO UTC), `durationMinutes` (always 60), `status` (`ACTIVE | CANCELED`), `enrolledCoachees`, `enrollmentCount`, `capacity`, `isRecurring`, `hasWaitingList`, `waitingListCount`.
- **Block** (`domain/types/block.ts`) — rendered as blocked regions on the calendar. Fields used: `id`, `blockType` (`PERSONAL | GYM_WIDE`), `createdBy`, `coach` (nullable; present only for PERSONAL), `startTime`, `endTime`, `description`.
- **AvailableSlot** (`domain/types/class.ts`) — model values offered in the Add Class modal for a selected date/coach/classType. Fields: `start` (`HH:mm` gym wall-clock hour), `end`, `capacityAvailable` (`individual | group | both`).
- **Coach / Coachee / Level** — reference data for the modal's selects (assignable coaches, coachee multi-select with level badges) and event sub-labels.

### New derivation (pure domain utils)

No new persisted entities. Two pure derivation rules are added to `domain/utils/classCalendarEvents.ts`:

### CLASS_TYPE_COLORS

| Class type | Calendar cell color |
|------------|---------------------|
| `INDIVIDUAL` | stable color A (individual) |
| `GROUP` | stable color B (group) |
| `CANCELED` (any type) | stable gray — overrides type color |

- Exposed as a plain exported record so the UI (week grid, Today list, mobile day view) and unit tests share one source of truth.
- `level.color` is **not** used as the calendar cell background (per clarified Q1:A); it remains available for level badges in detail/modal surfaces.

### toClassCalendarEvent (modified output)

`CalendarEventExternal` for a class now carries a type-derived `backgroundColor` (or an explicit `kind`/`status` the renderer uses to pick gray when `CANCELED`), replacing the current `levelColor` usage. Fields preserved for renderers: `id`, `title` (keeps the individual = "coachee name", group = "Group class - level" convention), `start`/`end` in gym timezone, `classType`, `status`, `coachName`, `isRecurring`, `enrollmentCount`, `capacity`.

## State transitions

- **Class**: `ACTIVE ⇄ CANCELED` (existing backend lifecycle; CANCELED is terminal). UI renders CANCELED in gray with a "Canceled" tag and never offers the original slot as available.
- **Block**: `ACTIVE ⇄ CANCELED` (existing 009 lifecycle). Canceled blocks are excluded server-side from `GET /blocks` and availability; the calendar only ever receives active blocks.
- **Modal type selector**: `INDIVIDUAL | GROUP | BLOCK` — class fields shown for the first two; block-specific fields (block-type selector, coach-for-Admin, hour-aligned start/end, description) shown for BLOCK. Selecting BLOCK removes coachee/level/coach/recurrence class fields.

## Validation rules surfaced by the UI (enforced by existing backend)

- Individual class: exactly 1 coachee required; Group: 3–4 coachees required + level required.
- Block: hour-aligned start/end, ≥ 1 hour, `end > start`; personal block → own calendar (Coach) or any active Coach (Admin); gym-wide → Admin only.
- Slot conflict (FR-013): on `409`-style reject, modal keeps entries and refreshes available slots.
- Class duration always 60 minutes (domain invariant; not user-editable).

## Relations

- `TrainingClass` → `assignedCoach: Coach`, `level: Level?` (group), `enrolledCoachees: Coachee[]`.
- `Block → coach: Coach?` (PERSONAL only), `createdBy: User`.
- `AvailableSlot` is transient (computed per request for a date + coach + classType).

## Scale assumptions

Single gym, a handful of Coaches, low weekly volume. Week payloads fetched with `limit:100`; Today list fetches a single gym-day window. No pagination changes.