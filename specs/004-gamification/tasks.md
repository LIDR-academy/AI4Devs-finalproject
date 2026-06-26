---
description: "Task list for Gamification and Achievement System"
---

# Tasks: Gamification and Achievement System

**Input**: Design documents from `/specs/004-gamification/`

**Prerequisites**: plan.md ✓ · spec.md ✓ · research.md ✓ · data-model.md ✓ · contracts/ ✓

**Tests**: TDD is MANDATORY (Constitution I). Every implementation task is preceded by a
failing-test task; tests MUST fail before the implementation begins.

**Organization**: Phases 3–5 map to user stories (US1 = P1, US2 = P2, US3 = P3). Each story is
independently testable and delivers a standalone increment.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no incomplete dependencies)
- **[Story]**: US1/US2/US3 — maps to spec.md user-story priority

## Path Conventions

Monorepo web app: backend at `back/src/`, backend tests co-located (`*.spec.ts`) and e2e in
`back/test/`; frontend at `front/src/`, e2e in `front/tests/e2e/`.

---

## Phase 1: Setup

**Purpose**: Create the gamification module skeleton and shared badge catalog so later phases have
a concrete target.

- [x] T001 Create `back/src/modules/gamification/` and add an empty `GamificationModule` shell in `back/src/modules/gamification/gamification.module.ts` (no providers yet); register `GamificationModule` in `back/src/app.module.ts`
- [x] T002 [P] Create the backend badge catalog in `back/src/modules/gamification/badge-catalog.ts` — export a typed array of `{ code, label, description, unlockCondition }` for `FIRST_SAVE`, `SAVER_10`, `SAVER_50`, `SAVER_100`, `MONEY_SAVER_10`, `ZERO_WASTE_WEEK` (per data-model.md Badge Catalog)

**Checkpoint**: Module compiles and is registered; badge catalog importable.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database models that all user stories depend on.

**⚠️ CRITICAL**: No user-story work can begin until the migration is applied.

- [x] T003 Add `UserPoints` and `UserBadge` models and `userPoints`/`userBadges` back-relations on `User` in `back/prisma/schema.prisma` (fields, indexes, and `@@unique([userId, code])` exactly per data-model.md)
- [x] T004 Run `cd back && npx prisma migrate dev --name add-gamification` to create the tables and regenerate the Prisma client

**Checkpoint**: `UserPoints` and `UserBadge` are available on the Prisma client with full types.

---

## Phase 3: User Story 1 — Earn and see points (Priority: P1) 🎯 MVP

**Goal**: Consuming an item before expiry awards points; wasting deducts; the user sees the total
on the dashboard. Delivers the core points loop end-to-end.

**Independent Test**: Consume an item before expiry and confirm `totalPoints` increases by the
expected amount via `GET /api/gamification/summary` and on the dashboard widget; waste an item and
confirm the total decreases; verify the consume API still succeeds when points processing throws.

### Tests for User Story 1 (write first, confirm failing) ⚠️

- [x] T005 [P] [US1] Write failing unit tests for the points engine in `back/src/modules/gamification/points.service.spec.ts` — cover: consumed before expiry with ≥ 3 days (writes `CONSUMED_BEFORE_EXPIRY` +10 and `BONUS_3_DAYS` +5), consumed before expiry < 3 days (+10 only), consumed on/after expiry (no rows), consumed with no expiry date (no rows), wasted (`WASTED` −5); assert `referenceId` set to the event id
- [x] T006 [P] [US1] Write failing unit tests for summary aggregation in `back/src/modules/gamification/gamification.service.spec.ts` — cover: `totalPoints` = sum of deltas clamped to ≥ 0, `totalValueSavedEur`/`totalValueWastedEur` sums, `consumedBeforeExpiryCount` (rows with reason `CONSUMED_BEFORE_EXPIRY`), `wastedCount`, empty `badges`, and `weeklyStreak` derivation (consecutive completed Mon–Sun weeks with ≥1 event and 0 waste)
- [x] T007 [P] [US1] Write failing unit tests for `GET /gamification/summary` in `back/src/modules/gamification/gamification.controller.spec.ts` — 200 with summary shape; uses `userId` from `RequestWithUser`; never accepts a user id param
- [x] T008 [US1] Add failing unit tests to `back/src/modules/pantry/pantry.service.spec.ts` — verify `PointsService.processConsumptionEvent` is called after a successful `registerEvent`, is NOT called when event creation fails, and that a thrown error from it does not fail `registerEvent`

