---

description: "Task list for Admin/Coach Calendar UI (US-2.5, COACHER-20)"
---

# Tasks: Admin/Coach Calendar UI

**Input**: Design documents from `/specs/010-admin-coach-calendar-ui/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/ui.md, quickstart.md

**Tests**: The constitution (Constitution §II Test-First) requires Red-Green for domain logic; the plan (research D1/D4) expressly calls out the failing-first tests below. Test tasks are therefore included for the pure domain utils only; component behavior is validated via `quickstart.md` scenarios.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. Stories share one foundational slice (the class-type color map in `domain/utils/classCalendarEvents.ts`).

**Context**: This feature is a frontend-only consolidation/polish pass over already-committed US-2.2/2.3/2.4 work. All backend endpoints, DTOs, and React Query hooks already exist and are reused as-is. No schema, no API, no backend changes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Frontend: `frontend/src/` (this feature is frontend-only)
- Backend: `backend/src/` (untouched — used only for regression guards)

---

## Phase 1: Setup (Baseline Verification)

**Purpose**: Confirm the committed frontend/backend state is green before making changes, so failures during implementation are attributable to this feature.

- [X] T001 [P] Run `npm run typecheck && npm run lint && npm test` in `frontend/` and record baseline result (expected: green)
- [X] T002 [P] Run `npm run typecheck && npm run lint && npm test` in `backend/` as a regression guard (expected: green, unchanged by this feature)

---

## Phase 2: Foundational (Shared Blocking Prerequisites)

**Purpose**: The class-type color map (clarified Q1:A) and the modified calendar-event derivation are shared by US1 (week grid), US3 (Today list), and US4 (mobile day view). Must complete before any user story.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

### Tests for Foundational (Red first — Constitution §II)

- [X] T003 [P] Add failing tests in `frontend/src/domain/utils/classCalendarEvents.test.ts` asserting: `toClassCalendarEvent` yields a class-type-derived cell color (individual ≠ group), canceled classes resolve to the gray color, and `levelColor` is no longer used as the calendar cell color. Confirm these tests FAIL against the current implementation.

### Implementation for Foundational

- [X] T004 Implement the `CLASS_TYPE_COLORS` record (INDIVIDUAL / GROUP stable colors) in `frontend/src/domain/utils/classCalendarEvents.ts` and update `toClassCalendarEvent` to expose a class-type-based color (canceled → gray override); keep level data on the entity for detail views only. Make T003 pass.

**Checkpoint**: Foundation ready — user story implementation can now begin in parallel.

---

## Phase 3: User Story 1 - View the weekly calendar with all classes and blocks (Priority: P1) 🎯 MVP

**Goal**: The week grid renders all classes from all Coaches color-coded by class type, active personal/gym-wide blocks as gray "Blocked" regions, canceled classes in gray with a visible "Canceled" tag, and never contacts the external scheduling service from the browser.

**Independent Test**: quickstart.md **S1** (calendar shows all classes, type colors, blocks, week nav) + **S2** (canceled gray + tag) + **S7** (zero browser→Google Calendar calls).

### Implementation for User Story 1

- [X] T005 [US1] Update `ClassEventBlock` in `frontend/src/ui/components/ClassCalendar.tsx` to color class cells by the class-type color map and render a visible "Canceled" tag (pill) inside the cell when `status === "CANCELED"` (gray background override), reusing the existing Schedule-X `timeGridEvent` custom component override without regressing block rendering.
- [X] T006 [US1] Verify (no code change expected) that calendar data is sourced exclusively through `useListClasses`/`useListBlocks`/`apiClient` in `frontend/src/ui/components/ClassCalendar.tsx` and that blocks + week navigation already work per contracts/ui.md S1; fix only if the audit finds a leaked direct external-scheduling-service call.

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently.

---

## Phase 4: User Story 2 - Create a class or block from the Add Class modal (Priority: P1)

**Goal**: A single "Add Class" modal offers Individual / Group / Block (clarified Q2:A). Class fields adapt per type; selecting Block swaps to block fields (Personal/Gym-wide, Gym-wide Admin-only). Available slots are shown for the date and only genuine slots are proposed; stale-slot conflicts keep user entries and refresh slots.

**Independent Test**: quickstart.md **S3** (modal creates classes AND blocks) + **S4** (stale-slot conflict behavior).

### Implementation for User Story 2

- [X] T007 [P] [US2] Add the `BLOCK` option to the type selector in `frontend/src/ui/components/CreateClassModal.tsx` so the modal offers Individual / Group / Block (PRD parity per clarified Q2:A).
- [X] T008 [US2] Integrate block creation fields into `frontend/src/ui/components/CreateClassModal.tsx` (block-type selector Personal/Gym-wide — Gym-wide offered only to Admins via the existing `useAuth`/role check — coach picker for Admin personal blocks, hour-aligned start/end hour selects, description), calling the existing `useCreateBlock` hook; hide the class-specific fields (coachees, level, assigned coach, recurrence) when Block is selected. Preserve the existing end>start + 1-hour-minimum rules.
- [X] T009 [P] [US2] Remove `frontend/src/ui/components/CreateBlockModal.tsx` and delete the standalone "Add Block" buttons in `frontend/src/ui/pages/admin/CalendarPage.tsx` and `frontend/src/ui/pages/coach/CalendarPage.tsx`, leaving a single "Add Class" button. (Depends on T008.)
- [X] T010 [US2] In `frontend/src/ui/components/CreateClassModal.tsx`, on a stale-slot/conflict error (FR-013), keep all field values, show the backend error message, and refresh the available slots so the taken slot no longer appears.

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently.

---

## Phase 5: User Story 3 - View today's schedule as a chronological list (Priority: P2)

**Goal**: A dedicated Today page shows today's classes as a vertical chronological list (gym-timezone ordering) with individual/group visual distinction (class-type color), canceled rows gray with a "Canceled" tag, and an empty state when there are no classes.

**Independent Test**: quickstart.md **S5** (Today vertical list) + **S2** (canceled tag on Today).

### Tests for User Story 3 (Red first — Constitution §II)

- [X] T011 [P] [US3] Add failing tests in `frontend/src/domain/utils/todaySchedule.test.ts` asserting chronological ordering of classes by gym-timezone start time and stable output for empty input. Confirm they FAIL before the util exists.

### Implementation for User Story 3

- [X] T012 [US3] Add the pure ordering helper in `frontend/src/domain/utils/todaySchedule.ts` (sort by `startTime` as gym-timezone wall-clock) to make T011 pass.
- [X] T013 [US3] Create `frontend/src/ui/components/TodayScheduleList.tsx`: fetch today's classes via `useListClasses` (start `today 00:00` / end `today 23:59` gym timezone using `gymTodayDate`/`toGymIsoDateTime`), render rows chronologically with class-type color stripe, start time, coachee name(s)/group title, assigned coach, visual distinction between individual and group, gray + "Canceled" tag for canceled rows, and an empty-state message when none.
- [X] T014 [US3] Wire `TodayScheduleList` into `frontend/src/ui/pages/admin/TodayPage.tsx` and `frontend/src/ui/pages/coach/TodayPage.tsx`, replacing the current `<ClassCalendar />` rendering.

**Checkpoint**: User Story 3 should be independently functional.

---

## Phase 6: User Story 4 - Responsive layout for desktop and tablet (Priority: P3)

**Goal**: Calendar, Today list, and the Add Class modal are fully usable on 1280px and 768px viewports without horizontal scrolling; the tablet (≥768px) layout uses the desktop grid; the mobile (<768px) day view stays consistent with the new colors and canceled tag.

**Independent Test**: quickstart.md **S6** (no horizontal scroll at 1280/768) + **S1** (desktop calendar) + **S5** (Today).

### Implementation for User Story 4

- [X] T015 [P] [US4] Update `frontend/src/ui/components/MobileDayView.tsx` to use the class-type color map (individual vs group) and render a visible "Canceled" tag for canceled classes, keeping the existing hourly grid behavior for <768px.
- [X] T016 [US4] Verify Tablet (768px) and desktop (1280px) layouts in `frontend/src/ui/components/ClassCalendar.tsx`, `frontend/src/ui/components/TodayScheduleList.tsx`, and `frontend/src/ui/components/CreateClassModal.tsx`; fix any horizontal overflow discovered (Tailwind responsive classes only, no layout redesign).

**Checkpoint**: All user stories should now be independently functional.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements and validation that affect multiple user stories.

- [X] T017 [P] Update `docs/api-specifications.md` only if the unified modal changes any documented consumer note (expected: no endpoint contract change; add a doc note that the Add Class modal offers Individual/Group/Block if the doc mentions UI behavior).
- [X] T018 [P] Remove dead references: confirm no remaining imports of `CreateBlockModal` in `frontend/src/` after T009 (grep + typecheck).
- [X] T019 Run full frontend gates `npm run typecheck && npm run lint && npm test` in `frontend/`.
- [X] T020 [P] Run backend regression gates `npm run typecheck && npm run lint && npm test` in `backend/`.
- [X] T021 Run quickstart.md validation scenarios S1–S7 and record results; fix any failure found in the affected component.
- [X] T022 Final review against spec.md acceptance scenarios (US1–US4) and Constitution checklist `specs/010-admin-coach-calendar-ui/checklists/requirements.md`; confirm no spec regression.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately (T001, T002 in parallel)
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational (T003/T004) completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Foundational (T003/T004) → T005, T006. No story-to-story deps.
- **User Story 2 (P1)**: Foundational → T007 → T008 → T009, T010. Independent of US1 (different components; both read the same color map).
- **User Story 3 (P2)**: Foundational → T011 → T012 → T013 → T014. Independent of US1/US2.
- **User Story 4 (P3)**: Foundational → T015 depends on the color map; T016 depends on US1/US3 components.

### Within Each User Story

- Tests (where included) MUST be written and FAIL before implementation
- Domain-utils first, then components, then page wiring
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- T001 ‖ T002 (Phase 1)
- T003 ‖ (independent; red-first gate before T004)
- Once Foundational is done: US1 ‖ US2 ‖ US3 can run in parallel
- T007 ‖ T009 (different files) after T008's field integration is understood; T010 follows T008
- T011 ‖ (red-first gate before T012)
- T015 ‖ T016 (different files)
- Polish: T017 ‖ T018 ‖ T020

---

## Parallel Example: User Story 2

```bash
# Launch the shared modal-field integration first (cannot be parallelized with T007 - same file):
Task: "Add the BLOCK option to the type selector in frontend/src/ui/components/CreateClassModal.tsx"
Task: "Integrate block creation fields into frontend/src/ui/components/CreateClassModal.tsx"

