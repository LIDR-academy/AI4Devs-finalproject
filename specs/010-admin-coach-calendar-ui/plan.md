# Implementation Plan: Admin/Coach Calendar UI

**Branch**: `010-admin-coach-calendar-ui` | **Date**: 2026-08-18 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/010-admin-coach-calendar-ui/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

US-2.5 (COACHER-20). Coaches and Admins get a visual, in-app weekly calendar (no browser→Google Calendar calls) that shows **all classes from all Coaches color-coded by class type** (clarified Q1:A), **personal and gym-wide blocks** as blocked regions, **canceled classes in gray with a "Canceled" tag**, and an **"Add Class" modal that creates classes AND time blocks** (Individual / Group / Block, PRD parity — clarified Q2:A). A **Today page** renders the day's classes as a vertical chronological list with individual/group visual distinction and canceled handling. Both pages are responsive for desktop and tablet.

Most of the surface already exists from the class-creation (US-2.2), class-viewing/cancellation (US-2.3), and block-management (US-2.4) work — week grid, filters, block rendering, class/bock detail views, class-create modal, and the mobile day view are committed on this branch. This feature is therefore a **frontend-only consolidation/polish pass** that closes the following gaps against the clarified spec:

1. **Color coding is currently by level, not by class type** — `ClassEventBlock`, `MobileDayView`, and `toClassCalendarEvent` color slots by `level.color`. The clarified requirement is color by class type (individual vs group) with the 5-level color mapping **not** used in calendar cells. Need a class-type → color mapping.
2. **Add Class modal does NOT create blocks** — `CreateClassModal` handles only INDIVIDUAL/GROUP; block creation lives in a separate `CreateBlockModal` opened by a dedicated "Add Block" button. Clarified decision: the modal offers Individual / Group / Block. Need to unify block creation into the Add Class modal.
3. **No visible "Canceled" tag** — canceled classes are only dimmed (`opacity`), no tag text in the calendar or day views. Spec requires a visible "Canceled" tag.
4. **Today page is just the week grid** — `AdminTodayPage`/`CoachTodayPage` render `<ClassCalendar />`. Spec requires a vertical chronological list of today's classes with individual/group distinction, canceled tag, and empty state.

No backend, schema, or API-contract changes are required: all data comes from the existing `GET /classes`, `GET /blocks`, `GET /classes/available-slots`, `GET /classes/assignable-coaches`, and `GET /coachees` endpoints. Calendar and modal behavior reuse the existing Schedule-X component, React Query hooks, and axios `apiClient`.

## Technical Context

**Language/Version**: React 18 + TypeScript + Vite (frontend); Node.js 22 LTS + TypeScript (backend, unchanged)

**Primary Dependencies**: Frontend — Schedule-X (`@schedule-x/*` 4.x, existing), React Router v6, TanStack React Query v5, TailwindCSS v4, `temporal-polyfill`. Backend — unchanged (Express, Prisma, googleapis consumed via existing server-side adapters)

**Storage**: None (no schema change). Existing PostgreSQL `Block`/`TrainingClass` models already feed the UI

**Testing**: Vitest (frontend unit tests for domain utils); existing backend Supertest suites unchanged; manual/E2E validation per `quickstart.md`

**Target Platform**: Web application (SPA under `/coach/...` and `/admin/...` routes)

**Project Type**: Web application (frontend-focused feature; backend reused as-is)

**Performance Goals**: Week calendar renders within the existing React Query cadence; block/class payloads already paged `limit:100`. No new data fetched per keystroke. Available-slot loading unchanged (already surfaced in the modal).

**Constraints**:
- Calendar MUST be an in-app component — zero browser calls to the external scheduling service (existing `ClassCalendar` contract; preserved)
- Class duration is a fixed 60-minute domain invariant (calendar event mapping already respects `durationMinutes`)
- Class-type color mapping is a **domain-utils constant** (individual/groups each one stable color; canceled → gray) — level colors remain visible only in class/coachee detail surfaces, NOT as calendar cell background
- Canceled classes stay visible (gray + "Canceled" tag) and their original slot is never an available slot (backend already enforces via ACTIVE-only availability)
- Add Class modal must offer Individual / Group / Block; block creation reuses the existing block rules (hour-aligned, 1-hour minimum, Personal/Gym-wide, Gym-wide Admin-only)
- Modal must only propose genuinely available time slots (existing `useAvailableSlots`) and, on a stale-slot conflict, keep user entries and refresh slots
- Times remain UTC instants rendered in the gym timezone (`Europe/Madrid`) via existing `gymDateTime.ts`
- Error presentation reuses the existing toast/`apiError` patterns (no internal details surfaced)
- Desktop + tablet layouts only (mobile already has its dedicated `MobileDayView`); no horizontal scrolling on 1280px and 768px viewports