### Implementation for User Story 1

- [x] T009 [US1] Implement `PointsService` in `back/src/modules/gamification/points.service.ts` — `processConsumptionEvent(eventId: string): Promise<void>` re-reads the `ConsumptionEvent`, computes deltas per data-model.md rules, and writes `UserPoints` rows (no badge call yet — added in US2)
- [x] T010 [US1] Implement `GamificationService.getSummary(userId)` in `back/src/modules/gamification/gamification.service.ts` — aggregate totals, counts, value sums, earned badges (enriched via badge-catalog), and `weeklyStreak`; clamp `totalPoints` to ≥ 0
- [x] T011 [US1] Implement `GamificationController` in `back/src/modules/gamification/gamification.controller.ts` — `@Controller("gamification")` + `@UseGuards(JwtAuthGuard)`, `GET summary` returning `getSummary(req.user.userId)` (mirror `insights.controller.ts`)
- [x] T012 [US1] Wire `PointsService`, `GamificationService`, and `GamificationController` into `back/src/modules/gamification/gamification.module.ts`; export `PointsService`
- [x] T013 [US1] Hook gamification into consumption in `back/src/modules/pantry/pantry.service.ts` — after the `registerEvent` transaction commits, call `this.pointsService.processConsumptionEvent(event.id)` in a `try/catch` (log and swallow errors); inject `PointsService` and import `GamificationModule` into `back/src/modules/pantry/pantry.module.ts`
- [x] T014 [P] [US1] Create frontend API bindings in `front/src/features/gamification/gamification.api.ts` — `getGamificationSummary(): Promise<GamificationSummary>` plus the `GamificationSummary`/`Badge` types (mirror `insights.api.ts` auth+fetch pattern, shape per contracts/gamification-summary.md)
- [x] T015 [US1] Implement `PointsSummaryWidget` in `front/src/components/PointsSummaryWidget.tsx` — show total points, most recent badge, and weekly streak, with a link to `/achievements`
- [x] T016 [US1] Render `PointsSummaryWidget` on the dashboard surface `front/src/routes/insights.tsx` (fetch via TanStack Query like the existing dashboard summary)
- [x] T017 [P] [US1] Write Vitest for `PointsSummaryWidget` in `front/src/components/PointsSummaryWidget.test.tsx` — renders points total and streak from a mocked summary

**Checkpoint**: Consuming an item updates the visible point total; consume never fails on a
gamification error. US1 is independently demoable.

---

## Phase 4: User Story 2 — Unlock achievement badges (Priority: P2)

**Goal**: Award badges at milestones and on zero-waste weeks; show earned vs locked badges on an
achievements page. Builds on the points/consumption signal from US1.

**Independent Test**: From a fresh user, consume the first item before expiry and confirm
`FIRST_SAVE` appears in `summary.badges` (and only once on repeat); view `/achievements` and confirm
earned badges are full colour and locked badges greyed with their unlock condition.

### Tests for User Story 2 (write first, confirm failing) ⚠️

- [x] T018 [P] [US2] Write failing unit tests for `BadgeService.evaluateBadges` in `back/src/modules/gamification/badge.service.spec.ts` — cover each condition (`FIRST_SAVE` at count 1, `SAVER_10/50/100` at thresholds, `MONEY_SAVER_10` at €10 saved, `ZERO_WASTE_WEEK`), idempotency (no duplicate on repeat / unique-constraint conflict treated as no-op), and that a new badge triggers `deliverBadge`
- [x] T019 [P] [US2] Write failing unit tests for the weekly job in `back/src/modules/gamification/gamification-cron.service.spec.ts` — for a completed Mon–Sun week with ≥1 event and 0 waste, `ZERO_WASTE_WEEK` is awarded; not awarded for a week containing a waste event or with no activity
- [x] T020 [US2] Add failing unit tests for badge push in `back/src/modules/notifications/notification-delivery.service.spec.ts` — `deliverBadge` sends a web push with badge label/description and logs `BADGE_EARNED`; no-op (no throw) when the user has no push subscription

### Implementation for User Story 2

