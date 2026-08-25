# Research: Coachee Dashboard & Calendar

**Phase 0 output** for `specs/012-coachee-dashboard-calendar/`. No `NEEDS CLARIFICATION` markers remain in the spec; the decisions below are design choices grounded in the existing codebase and the documented API contract.

## 1. Current state vs. spec (gap analysis)

| Spec requirement | Current state | Gap |
|---|---|---|
| `GET /coachee/dashboard` (Home: next class + joinable list + waiting-list count) | `classes.ts:347` returns `501 NOT_IMPLEMENTED` | ⚠️ implement the handler + use case + DTO |
| Next class = soonest future enrolled class | `ClassEnrollment` + `TrainingClass` models exist; no selection logic anywhere | ⚠️ new derivation must be added to a pure domain service |
| Joinable list = within reach + open spot + not enrolled + 10-day window | `ReachCalculator.isWithinReach`, `ClassVisibility.classifyVisibility`, `CapacityValidator` exist as pure services | ✅ building blocks exist; a dashboard-specific filter must reuse them, not duplicate |
| Calendar visibility colors (blue/green/gray) | `GET /classes` already returns `visibility` per class for Coachees (`ListTrainingClasses` + `classifyVisibility`, and `toTrainingClassDTO` spreads it); frontend admin/coach `ClassCalendar` exists but colors by *type* (`CLASS_TYPE_COLORS`) | ✅ server data already there; ⚠️ frontend needs a Coachee-specific color mapping + view |
| Home page shows real data | `CoacheeHomePage` is a static placeholder with hardcoded "no upcoming classes" | ⚠️ replace with real dashboard consumption |
| Calendar page 1-week view | `CoacheeCalendarPage` is an empty placeholder | ⚠️ build the visibility-colored week view |
| Loading / empty / error states + pull-to-refresh | No shared pattern; `ClassCalendar`/`MobileDayView` show ad-hoc loading/error text; no pull-to-refresh exists anywhere | ⚠️ add states and a lightweight touch-based refresh hook |
| Non-Coachee access refused | `requireRole` middleware exists; dashboard route currently has no guard | ⚠️ guard the new handler |
| Active waiting-list count | `WaitingList` model exists (`coachee_id`, `class_id`, `###unique`) | ✅ count by coachee where class ACTIVE |

## 2. Key design decisions

### D1 — `CoacheeDashboardPolicy` pure domain service (Constitution §I/II)
- **Decision**: new `src/domain/services/CoacheeDashboardPolicy.ts` exposing pure functions:
  - `pickNextClass(enrolledClasses)` → the soonest `start_time` among `status = ACTIVE` classes with `start_time >= now`, or `null`.
  - `isJoinable(cls, viewerContext)` → `true` iff `class_type = GROUP`, `status = ACTIVE`, not already enrolled, has an open spot (`enrollments < 4`), and `isWithinReach(viewerLevelSortOrder, classLevelSortOrder)`.
  - `filterJoinable(classes, viewerContext)` → `Object.freeze`-style pure array filter over `isJoinable`.
  - `countActiveWaitingLists(entries)` → count of entries whose `class.status = ACTIVE`.
  - Window helpers: `joinableWindow(nowInstant)` → `[start of today in gym tz, start of today + 10 wall-clock days]` using `TimeZoneMath` (`zonedWallClockParts`/`zonedDateTimeToUtc`/`addWallClockDays`).
- **Rationale**: the constitution mandates business rules in `src/domain/` with zero infrastructure imports and 100% branch coverage; `EnrollmentPolicy` (011) and `ClassCancellationPolicy` (008) set the precedent. The dashboard rules are simple but must live in a testable pure service, not in a Prisma-touching use case.
- **Alternatives considered**: inline derivations in `GetCoacheeDashboard` (rejected — violates §I, blocks clean 100% branch coverage, mixes query orchestration with rules); reusing `classifyVisibility` directly for joinability (partially reused — it already encodes reach+open-spot+enrolled, but the dashboard also needs type/status filtering and a per-page response shape, so the policy composes it rather than the use case inlining SQL filters).

### D2 — Query strategy for the dashboard (no schema change)
- **Decision**: `GetCoacheeDashboard.execute({ coacheeId, now })` issues three Prisma queries:
  1. **next class candidate**: the coachee's `ClassEnrollment` rows including `class` (+ `assignedCoach`, `level`), ordered by `class.start_time`; the policy picks the soonest ACTIVE future one.
  2. **joinable candidates**: `TrainingClass` where `class_type = GROUP`, `status = ACTIVE`, `start_time` within the computed 10-day window, including `level`, `assignedCoach`, `enrollments`; the policy filters to joinable (reach + open spot + not enrolled).
  3. **waiting-list rows**: the coachee's `WaitingList` entries including `class`; the policy counts ACTIVE ones.
  Coachee level (`User.level.sort_order`) is loaded once and passed into the policy as `viewerContext`.