# Once T007+T008 are done, these two run in parallel (different files):
Task: "Remove frontend/src/ui/components/CreateBlockModal.tsx and drop the Add Block buttons in both CalendarPage.tsx files"
Task: "Add stale-slot conflict handling (keep fields + refresh slots) in CreateClassModal.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (T001, T002)
2. Complete Phase 2 (T003, T004) — sets the class-type color map shared by all stories
3. Complete Phase 3 (T005, T006)
4. **STOP and VALIDATE**: run quickstart S1/S2/S7 against the calendar
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → color map green (Red-Green)
2. User Story 1 → validate → (MVP!)
3. User Story 2 → unified modal → validate S3/S4
4. User Story 3 → Today list → validate S5/S2
5. User Story 4 → responsive pass → validate S6
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2 (needs care — T007/T008/T010 share `CreateClassModal.tsx` with no other story)
   - Developer C: User Story 3
   - Developer D can start User Story 4's T015 immediately after Foundational
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to a specific user story for traceability
- Each user story is independently completable and testable
- Verify tests fail before implementing (T003, T011)
- Commit after each task or logical group (conventional commits: `feat(calendar-ui): ...`)
- Stop at any checkpoint to validate a story independently via quickstart.md
- Avoid: vague tasks, same-file conflicts (T007/T008/T010 are sequential on `CreateClassModal.tsx`), cross-story dependencies that break independence
---