- [x] T021 [US2] Implement `BadgeService.evaluateBadges(userId)` in `back/src/modules/gamification/badge.service.ts` — evaluate all badge conditions (counts/sum per data-model.md), insert missing `UserBadge` rows, catch unique-constraint conflicts as no-ops, and call `NotificationDeliveryService.deliverBadge` for each newly awarded badge
- [x] T022 [US2] Add `deliverBadge(userId, label, description)` to `back/src/modules/notifications/notification-delivery.service.ts` — reuse `webPushService.sendNotification` + `NotificationLog` (`type: "BADGE_EARNED"`, `channel: "WEB_PUSH"`); skip silently when no subscription exists
- [x] T023 [US2] Update `back/src/modules/gamification/points.service.ts` — after writing points, call `this.badgeService.evaluateBadges(userId)` (within the service's own error handling so badge failure never breaks points)
- [x] T024 [US2] Implement `GamificationCronService` in `back/src/modules/gamification/gamification-cron.service.ts` — `setInterval` + `OnModuleInit`/`OnModuleDestroy` (mirror `notifications.scheduler.ts`); on each tick, detect newly completed Mon–Sun weeks and evaluate `ZERO_WASTE_WEEK` for users with activity in that week
- [x] T025 [US2] Register `BadgeService` and `GamificationCronService` in `back/src/modules/gamification/gamification.module.ts` and import the notifications module so `NotificationDeliveryService` is injectable
- [x] T026 [P] [US2] Create the frontend badge catalog mirror in `front/src/features/gamification/badge-catalog.ts` — codes, labels, descriptions, unlock conditions for the locked-badge UI
- [x] T027 [US2] Implement the achievements route in `front/src/routes/achievements.tsx` — fetch summary, render total points and a badges grid (earned = full colour with earned date; locked = greyed with unlock condition by diffing the catalog against earned codes)
- [x] T028 [US2] Add an entry point to `/achievements` — add it to `front/src/components/AppShell.tsx` nav (or, if the 5-item bottom bar is full, ensure the `PointsSummaryWidget` link is the entry point)
- [x] T029 [P] [US2] Write Vitest for the achievements route in `front/src/routes/achievements.test.tsx` — renders earned badges in colour and locked badges greyed with their condition

**Checkpoint**: Badges award once at the right thresholds and on zero-waste weeks; achievements page
distinguishes earned vs locked. US1 and US2 both work.

---

## Phase 5: User Story 3 — Review points history (Priority: P3)

**Goal**: A paginated, reverse-chronological log of point changes and badge awards with readable
reasons.

**Independent Test**: After earning/losing points and a badge, call
`GET /api/gamification/history?limit=20&offset=0` and confirm reverse-chronological entries with
`POINTS_EARNED`/`POINTS_DEDUCTED`/`BADGE_EARNED` types, readable reasons, and a `total`; request the
next page via `offset`.

### Tests for User Story 3 (write first, confirm failing) ⚠️

- [x] T030 [P] [US3] Write failing unit tests for `GamificationService.getHistory` in `back/src/modules/gamification/gamification.service.spec.ts` — merges `UserPoints` (→ `POINTS_EARNED`/`POINTS_DEDUCTED`) and `UserBadge` (→ `BADGE_EARNED`), sorts by time desc, paginates, and returns correct `total`
- [x] T031 [P] [US3] Write failing unit tests for `GET /gamification/history` in `back/src/modules/gamification/gamification.controller.spec.ts` — 200 with paged shape; `limit`/`offset` validation (defaults and bounds), 400 on invalid params

### Implementation for User Story 3

- [x] T032 [US3] Create the history query DTO in `back/src/modules/gamification/dto/get-history-query.dto.ts` — `limit` (default 20, 1–100) and `offset` (default 0, ≥ 0) with `class-validator` decorators
- [x] T033 [US3] Implement `GamificationService.getHistory(userId, limit, offset)` in `back/src/modules/gamification/gamification.service.ts` — merge/sort/paginate point and badge rows into readable entries with `total` (shape per contracts/gamification-history.md)
- [x] T034 [US3] Add `GET history` to `back/src/modules/gamification/gamification.controller.ts` — forward validated `limit`/`offset` and `req.user.userId` to `getHistory`
- [x] T035 [P] [US3] Add `getPointsHistory(limit, offset)` and the `PointsHistoryPage` type to `front/src/features/gamification/gamification.api.ts`
- [x] T036 [US3] Render a paginated history list (20/page) on `front/src/routes/achievements.tsx` using `getPointsHistory`
- [x] T037 [P] [US3] Write Vitest for the history list in `front/src/routes/achievements.test.tsx` — renders entries and paginates

**Checkpoint**: All three stories are independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: End-to-end validation and final integration across stories.

- [x] T038 [P] Write backend e2e in `back/test/gamification.e2e-spec.ts` — register user, consume an item before expiry, assert `UserPoints` row and `FIRST_SAVE` badge persisted, `GET /gamification/summary` reflects them, `GET /gamification/history` returns entries, and unauthenticated requests get 401
- [x] T039 [P] Write Playwright e2e in `front/tests/e2e/gamification/achievements.spec.ts` — mock summary/history, assert widget on dashboard, badges grid (earned + locked), and history pagination
- [x] T040 Run the [quickstart.md](./quickstart.md) validation scenarios end-to-end and confirm each acceptance mapping passes
- [x] T041 [P] Verify TypeScript (zero errors), ESLint (zero errors), and the full backend/frontend test suites pass for all touched layers

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — migration BLOCKS all user stories
- **Phase 3 (US1)**: Depends on Phase 2 — delivers the MVP
- **Phase 4 (US2)**: Depends on Phase 3 (adds the badge call to `points.service.ts` and reuses the summary/module)
- **Phase 5 (US3)**: Depends on Phase 3 (extends `gamification.service.ts`/controller); independent of US2
- **Phase 6 (Polish)**: Depends on the desired stories being complete

### Within Each User Story

- Tests (T005–T008, T018–T020, T030–T031) MUST be written and FAIL before their implementation
- Backend service before controller before module wiring; module before the pantry hook
- Frontend types/API before components before routes

### Parallel Opportunities

- **Setup**: T002 runs parallel to T001
- **US1 tests**: T005, T006, T007 are parallel (different files); T008 edits the pantry spec
- **US1 impl**: T014 (frontend API) parallel to backend T009–T013; T017 parallel after T015
- **US2**: T018, T019 parallel; T026 (frontend catalog) parallel to backend T021–T025; T029 parallel after T027
- **US3**: T030, T031 parallel; T035 parallel to backend T032–T034; T037 parallel after T036
- **Polish**: T038, T039, T041 parallel

---

## Parallel Example: User Story 1

```bash
# Write all US1 backend tests first (different files):
Task: "points.service.spec.ts — points engine combinations"        # T005
Task: "gamification.service.spec.ts — summary aggregation"          # T006
Task: "gamification.controller.spec.ts — GET /summary"              # T007

# Frontend API binding can proceed alongside backend implementation:
Task: "gamification.api.ts — getGamificationSummary + types"        # T014
```

---

## Implementation Strategy

### MVP First (User Story 1 only — Phases 1–3)

1. Phase 1: module shell + badge catalog
2. Phase 2: Prisma models + migration
3. Phase 3: points engine → summary → controller → pantry hook → dashboard widget
4. **STOP and VALIDATE**: consume an item → points increase on the dashboard; consume never fails on a gamification error
5. Deploy/demo the MVP

### Incremental Delivery

1. Phases 1–2 → foundation ready
2. Phase 3 (US1) → points loop → demo (MVP)
3. Phase 4 (US2) → badges + achievements page → demo
4. Phase 5 (US3) → history → demo
5. Phase 6 → e2e + quickstart validation

---

## Notes

- TDD is mandatory (Constitution I): confirm each test fails before implementing.
- Reuse existing patterns (Constitution VII): controller/guard from `insights`, scheduler from `notifications.scheduler.ts`, push delivery from `NotificationDeliveryService`, frontend fetch from `insights.api.ts`.
- The pantry hook MUST be fire-and-forget — a gamification failure can never fail the consume/waste API (FR-018, SC-002).
- All endpoints are JWT-protected and user-scoped via `req.user.userId` (FR-020, SC-006).
- `NotificationLog.type` is a free-form string, so `BADGE_EARNED` needs no schema change.
- Commit after each task or logical group; one logical change per commit.
