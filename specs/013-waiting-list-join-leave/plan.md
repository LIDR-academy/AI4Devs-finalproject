# Implementation Plan: Waiting List Join/Leave

**Branch**: `013-waiting-list-join-leave` | **Date**: 2026-08-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/013-waiting-list-join-leave/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

US-3.3 (COACHER-23). Coachees join and leave waiting lists so they can be considered when spots open. Three new backend endpoints documented in `docs/api-specifications.md` §Waiting Lists:

- `POST /classes/:id/waiting-list` — authenticated Coachee joins a waiting list: allowed for a **full** group class (4/4) or an **occupied** individual slot; validates max 4 waiting list entries (`WAITING_LIST_FULL`), not already enrolled (`ALREADY_ENROLLED`), not already on the list (`ALREADY_ON_WAITING_LIST`), level reach (`LEVEL_MISMATCH`), class active, and Coachee identity from the JWT (never the body).
- `DELETE /classes/:id/waiting-list` — the waitlisted Coachee leaves at any time; no penalty, no side notification.
- `GET /waiting-lists` — the authenticated Coachee's active waiting lists, with class details and an informational `hasOpenSpots` flag, never a position number.

All join/leave/list business rules live in a new pure domain service `WaitingListPolicy` (Constitution §I/II). **No Prisma schema changes or migrations** — the `WaitingList` model (`class_id`, `coachee_id`, `joined_at`, `@@unique([class_id, coachee_id])`) already exists. Frontend: repository methods, hooks, and a pure error-message map; the full class card gains a working join action (currently a static label), a leave action when on the list, and a "My waiting lists" view hosted from the Coachee Home page.

## Technical Context

**Language/Version**: Node.js 22 LTS + TypeScript (backend); React 18 + Vite + TypeScript (frontend)

**Primary Dependencies**: Backend — Express, Prisma, Zod (all pinned). Frontend — React Router v6, TanStack React Query v5, TailwindCSS v4

**Storage**: PostgreSQL via Prisma — **no schema changes or migrations**. `WaitingList` already models the feature (see `backend/prisma/schema.prisma:133`). `TrainingClass`, `Level`, `User`, `SecurityAuditLog`, `Notification`, `ClassEnrollment` are existing models

**Testing**: Vitest + Supertest (backend unit/integration); Vitest (frontend)

**Target Platform**: Web application (SPA + REST API under `/api/v1/`)

**Project Type**: Web application (frontend + backend, hexagonal backend)

**Performance Goals**: Join/leave resolve and reflect on the waiting list within 1 second; the waiting lists view renders instantly at expected volumes (single gym, max 4 entries per class)

**Constraints**:
- Waiting list max size = 4 (`WAITING_LIST_FULL`); `@@unique([class_id, coachee_id])` backstops `ALREADY_ON_WAITING_LIST`
- Group class waiting list only when full (4/4); individual slot waiting list only when occupied (`enrollmentCount >= 1`)
- Level reach = coachee level, one above, or one below (reuse `isWithinReach`); a Coachee without a level is out of reach
- Coachee cannot be on the waiting list if already enrolled in the class, or already on the same list
- Coachee identity MUST come from the authenticated session (JWT) — no coachee ID in the request body
- All three endpoints guarded by `authenticate` + `requireRole(UserRole.COACHEE)`; non-Coachee → `403 FORBIDDEN`
- No position shown anywhere (simultaneous notification model — PRD §5/§6.4); `GET /waiting-lists` returns `hasOpenSpots` instead
- Error envelope `{ error: { code, message, ref } }`; `.strict()` Zod; no stack traces; `400 VALIDATION_ERROR` for inapplicable requests (canceled class, group not full, individual slot unoccupied)
- Domain purity (Constitution §I): capacity/waiting-list fullness/occupied/reach/already-enrolled/already-on-list rules live in `src/domain/services/WaitingListPolicy.ts` — zero Prisma/Express/Zod imports in `src/domain/`
- Security event logging: every successful AND denied join/leave writes a `SecurityAuditLog` row (actor, `waiting-list.join`/`waiting-list.leave`, class, outcome)
- Notification rows type 9 (join) / 10 (leave) recorded for the Coachee per the documented API contract; FCM dispatch stays EP-04 (record-only, mirroring the 011 cancellation precedent)
- No waiting-list auto-promotion (EP-04) — automatic processing when spots open is explicitly out of scope
- All dependencies pinned; no raw SQL (Prisma parameterized queries only)