## Completion Report

- **Date**: 2026-08-18
- **Feature**: Admin/Coach Calendar UI (US-2.5, COACHER-20) — 22/22 tasks completed
- **Scope**: Frontend-only consolidation/polish pass over committed US-2.2/2.3/2.4 work. No schema, API, or backend code changes (backend used only as a regression guard).

### What was implemented
- **Foundational (T003-T004)**: `CLASS_TYPE_COLORS` (INDIVIDUAL `#3b82f6`, GROUP `#10b981`) + `CANCELED_CLASS_COLOR` (`#6b7280`) in `frontend/src/domain/utils/classCalendarEvents.ts`; `toClassCalendarEvent` now derives `cellColor` from class type (canceled → gray) and the level-based `levelColor` is removed from the calendar event (Red-Green: 3 new tests failed first, then all passed).
- **US1 (T005-T006)**: `ClassEventBlock` colors cells by class type and renders a visible "Canceled" pill; audit confirmed calendar data flows exclusively through `useListClasses`/`useListBlocks` → `apiClient` (`/api/v1`) with zero direct browser→Google API calls.
- **US2 (T007-T010)**: Unified `CreateClassModal` now offers Individual / Group / **Block**; Block swaps in block fields (Personal/Gym-wide, Gym-wide Admin-only, admin personal-block coach picker, hour-aligned start/end selects, `useCreateBlock`). Standalone `CreateBlockModal.tsx` deleted and "Add Block" buttons removed from admin/coach Calendar pages (single "Add Class" button). Stale-slot conflicts keep field values, surface the backend message, and refetch available slots (FR-013/T010).
- **US3 (T011-T014)**: New pure `todaySchedule.ts` (`sortClassesByGymTime`, gym-timezone wall-clock ordering; Red-Green) + `TodayScheduleList.tsx` (chronological rows, class-type color stripe, start time + coach, gray + "Canceled" tag, empty state) wired into both Today pages, replacing `<ClassCalendar />`.
- **US4 (T015-T016)**: `MobileDayView` uses the class-type color map + Canceled tag; desktop/tablet (1280/768) verified overflow-safe (`overflow-auto` main, off-canvas sidebar below `lg`, `flex-wrap` toolbars, `truncate`/`min-w-0`).
- **Polish (T017-T022)**: Added a UI note in `docs/api-specifications.md` (POST /blocks) documenting the unified modal; removed all `CreateBlockModal`/`levelColor` references.