- **Rationale**: three narrow, parameterized Prisma queries keep the read cheap at gym scale and keep every domain decision (which class is "next", which is "joinable", what counts as "active") inside the pure policy for testing. The window boundaries are computed in gym wall-clock time via `TimeZoneMath` so DST transitions cannot shift the window.
- **Alternatives considered**: a single "everything" query returning all classes + all enrollments + all waiting lists (rejected — too much data moved and the derivations would still be needed); computing the window in UTC (rejected — the spec fixes the window to the Madrid calendar date).

### D3 — Dashboard response shape (G4 API contract)
- **Decision**: a dedicated `infrastructure/dto/coacheeDashboardDto.ts` mapper that returns exactly the `docs/api-specifications.md` §`GET /coachee/dashboard` shape:
  - `nextClass`: `{ id, classType, startTime, assignedCoach: { id, name }, level: { id, name, color } | null, status } | null`
  - `joinableClasses`: `[{ id, classType (GROUP), startTime, level: { id, name, color }, assignedCoach: { id, name }, enrollmentCount, capacity, isWithinReach, hasOpenSpots }]`
  - `activeWaitingListCount`: number
  - No `data`/`meta` wrapper — a single-resource response returned directly (matches the doc and the api-spec-validator contract).
- **Rationale**: lean response = no risk of leaking other Coachees' names (the joinable list only includes group classes, and the DTO never maps `enrollments` details) and exact alignment with the documented contract.
- **Alternatives considered**: reusing `toTrainingClassDTO` for `nextClass` (rejected — it would leak `enrolledCoachees`, `waitingListCount`, etc. beyond the contract); wrapping in `{ data: ... }` (rejected — the doc says single resource direct).

### D4 — Doc `status` casing fix
- **Decision**: correct `docs/api-specifications.md` §`GET /coachee/dashboard` so `nextClass.status` reads `"ACTIVE"` (uppercase) instead of `"active"`, matching every other class response in the API (the DTO enum `ClassStatus`). This is a doc-only consistency edit; no breaking change.
- **Rationale**: G4 requires the docs to stay authoritative and consistent; the api-spec-validator cross-checks route implementations against it.
- **Alternatives considered**: emitting lowercase `"active"` just for this endpoint (rejected — inconsistent with the rest of the API and the DTO enum).

### D5 — Calendar colors come from the server (`visibility`), never recomputed
- **Decision**: a pure frontend util `domain/utils/coacheeCalendarEvents.ts` maps each class to a schedule-x event using the server-provided `visibility`:
  - `blue` → `#3b82f6`, `green` → `#10b981`, `gray` → `#6b7280` (reusing the existing `CLASS_TYPE_COLORS`/`CANCELED_CLASS_COLOR` hex values so admin/coach and coachee views stay visually consistent).
  - Canceled classes always render gray regardless of `visibility`.
  - Gray entries title masked as "Busy" — no other Coachee names (the API already returns empty `enrolledCoachees` for gray classes; the util must not render names client-side).
- **Rationale**: the backend already computes `visibility` via pure `classifyVisibility`; deriving the color from authoritative server data keeps the rules single-sourced and testable as a pure function (mirrors D5 of 011).
- **Alternatives considered**: re-deriving reach/capacity client-side to color the calendar (rejected — duplicates backend rules and drifts); keeping the type-based `CLASS_TYPE_COLORS` for coachees (rejected — blue must mean "mine", green "joinable", gray "other/busy", not type).

### D6 — Coachee calendar view construction
- **Decision**: a dedicated `CoacheeCalendarView` that reuses the existing `@schedule-x/calendar` `createViewWeek` pattern (as `ClassCalendarDesktop` does — same timezone `Europe/Madrid`, day bounds 06:00–24:00) but:
  - no admin/coach filters (type/coach selects omitted),
  - event color from `visibility` via D5 util,
  - `onEventClick` opens `CoacheeClassDetailModal` for the tapped class.
  Mobile keeps the same component (schedule-x week is responsive); if the pixel grid proves too dense on narrow screens, the mobile variant falls back to the existing `MobileDayView` layout pattern re-colored via the D5 util. The decision is deferred to implementation with a single component first.
