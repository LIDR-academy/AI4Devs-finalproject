---

description: "Task list for Consumption Automation for Long-Expired Items"
---

# Tasks: Consumption Automation for Long-Expired Items

**Input**: Design documents from `/specs/005-consumption-automation/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/)

**Tests**: REQUIRED. The RealSaveFooding Constitution (I. TDD, NON-NEGOTIABLE) mandates a failing
test before implementation. Every story's tests are written and confirmed failing first.

**Organization**: Tasks are grouped by user story (US1=P1, US2=P2, US3=P3) so each can be
implemented, tested, and delivered independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: US1 / US2 / US3 (Setup, Foundational, Polish carry no story label)
- Backend paths under `back/`, frontend under `front/` (web-app monorepo per plan.md)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm the working baseline. Per plan.md, no new runtime dependencies are introduced.

- [X] T001 Confirm `back/` and `front/` dependencies are installed and the `005-consumption-automation` work is on the active branch; verify no new runtime packages are required (plan.md: schedulers reuse the existing `setInterval` pattern, no `@nestjs/schedule`).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database schema for all three stories. **No user-story work can begin until this phase completes.**

**⚠️ CRITICAL**: All stories read/write the new schema (`AutoExpiryDigest`, the
`NotificationPreference` auto-expiry fields, and `ConsumptionEvent.method`).

- [X] T002 Add the schema changes in `back/prisma/schema.prisma` per [data-model.md](./data-model.md): new `AutoExpiryDigest` model (with `@@index([userId, status])` and `@@index([status, sentAt])`), `autoExpiryEnabled Boolean @default(true)` + `autoExpiryThresholdDays Int @default(14)` on `NotificationPreference`, and `method String?` on `ConsumptionEvent`.
- [X] T003 Generate and apply the migration and regenerate the client: `cd back && npx prisma migrate dev --name add_auto_expiry` (depends on T002). Confirm existing rows receive defaults (no backfill, FR-018).

**Checkpoint**: Schema ready — user stories can now begin.

---

## Phase 3: User Story 1 - Review and resolve expired items in bulk (Priority: P1) 🎯 MVP

**Goal**: Surface stale candidates on the pantry page and let the user bulk-waste, keep, or dismiss
them — delivering the core value with no automation required.

**Independent Test**: Seed a pantry item expired > 14 days, load the pantry, confirm the banner
appears, open the review sheet, "Mark all as wasted" → item recorded as wasted and banner
disappears; separately, "Dismiss all" → item stays in pantry and banner is suppressed for 7 days.

### Tests for User Story 1 (write first, confirm FAIL) ⚠️

- [X] T004 [P] [US1] Unit tests for `getExpiredCandidates` in `back/src/modules/pantry/pantry.service.spec.ts`: threshold filter (only `expirationDate < now - thresholdDays`), `daysExpired` and `estimatedValueEur` derivation, threshold read from `NotificationPreference` (default 14 when no row).
- [X] T005 [P] [US1] Unit tests for `bulkWasteItems` in `back/src/modules/pantry/pantry.service.spec.ts`: all items wasted in one transaction (`method` null), rollback leaving the pantry unchanged when an id is foreign/invalid (FR-005), and the user's `PENDING` digest resolved to `USER_RESOLVED`.
- [X] T006 [P] [US1] Unit tests for `bulkDismissExpired` in `back/src/modules/pantry/pantry.service.spec.ts`: items remain in the pantry, a `USER_RESOLVED` digest is created/resolved (`resolvedAt` set), and the subsequent candidate query is suppressed for 7 days (R4).
- [X] T007 [P] [US1] Controller tests in `back/src/modules/pantry/pantry.controller.spec.ts`: `GET /pantry/items/expired-candidates` returns `{ items, digestId }` and an empty list when a `USER_RESOLVED` digest is < 7 days old; `POST /pantry/items/bulk-waste` and `POST /pantry/items/bulk-dismiss-expired` happy paths; 404 when any `itemId` is foreign (no cross-user effect, FR-015).
- [X] T008 [P] [US1] Frontend tests: banner shows when candidates exist / hides after resolve in `front/src/routes/pantry.test.tsx`; `front/src/components/ExpiredItemsReview.test.tsx` renders candidates and that "Mark all as wasted" calls bulk-waste and "Dismiss all" calls bulk-dismiss.

### Implementation for User Story 1

- [X] T009 [P] [US1] Create request DTOs `back/src/modules/pantry/dto/bulk-waste.dto.ts` and `back/src/modules/pantry/dto/bulk-dismiss-expired.dto.ts` (`itemIds: string[]`, `@IsArray`, `@ArrayNotEmpty`, `@IsUUID('all', { each: true })`).
- [X] T010 [US1] Implement `getExpiredCandidates(userId)` in `back/src/modules/pantry/pantry.service.ts`: query `PantryItem` where `expirationDate < now - thresholdDays` (threshold from `NotificationPreference`, default 14), map to `{ id, name, expirationDate, daysExpired, estimatedValueEur }` reusing the existing value basis (`computeEstimatedValue`).
- [X] T011 [US1] Implement `bulkWasteItems(userId, itemIds)` in `back/src/modules/pantry/pantry.service.ts`: validate every id via `resolveHouseholdUserIds`, then a single `$transaction` creating a `WASTED` `ConsumptionEvent` (`method` null) + deleting each `PantryItem` (mirroring `registerEvent`), and resolve the `PENDING` digest to `USER_RESOLVED`; on any invalid id roll back and surface the failing ids (FR-005).
- [X] T012 [US1] Implement `bulkDismissExpired(userId, itemIds)` in `back/src/modules/pantry/pantry.service.ts`: leave items untouched and resolve the `PENDING` digest to `USER_RESOLVED`, creating a `USER_RESOLVED` digest when none is pending so the 7-day banner suppression works standalone (R4).
- [X] T013 [US1] Add endpoints in `back/src/modules/pantry/pantry.controller.ts`: `GET items/expired-candidates` (apply `USER_RESOLVED`-within-7-days suppression and attach the current `PENDING` `digestId`), `POST items/bulk-waste`, `POST items/bulk-dismiss-expired` — all under the existing `JwtAuthGuard`.
- [X] T014 [P] [US1] Add API bindings in `front/src/features/pantry/pantry.api.ts`: `getExpiredCandidates()`, `bulkWaste(itemIds)`, `bulkDismissExpired(itemIds)` using the existing `requestJson`/auth-header helpers and typed responses from [contracts/pantry-expiry.openapi.yaml](./contracts/pantry-expiry.openapi.yaml).
- [X] T015 [US1] Create `front/src/components/ExpiredItemsReview.tsx`: lists candidates (name, days expired, estimated value), "Mark all as wasted", per-item "Keep", and "Dismiss all"; invalidates the pantry query on success (depends on T014).
- [X] T016 [US1] Add the dismissible expired-items banner to `front/src/routes/pantry.tsx` driven by `getExpiredCandidates`, opening `ExpiredItemsReview`; hide the banner once candidates are resolved/dismissed (FR-014) (depends on T014, T015).

**Checkpoint**: US1 fully functional — the MVP (proactive surfacing + manual bulk resolution) works
without any scheduled automation.

---

## Phase 4: User Story 2 - Automatic cleanup after a grace period (Priority: P2)

**Goal**: A daily pass records a digest + requests a notification for eligible users; an auto-resolve
pass wastes still-stale candidates after the 7-day grace, tagged `AUTO_EXPIRED`.

**Independent Test**: With `autoExpiryEnabled=true` and a stale item, invoke `runDailyDigestPass`
with an injected `now` → a `PENDING` digest exists and `deliverDigest` is called; advance the
injected `now` past 7 days and invoke `runAutoResolvePass` → the item is wasted with
`method = "AUTO_EXPIRED"` and the digest is `AUTO_RESOLVED`.

### Tests for User Story 2 (write first, confirm FAIL) ⚠️

- [X] T017 [P] [US2] Unit tests for `runDailyDigestPass` in `back/src/modules/pantry/auto-expiry-cron.service.spec.ts`: eligible user gets a `PENDING` digest + `deliverDigest` call; user with `autoExpiryEnabled=false` is skipped (SC-004); no duplicate digest when one was created within 7 days; a thrown error for one user does not abort the batch (FR-017).
- [X] T018 [P] [US2] Unit tests for `runAutoResolvePass` in `back/src/modules/pantry/auto-expiry-cron.service.spec.ts`: a `PENDING` digest with `sentAt < now - 7d` wastes still-stale candidates with `method = "AUTO_EXPIRED"` and sets `AUTO_RESOLVED`; a digest younger than 7 days wastes nothing (SC-003); per-digest error isolation.
- [X] T019 [P] [US2] Unit tests for `deliverDigest` (and the summary variant) in `back/src/modules/notifications/notification-delivery.service.spec.ts`: never throws and still returns when email/push delivery is unavailable (FR-016/SC-007).
- [X] T020 [P] [US2] Integration test `back/test/auto-expiry.e2e-spec.ts`: seed an expired item, run the daily pass → digest created; advance time, run auto-resolve → item wasted with `AUTO_EXPIRED`.

### Implementation for User Story 2

- [X] T021 [US2] Add `deliverDigest(userId, items, userEmail)` and a summary variant to `back/src/modules/notifications/notification-delivery.service.ts`, following the existing never-throw, log-on-failure pattern of `deliverExpiry`/`deliverBadge`.
- [X] T022 [US2] Create `back/src/modules/pantry/auto-expiry-cron.service.ts` implementing `OnModuleInit`/`OnModuleDestroy` with `setInterval` (guarded by `NODE_ENV==='test'`), exposing `runDailyDigestPass(now)` and `runAutoResolvePass(now)`; reuse `getExpiredCandidates` and a shared waste routine setting `method='AUTO_EXPIRED'`; wrap per-user/per-digest work in `try/catch` (FR-017). Create the digest *before* attempting delivery (R7).
- [X] T023 [US2] Wire `AutoExpiryCronService` and the `NotificationDeliveryService` dependency into `back/src/modules/pantry/pantry.module.ts` (import the notifications provider/module as needed).

**Checkpoint**: US1 + US2 work independently — automation closes the loop for non-engaging users.

---

## Phase 5: User Story 3 - Control automation via settings (Priority: P3)

**Goal**: Per-user enable/disable and threshold (7–60 days) for auto-expiry.

**Independent Test**: Toggle auto-expiry off → daily pass creates no digest for that user; set a
custom in-range threshold → it persists and is honored; submit an out-of-range threshold → rejected.

### Tests for User Story 3 (write first, confirm FAIL) ⚠️

- [X] T024 [P] [US3] Unit tests for `getAutoExpiry`/`updateAutoExpiry` in `back/src/modules/notifications/notification-preferences.service.spec.ts`: reads defaults (enabled true, 14), persists updates.
- [X] T025 [P] [US3] Controller tests in `back/src/modules/notifications/notifications.controller.spec.ts`: `GET /settings/auto-expiry` returns `{ enabled, thresholdDays }`; `PATCH /settings/auto-expiry` updates both; `thresholdDays` outside 7–60 → 400 (FR-012).
- [X] T026 [P] [US3] Frontend tests in `front/src/routes/settings.test.tsx` (create if absent): toggling auto-expiry fires `PATCH`, threshold change within range saves.

### Implementation for User Story 3

- [X] T027 [P] [US3] Create `back/src/modules/notifications/dto/auto-expiry-settings.dto.ts`: `enabled` `@IsBoolean`, optional `thresholdDays` `@IsInt @Min(7) @Max(60)`.
- [X] T028 [US3] Add `getAutoExpiry(userId)` and `updateAutoExpiry(userId, dto)` to `back/src/modules/notifications/notification-preferences.service.ts` (read/write the `NotificationPreference` auto-expiry fields).
- [X] T029 [US3] Add `GET`/`PATCH settings/auto-expiry` to `back/src/modules/notifications/notifications.controller.ts` under the existing `JwtAuthGuard`, mirroring the `settings/notifications` routes.
- [X] T030 [P] [US3] Add `getAutoExpiry()`/`updateAutoExpiry(payload)` bindings in `front/src/features/settings/settings.api.ts` (create the module if absent) per [contracts/auto-expiry-settings.openapi.yaml](./contracts/auto-expiry-settings.openapi.yaml).
- [X] T031 [US3] Add the "Auto-expire stale items" toggle + threshold number input (7–60) to `front/src/routes/settings.tsx`, calling the settings bindings (depends on T030).

**Checkpoint**: All three stories independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validation and quality gates across stories.

- [X] T032 [P] Run the [quickstart.md](./quickstart.md) manual API + UI walkthrough and confirm SC-001…SC-007.
- [X] T033 Backend quality gates: `cd back && npx tsc --noEmit && npm run lint && npm run test && npm run test:e2e` (zero errors).
- [X] T034 [P] Frontend quality gates: `cd front && npx tsc --noEmit && npm run lint && npm run test` (zero errors).
- [X] T035 [P] Document the auto-expiry behavior (threshold, 7-day grace, `AUTO_EXPIRED` tag) in the relevant `front/src/features/pantry/README.md` / settings docs.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies.
- **Foundational (Phase 2)**: depends on Setup; **blocks all user stories** (schema).
- **US1 (Phase 3)**: depends on Foundational. The MVP.
- **US2 (Phase 4)**: depends on Foundational; builds on US1's `getExpiredCandidates` + waste routine (P1 before P2).
- **US3 (Phase 5)**: depends on Foundational; independent of US1/US2 (settings CRUD). US2's daily pass honors the `enabled` flag US3 edits, but US3 is testable alone.
- **Polish (Phase 6)**: depends on the stories being delivered.

### Within Each User Story

- Tests (T004–T008, T017–T020, T024–T026) are written and FAIL before implementation.
- Backend service before controller; frontend api binding before component/route.
- DTOs before the service/controller that consume them.

### Parallel Opportunities

- US1 tests T004–T008 in parallel; US2 tests T017–T020 in parallel; US3 tests T024–T026 in parallel.
- T014 (frontend api) is `[P]` against backend impl (different files); T015/T016 follow T014.
- After Foundational, US1 and US3 can proceed in parallel (different modules/files); US2 starts once US1's `getExpiredCandidates` exists.
- Polish T032/T034/T035 in parallel; T033 separately.

---

## Parallel Example: User Story 1

```bash
# Write US1 tests together (all must FAIL first):
Task: "T004 getExpiredCandidates unit tests in back/src/modules/pantry/pantry.service.spec.ts"
Task: "T005 bulkWasteItems unit tests in back/src/modules/pantry/pantry.service.spec.ts"
Task: "T006 bulkDismissExpired unit tests in back/src/modules/pantry/pantry.service.spec.ts"
Task: "T007 controller tests in back/src/modules/pantry/pantry.controller.spec.ts"
Task: "T008 banner + review tests in front/src/routes/pantry.test.tsx and ExpiredItemsReview.test.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Phase 1 Setup → Phase 2 Foundational (migration).
2. Phase 3 US1 (TDD): tests fail → implement → green.
3. **STOP and VALIDATE**: pantry banner + bulk review/dismiss work end-to-end.
4. Demo: proactive surfacing + one-action cleanup — value without any automation.

### Incremental Delivery

1. Foundation → US1 (MVP) → demo.
2. US2 (automation + grace-period auto-waste) → demo.
3. US3 (settings opt-out + threshold) → demo.
4. Polish + quickstart validation.

---

## Notes

- `[P]` = different files, no incomplete-task dependency.
- Verify each test FAILS before implementing (Constitution I).
- Commit after each task or logical group; one logical change per commit.
- US1 is the recommended MVP cut.
