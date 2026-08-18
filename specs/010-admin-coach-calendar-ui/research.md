# Research: Admin/Coach Calendar UI

**Phase 0 output** for `specs/010-admin-coach-calendar-ui/` — design decisions for the frontend consolidation pass.

No technical unknowns remained after clarify (Q1:A color by class type, Q2:A modal creates blocks too), so this research document focuses on the **existing-code gap analysis** and the concrete choices the implementation will make.

## 1. Current state vs. spec (gap analysis)

Verified on branch `010-admin-coach-calendar-ui` from the committed US-2.2/2.3/2.4 frontend work:

| Spec requirement | Current state | Gap |
|---|---|---|
| Custom calendar component; no browser→Google API | `ClassCalendar.tsx` renders Schedule-X week view fed by `apiClient` (axios to `/api/v1/...`) | ✅ none — browser never calls Google |
| All classes from all Coaches, class-type color coding (Q1:A) | Classes colored by **level** – `toClassCalendarEvent` sets `levelColor`, `ClassEventBlock`/`MobileDayView` use `level?.color`. Also a Coach filter exists (admin-only) | ⚠️ color must switch to **class type** (individual vs group). Per-coach filter is an extra already present; spec anyway requires showing all classes. |
| Blocks (personal + gym-wide) on calendar | `toBlockCalendarEvent` + gray "Blocked" render from 009 work | ✅ none |
| "Add Class" button opens modal | `CreateClassModal` (Individual/Group only), separate "Add Block" button + `CreateBlockModal` | ⚠️ modal must offer **Individual / Group / Block** (PRD parity, Q2:A); remove the standalone block button/modal |
| Add Class modal shows available slots | `useAvailableSlots` renders selectable slot chips; manual time input also allowed | ✅ mostly — spec says restrict creation to slots; keep the manual-time fallback with backend conflict as the guard (FR-013) |
| Today page: vertical chronological list, individual vs group visually distinct, canceled gray + tag | `AdminTodayPage`/`CoachTodayPage` just render the week `ClassCalendar` | ⚠️ need a dedicated `TodayScheduleList` (chronological vertical list) |
| Canceled classes gray w/ "Canceled" tag | Canceled classes are dimmed with `opacity-60/70` but **no visible tag** | ⚠️ add a "Canceled" tag consistently (calendar + Today + mobile day view) |
| Responsive desktop + tablet | Desktop week grid; `useIsMobile` (<768px) switches to `MobileDayView`; tablet (≥768px) gets desktop layout | ✅ mostly — verify 768px (tailwind `md`) has no horizontal overflow |

## 2. Key design decisions

### D1 — Class-type color mapping (Q1:A)
- **Decision**: A stable `CLASS_TYPE_COLORS` map in `domain/utils/classCalendarEvents.ts` (pure): `INDIVIDUAL` → one color, `GROUP` → another. Canceled stays the agreed gray regardless of type.
- **Rationale**: Matches the clarified answer and the PRD's "two distinct background colors" for individual vs group; deterministic, testable, and independent of which Coach/level is involved.
- **Alternatives considered**: keep level colors (rejected — violates clarified Q1:A); per-Coach colors (rejected — large Coach base, no palette contract).
- **Consequence**: `levelColor` is removed from the calendar event derivation; level remains available on the entity for detail views only.

### D2 — Unified Add Class modal (Q2:A)
- **Decision**: `CreateClassModal` gains a third type option `BLOCK`. When selected, class-specific fields (coachee multi-select, level, recurrence, assigned coach) are replaced by the block fields currently in `CreateBlockModal` (block-type selector Personal/Gym-wide, coach picker for Admin personal blocks, start/end hour selects). `CreateBlockModal` is removed; both Calendar pages show a single "Add Class" button.
- **Rationale**: PRD parity (the modal lists Individual / Group / Block); one entry point reduces toolbar clutter and matches the clarified answer.
- **Alternatives considered**: keep two separate buttons/modals (rejected — contradicts Q2:A "modal offers Individual / Group / Block"); a shared sub-component extracted to avoid duplication.
- **Consequence**: reuses `useCreateBlock` and the block hour-select UX; keeps backend `POST /blocks` unchanged.

### D3 — Available slots constraint
- **Decision**: keep the existing slot-chip picker as the primary path, retaining the free-text time input protected by the backend conflict/overlap checks (FR-013). On a stale-slot reject, the modal preserves field values and refreshes available slots.
- **Rationale**: `GET /classes/available-slots` already computes capacity- and block-aware slots; forcing the picker alone would break recurrence "start date" flows and paste-in workflows without added safety (backend already guarantees correctness).
- **Alternatives considered**: slot-only picker (rejected — too rigid for weekly recurrence and existing test scenarios).

### D4 — Today list
- **Decision**: new `TodayScheduleList` component: fetches classes for today via `useListClasses({ start: today 00:00 gym, end: today 23:59 gym })`, sorts chronologically in the gym timezone (reuse `gymTodayDate`/`currentGymWeekBounds` pattern), renders each row with class-type color stripe, start time, coachee name(s)/group title, coach, and a gray "Canceled" tag when canceled; shows an empty state when none.
- **Rationale**: PRD §6.3 defines Today as a vertical chronological list with visual distinction; the existing `MobileDayView` is a time-grid, not the desktop "today list" the spec asks for.
- **Alternatives considered**: reuse `MobileDayView` for Today on desktop (rejected — it is an hourly grid, not the concise chronological list described); embed `ClassList` (rejected — that is a filterable management table with cancel actions, different semantics).
- **Consequence**: shared component used by both `AdminTodayPage` and `CoachTodayPage`.

### D5 — Canceled tag
- **Decision**: a small pill/label "Canceled" rendered on canceled class events in the week calendar, the Today list, and the mobile day view (reuse the existing `status === "CANCELED"` signal).
- **Rationale**: the spec and PRD both require a visible "Canceled" tag, not only dimming.
- **Alternatives considered**: tooltip-only (rejected — not discoverable in grid/timeline).

### D6 — Mobile/today scope
- **Decision**: desktop + tablet (the spec's responsive scope). `MobileDayView` is retained for <768px and updated for the new color map + Canceled tag, but building new mobile pages is out of scope (existing behavior preserved).
- **Rationale**: acceptance criteria name desktop and tablet only; the mobile day view already exists and just needs to stay consistent.

## 3. Test & validation strategy

- **Red-Green**: extend `classCalendarEvents.test.ts` first with the class-type color and canceled-tag expectations; they fail against the current level-color implementation, then pass after the change (Constitution §II).
- New pure util (if extracted): `todaySchedule.ts` chronological-ordering tests.
- Component behavior verified via `quickstart.md` manual scenarios (E2E harness not present in repo — no Playwright config today).
- Backend suites untouched; run frontend `npm run typecheck`, `npm run lint`, `npm test` and backend `npm run typecheck && npm test` as regression guards.

## 4. Risks / mitigations

- Schedule-X `customComponents` swaps the whole event element — keep `timeGridEvent` override intact while changing inner markup (risk: visual regression; mitigated by quickstart visual checks).
- Merging block creation into the class modal risks regressing block hour-select validation (end > start, GYM_WIDE admin-only); keep those rules verbatim when moving fields.
- Timezone correctness: reuse `toGymIsoDateTime`/`gymTodayDate` for the Today window so the "gym day" (Europe/Madrid) is used, not the browser-local day.
- No browser→Google API regression: the week grid/events remain fed exclusively from axios `apiClient` endpoints.