**Scale/Scope**: Single gym, a handful of Coaches, low schedule volume. Frontend-only change; no new dependencies; no new endpoints; no migrations.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Gate | Status |
|---|-----------|------|--------|
| G1 | Domain Purity (NON-NEGOTIABLE) | The class-type color mapping and calendar-event derivation live in pure `frontend/src/domain/utils/classCalendarEvents.ts` (zero axios/React imports there, mirroring `gymDateTime.ts`). No backend/domain changes. | PASS |
| G2 | Test-First for Domain Logic | `classCalendarEvents.test.ts` is extended **before** the color/tag behavior changes: new tests for class-type color mapping (canceled → gray vs individual/group colors) and, if extracted, the Today-list sorting util. Tests confirmed failing first (Red), then implementation (Green). | PASS |
| G3 | Security-by-Default | Pages stay behind `ProtectedRoute` with role guards (Admin/Coach only — Coachee never reaches them). No new backend surface; no browser→Google API. Error/modal behavior exposes no internals. | PASS |
| G4 | API Contract Consistency | Feature consumes existing documented endpoints only (`GET /classes`, `GET /blocks`, `GET /classes/available-slots`, `GET /classes/assignable-coaches`, `GET /coachees`). No endpoint, envelope, or payload change. | PASS |
| G5 | Dependency Integrity | No new npm dependencies added (Schedule-X already pinned exact). Existing pinned deps untouched. | PASS |
| G6 | Observability & audit | No server-side changes; existing audit logging on class/block create/cancel remains the source of truth. Frontend error states surface user-friendly messages on 5xx (identifying external-service failures from the existing `apiError` extraction). | PASS |

No gate violations. `Complexity Tracking` table intentionally empty.

**Post-design re-check (after Phase 1)** — all six gates still PASS: color mapping and event derivation remain pure domain utils (G1); new unit tests for class-type coloring and Today-list ordering precede the implementation (G2); the unified modal keeps role-aware behavior and the pages retain existing guards (G3); no contract/schema changes — reused endpoints only (G4, G5); no backend/observability changes (G6).

## Project Structure

### Documentation (this feature)

```text
specs/010-admin-coach-calendar-ui/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output — gap analysis & design decisions
├── data-model.md        # Phase 1 output — entity/state model (no DB changes)
├── quickstart.md        # Phase 1 output — validation guide
├── contracts/           # Phase 1 output — frontend UI contracts
│   └── ui.md
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

Frontend only (existing hexagonal-style frontend layering; backend untouched):

```text
frontend/src/
├── domain/
│   ├── utils/classCalendarEvents.ts            # MODIFY: class→event color = classType-based; keep level for details
│   ├── utils/classCalendarEvents.test.ts       # MODIFY: class-type color mapping tests (Red first)
│   └── utils/todaySchedule.ts                  # NEW (if extracted): chronological Today-list ordering helper
│   └── utils/todaySchedule.test.ts             # NEW (if extracted): ordering + grouping tests
├── ui/components/
│   ├── ClassCalendar.tsx                       # MODIFY: render "Canceled" tag; use classType color
│   ├── CreateClassModal.tsx                    # MODIFY: add "Block" type option; integrate block fields
│   ├── CreateBlockModal.tsx                    # REMOVE (subsumed by CreateClassModal)
│   ├── MobileDayView.tsx                       # MODIFY: classType color + "Canceled" tag
│   ├── TodayScheduleList.tsx                   # NEW: vertical chronological list w/ distinction + canceled + empty state
│   └── layouts/...                             # unchanged
├── ui/pages/
│   ├── admin/CalendarPage.tsx                  # MODIFY: single "Add Class" button (drops separate Add Block)
│   ├── coach/CalendarPage.tsx                  # MODIFY: single "Add Class" button (drops separate Add Block)
│   ├── admin/TodayPage.tsx                     # MODIFY: render <TodayScheduleList/>
│   └── coach/TodayPage.tsx                     # MODIFY: render <TodayScheduleList/>
└── infrastructure/routes/App.tsx               # unchanged (routes already wired)
```

Docs (repository root):

```text
docs/api-specifications.md   # NOTE (no change): consumed endpoints already documented
```

**Structure Decision**: Follow the existing frontend layering exactly — no new top-level directories, no new packages. The backend is not touched. The feature reworks four existing components, deletes one (block modal is merged), and adds one new Today-list component plus (optionally) a pure Today-ordering utility — all nested inside `frontend/src/` following the established `domain -> infrastructure -> ui` pattern.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No constitution violations. Table intentionally empty.