### Gates
- Frontend: `tsc --noEmit` ✓ · `biome check src/` ✓ · `vitest run` 3 files / 21 tests ✓ (was 15 tests at baseline; +6 Red-Green tests)
- Backend (unchanged, regression guard): `tsc --noEmit` ✓ · `biome check src/` ✓ · `vitest run` 23 files / 264 tests ✓

### Quickstart scenarios (T021)
S1–S7 require a running stack (Postgres + migrated/seeded DB + Google Calendar Service Account key) and a browser at 1280/768px; no Playwright/E2E harness exists in the repo. Statically verified each scenario against the implementation:
- **S1/S2/S7** (US1 colors, blocks, week nav; canceled gray+tag; zero browser→Google) — code-verified.
- **S3/S4** (Add Class creates classes AND blocks; Gym-wide admin-only; stale-slot conflict keeps values + refreshes slots) — code-verified.
- **S5** (Today vertical chronological list, type stripes, canceled tag, empty state) — code-verified.
- **S6** (no horizontal scroll at 1280/768) — layout structurally overflow-safe.
⚠️ Recommended manual pass once a seeded DB + Google SA key are available, especially S4 (race-condition UI) and S6 (visual check).

### Notes / deviations
- Class-type palette confirmed with the user at implementation time: INDIVIDUAL `#3b82f6` (blue), GROUP `#10b981` (green), CANCELED `#6b7280` (gray).
- Implemented on the currently checked-out branch (`featura-entrerga2-SVJ`) per user confirmation.
- Per D3, the manual free-time fallback input remains (backend overlap checks guard it); slot chips remain the primary path.