**Scale/Scope**: Single gym, dozens of classes/week; three endpoints implemented with tests, plus the Coachee waiting-list actions and list view; no migration, no new external dependencies

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Gate | Status |
|---|-----------|------|--------|
| G1 | Domain Purity (NON-NEGOTIABLE) | New `WaitingListPolicy` domain service encapsulates list-full, group-not-full, slot-not-occupied, level-reach, already-enrolled, already-on-list, ownership and hasOpenSpots rules — pure TypeScript, zero Prisma/Express/Zod imports in `src/domain/` | PASS |
| G2 | Test-First for Domain Logic | Acceptance scenarios already specified in `spec.md` (Given/When/Then). `WaitingListPolicy.test.ts` written and failing before production code; 100% branch coverage on the policy; each endpoint has happy-path + each validation-error Supertest test; last-slot race (FR-013) covered by an integration test | PASS |
| G3 | Security-by-Default | All three endpoints `authenticate` + `requireRole(COACHEE)`; JWT-derived identity only; `.strict()` Zod; `403` for non-Coachee / non-owner removal; `SecurityAuditLog` on every success and denial; no stack traces; error contract respected | PASS |
| G4 | API Contract Consistency | Responses follow `docs/api-specifications.md` §Waiting Lists (POST/DELETE `/classes/:id/waiting-list`, `GET /waiting-lists`); error codes `WAITING_LIST_FULL`, `ALREADY_ON_WAITING_LIST`, `ALREADY_ENROLLED`, `LEVEL_MISMATCH`, `FORBIDDEN`, `NOT_FOUND`, `VALIDATION_ERROR`; arrays use the `{ data, meta }` envelope; errors use the standard envelope | PASS |
| G5 | Dependency Integrity | No new dependencies; existing ones already pinned to exact versions | PASS |

No gate violations. `Complexity Tracking` table intentionally empty.

## Project Structure

### Documentation (this feature)

```text
specs/013-waiting-list-join-leave/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output — key design decisions
├── data-model.md        # Phase 1 output — entity/state model
├── quickstart.md        # Phase 1 output — validation guide
├── contracts/           # Phase 1 output — API + UI contracts
│   ├── api.md
│   └── ui.md
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

Existing hexagonal backend (reused) + existing frontend patterns (reused):

```text
backend/src/
├── config/container.ts                       # DI — register JoinWaitingList, LeaveWaitingList, ListWaitingLists (+ WaitingListPolicy)
├── application/use-cases/
│   ├── JoinWaitingList.ts                    # NEW: POST /classes/:id/waiting-list flow
│   ├── LeaveWaitingList.ts                   # NEW: DELETE /classes/:id/waiting-list flow
│   └── ListWaitingLists.ts                   # NEW: GET /waiting-lists flow
├── domain/services/
│   └── WaitingListPolicy.ts                  # NEW: pure domain rules (join validation, ownership, hasOpenSpots)
├── infrastructure/
│   ├── routes/classes.ts                     # ADD the two /classes/:id/waiting-list routes + GET /waiting-lists
│   ├── dto/
│   │   ├── waitingListDto.ts                 # NEW: dto mapper (entry, hasOpenSpots, paginated envelope)
│   │   └── (trainingClassDto.ts unchanged)
│   └── logging/AuditLogger.ts                # reused
└── __tests__/
    ├── WaitingListPolicy.test.ts             # NEW (Red-Green, 100% branch)
    ├── JoinWaitingList.test.ts               # NEW
    ├── LeaveWaitingList.test.ts              # NEW
    ├── ListWaitingLists.test.ts              # NEW
    └── waiting-list.int.test.ts              # NEW: Supertest all three endpoints (happy + every error + last-slot race)
```

Frontend (Coachee surface, wired into existing pages):

```text
frontend/src/
├── domain/types/
│   ├── class.ts                              # EXTEND: WaitingListEntry?, JoinWaitingListResponse types (or in waitingList.ts)
│   └── waitingList.ts                        # NEW: WaitingListEntry, WaitingListListResponse, JoinWaitingListResponse
├── domain/utils/
│   ├── waitingListErrorMessages.ts           # NEW: code → Coachee-facing message map (WAITING_LIST_FULL, ALREADY_ON_WAITING_LIST, ...)
│   └── classCardState.ts                     # EXTEND: "leave-waiting-list" action when isOnWaitingList; "waiting-list" stays a join action
├── domain/usecases/
│   ├── joinWaitingList.ts                    # NEW
│   ├── leaveWaitingList.ts                   # NEW
│   └── listWaitingLists.ts                   # NEW
├── infrastructure/repositories/classesRepository.ts  # EXTEND: joinWaitingList(id), leaveWaitingList(id), listWaitingLists()
├── infrastructure/hooks/
│   ├── useJoinWaitingList.ts                 # NEW
│   ├── useLeaveWaitingList.ts                # NEW
│   └── useMyWaitingLists.ts                  # NEW
└── ui/
    ├── components/CoacheeClassCard.tsx       # EXTEND: make "Waiting list" a working join action + "Leave waiting list" action + on-list state
    ├── components/coachee/MyWaitingLists.tsx # NEW: list view (class details, hasOpenSpots tag, Leave button, empty state)
    └── pages/coachee/HomePage.tsx            # WIRE MyWaitingLists view (link from WaitingListBadge count or the view itself)
```

**Structure Decision**: Follow the existing hexagonal layering and the existing repo/hooks/component patterns exactly — no new top-level directories, no new packages. Backend adds three use cases, one pure domain service, and three routes; frontend adds three repository methods, three hooks, a small list view, and extends the existing Coachee class card. The gray-block calendar interaction (tapping an occupied individual slot on the calendar) belongs to the coachee calendar-interaction storyline (US-3.4) and is out of scope here; the join/leave capability it will use is fully covered by this feature's contracts and backend tests.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

_No violations — table intentionally empty._