- **Rationale**: one component, one data source (`useListClasses` over the week), no new calendar dependency; reuses the tested schedule-x integration already in the codebase.
- **Alternatives considered**: building a bespoke CSS grid calendar from scratch (rejected — duplicates what schedule-x already provides and is a regression risk); reusing `ClassCalendar` wholesale (rejected — it embeds admin/coach concerns: coach filter, add-class affordances, type coloring).

### D7 — Tap surfaces: Join/Cancel reuse 011, waiting-list is an affordance
- **Decision**: `CoacheeClassDetailModal` (desktop week) and the Home `JoinableClassList` reuse the existing `useJoinClass` / `useCancelEnrollment` hooks and `enrollmentErrorMessage` mapping from US-3.1 for real Join/Cancel actions. For a gray class that is a full group within reach or an occupied individual slot, the modal surfaces the **"Join waiting list"** option as a labeled affordance (disabled in this release — execution is US-3.3). Blue classes show class detail with the Cancel action.
- **Rationale**: the spec (FR-008) requires the right tap option per color; executing the actual waiting-list join/leave is explicitly US-3.3. Surfacing the option now keeps the calendar honest without scope-creeping into US-3.3.
- **Alternatives considered**: building the waiting-list join flow now (rejected — US-3.3 owns it; PRD defers auto-processing to EP-04); opening the existing `ClassDetailView` for every entry (rejected — it is a general detail modal; the Coachee-specific action surface is smaller and color-aware).

### D8 — Pull-to-refresh without a new dependency
- **Decision**: `infrastructure/hooks/usePullToRefresh.ts` implements a lightweight touch-based pull-to-refresh on the Coachee layout's scroll container (`<main class="overflow-auto">` in `CoacheeLayout`): listens to `touchstart`/`touchmove`/`touchend`, activates when `scrollTop === 0` at gesture start, tracks the pull distance, shows a spinner above a threshold, and calls the active view's React Query `refetch`. Desktop gets an equivalent "Refresh" button for parity.
- **Rationale**: no existing pull-to-refresh library is installed; adding one violates the "no new dependencies unless needed" discipline (G5). The gesture is ~60 lines and testable in isolation.
- **Alternatives considered**: `react-custom-scrollbars`/`react-pull-to-refresh` deps (rejected — new dependency for a small behavior); relying only on React Query's `refetchOnWindowFocus` (rejected — the AC explicitly requires the pull gesture); a manual "Refresh" button only (rejected — AC requires pull-to-refresh on mobile).

## 3. Test & validation strategy

- **Red-Green** (Constitution §II): write `CoacheeDashboardPolicy.test.ts` first covering every branch — `pickNextClass` (none, single, multiple ordered, past class excluded, canceled class excluded); `isJoinable`/`filterJoinable` (group/individual, ACTIVE/CANCELED, reach ±1 and out, full vs open, already enrolled); `countActiveWaitingLists` (ACTIVE vs CANCELED); window boundaries (today start, +10 days). Confirm failing → implement → green. Target 100% branch coverage.
- `GetCoacheeDashboard.test.ts`: happy path + each error path (mock `PrismaClient`); non-Coachee forbidden.
- `coachee.dashboard.int.test.ts` (Supertest): one happy-path test asserting the full documented shape (next class + joinable list + count), a no-next-class case, a no-joinable case, a zero-waiting-lists case, a 403 for Coach/Admin tokens, and an unauthenticated 401.
- Frontend: `coacheeCalendarEvents.ts` unit tests (visibility→color matrix, canceled→gray, gray title masking) and `nextClassInfo.ts` derivation tests; `usePullToRefresh` hook behavior via a small component/hook test; manual scenarios via `quickstart.md`.

## 4. Risks / mitigations

- **DTO/contract drift**: the endpoint is already documented; the integration test asserts the exact documented shape and fields so implementation cannot silently diverge (plus the doc `status` casing fix in D4).
- **Color/visibility mismatch**: colors are driven by server `visibility`; the pure util is unit-tested against the blue/green/gray matrix, and the calendar P1 acceptance scenario requires 100% of entries correctly colored.
- **Pull-to-refresh fragility**: gesture triggers only at `scrollTop === 0`; refetch is idempotent via React Query; a failed fetch during refresh is handled by the existing error state (no silent blank).
- **Mobile density**: schedule-x week on very narrow screens is addressed by a mobile day-list fallback per D6; the single-component-first approach keeps the fallback cheap.
- **Time window DST**: window math uses `TimeZoneMath.zonedDateTimeToUtc`/`addWallClockDays` (already unit-tested) so the 10-day window is stable across Madrid DST transitions.
- **Student-visible data leak**: the dashboard DTO never maps enrollment details; gray calendar events render "Busy" with no names — covered by the DTO shape and the gray-title unit tests.