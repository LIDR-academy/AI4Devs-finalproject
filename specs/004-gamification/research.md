# Phase 0 Research: Gamification and Achievement System

All unknowns from the Technical Context are resolved below. Each decision records the chosen
approach, why, and the alternatives rejected.

## Decision 1: Where to hook points processing into the consume/waste flow

**Decision**: Call `PointsService.processConsumptionEvent(eventId)` from
`PantryService.registerEvent`, **after** the `$transaction` that creates the `ConsumptionEvent`
(and deletes the pantry item) commits. Wrap the call in `try/catch`, log on error, never rethrow.

**Rationale**: `registerEvent` is the single creation point for `ConsumptionEvent`
(`back/src/modules/pantry/pantry.service.ts:167`). It returns `{ id }`. Passing the id and having
`PointsService` re-read the full event keeps the pantry transaction unchanged and avoids coupling
pantry to gamification field shapes. Fire-and-forget after commit satisfies FR-018/SC-002 (consume
must never fail because of gamification).

**Alternatives considered**:
- *Prisma middleware / `$extends` on `consumptionEvent.create`* — rejected: hidden control flow,
  harder to test, violates Constitution V (clarity).
- *Domain event bus* — rejected: project has no event-bus pattern for this; introducing one
  violates Constitution VII (YAGNI). `notification-events.publisher.ts` is notification-specific.
- *Include points write inside the existing transaction* — rejected: a points failure would roll
  back the consume, directly violating FR-018.

## Decision 2: Weekly ZERO_WASTE_WEEK evaluation mechanism

**Decision**: Implement `GamificationCronService` using the existing `setInterval` +
`OnModuleInit`/`OnModuleDestroy` pattern from `notifications.scheduler.ts`. The service checks on
each tick whether a new Mon–Sun week has completed and, if so, evaluates `ZERO_WASTE_WEEK` for
every user with ≥ 1 event in that week. Tick cadence is hourly; the "has this week already been
processed" guard prevents duplicate evaluation.

**Rationale**: The codebase has **no** `@nestjs/schedule` dependency; the established scheduling
pattern is `setInterval`-based (`notifications.scheduler.ts:18`). Reusing it honours Constitution
VII (pattern reuse, no new dependency). Badge idempotency (`@@unique([userId, code])` plus the
per-week guard) makes the exact firing time non-critical.

**Alternatives considered**:
- *Add `@nestjs/schedule` with `@Cron("55 23 * * 0")`* — rejected: new dependency for a capability
  the existing pattern already covers.
- *Evaluate ZERO_WASTE_WEEK inline on every consume* — rejected: a week isn't "complete" until it
  ends; inline evaluation cannot know the week finished waste-free.

**Note**: `ZERO_WASTE_WEEK` is keyed per ISO week. Because `UserBadge` enforces one row per
`(userId, code)`, a once-per-week badge needs the code to encode the week (e.g.
`ZERO_WASTE_WEEK`), OR we accept it as a single lifetime badge. **Resolved**: treat
`ZERO_WASTE_WEEK` as a **single lifetime badge** (earned the first qualifying week) to match the
ticket's `@@unique([userId, code])` data model; the *weekly streak counter* (Decision 5) provides
the ongoing per-week signal. This keeps the data model exactly as specified and avoids per-week
badge-code proliferation.

## Decision 3: Points reasons and milestone counting

**Decision**: `UserPoints.reason` is a string drawn from a fixed set:
`CONSUMED_BEFORE_EXPIRY` (+10), `BONUS_3_DAYS` (+5), `WASTED` (−5). Consuming past expiry writes
**no** row (0 points, nothing to persist). The "items consumed before expiry" count used for
`FIRST_SAVE` / `SAVER_10/50/100` milestones is the **count of `UserPoints` rows with reason =
`CONSUMED_BEFORE_EXPIRY`** (exactly one per qualifying event; the `BONUS_3_DAYS` row never
double-counts).

**Rationale**: One base row per qualifying consume gives a clean, index-friendly count and keeps
points history human-readable. Separating the bonus into its own row makes the +5 explainable in
the history view (US3).

**Alternatives considered**:
- *Single combined row of +15* — rejected: history can't explain the bonus separately; milestone
  counting would need to parse amounts.
- *Counting `ConsumptionEvent`s directly* — rejected: would require re-deriving "before expiry" at
  read time; the `CONSUMED_BEFORE_EXPIRY` row already encodes that judgement once.

## Decision 4: "Value saved" definition for MONEY_SAVER_10

**Decision**: "Value saved" = sum of `estimatedValueEur` over `ConsumptionEvent`s that are
`CONSUMED` **and** were before expiry (the same events that earned `CONSUMED_BEFORE_EXPIRY`).
`MONEY_SAVER_10` is awarded when that cumulative sum ≥ €10. `estimatedValueEur` is a Prisma
`Decimal`; aggregate with Prisma's `aggregate`/`_sum` and compare using `Decimal`/`Number` without
floating-point drift at the cent level.

**Rationale**: Aligns the money milestone with the points-earning definition (spec FR-010 says
"items saved (consumed before expiry)"). The ticket's badge note said "CONSUMED events" loosely;
the spec is authoritative and "before expiry" is the consistent, defensible meaning of "saved".

**Alternatives considered**:
- *All CONSUMED events incl. past-expiry* — rejected: counts items that earned 0 points as
  "saved", contradicting the spec's framing and confusing users.

## Decision 5: Weekly streak computation

**Decision**: `weeklyStreak` is **derived at read time** in `GamificationService.getSummary`. Walk
backwards from the most recently completed Mon–Sun week, counting consecutive weeks that each had
≥ 1 event and 0 `WASTED` events; stop at the first week that breaks the rule (a week with a waste
event, or — for weeks within the active span — a week with no activity). Bound the walk to a
reasonable maximum (e.g. 52 weeks) to keep it O(1) in practice.

**Rationale**: Streak is inherently a derived, point-in-time value; storing it would require
mutation on every event and risks drift. Deriving from `ConsumptionEvent` (already indexed by
`userId, occurredAt`) is simple and correct.

**Alternatives considered**:
- *Persist a streak counter incremented by the weekly job* — rejected: extra mutable state, harder
  to keep consistent, no read-time benefit at this scale.

## Decision 6: Badge push notification integration (EXT-001)

**Decision**: Add `deliverBadge(userId, badgeLabel, badgeDescription)` to
`NotificationDeliveryService`, reusing `webPushService.sendNotification` and writing a
`NotificationLog` row with `type: "BADGE_EARNED"`, `channel: "WEB_PUSH"`. If the user has no push
subscription, skip silently. `BadgeService` calls it after persisting a new badge, inside its own
`try/catch` so notification failure never blocks badge persistence (FR-019).

**Rationale**: `NotificationDeliveryService` already encapsulates push delivery, subscription
lookup, 410-cleanup, and logging (`notification-delivery.service.ts:74`). `NotificationLog.type` is
a free-form `String`, so `"BADGE_EARNED"` needs no schema/enum change.

**Alternatives considered**:
- *Call `webPushService` directly from `BadgeService`* — rejected: duplicates subscription lookup,
  logging, and error handling already in the delivery service (Constitution VII).

## Decision 7: Module layout and access control

**Decision**: New `GamificationModule` mirrors the `insights` module: a controller guarded by
`JwtAuthGuard`, reading `userId` from `RequestWithUser` (`req.user`). Endpoints
`GET /gamification/summary` and `GET /gamification/history?limit&offset`. All queries filter by the
JWT `userId`; no path/query parameter accepts another user's id (FR-020/SC-006). Register the module
in `app.module.ts`. The module exports `PointsService` so `PantryModule` can inject it.

**Rationale**: Direct reuse of the established controller/guard/request pattern (`insights.controller.ts:1-14`).

**Alternatives considered**: none — this is the standard pattern in the repo.

## Decision 8: Frontend dashboard surface and navigation

**Decision**: Render `PointsSummaryWidget` on `front/src/routes/insights.tsx` (the real
authenticated dashboard, which already calls `getDashboardSummary()`), and add a new
`front/src/routes/achievements.tsx` route reached via a "View achievements" link from the widget.
Add an `/achievements` entry to `AppShell` navigation only if it fits the 5-item bottom bar;
otherwise link from the widget to avoid crowding. API bindings follow `insights.api.ts` (fetch +
`getAccessToken` auth header, TanStack Query in the route).

**Rationale**: The ticket references `dashboard.tsx`, which does not exist; `insights.tsx` is the
equivalent surface. Mirroring `insights.api.ts` keeps the frontend consistent (Constitution VII).

**Alternatives considered**:
- *Create a new `dashboard.tsx` route* — rejected: would duplicate the existing insights dashboard
  surface and fragment navigation.

## Resolved unknowns summary

| Unknown | Resolution |
|---|---|
| Hook location | After commit in `PantryService.registerEvent`, fire-and-forget |
| Scheduler | Reuse `setInterval` pattern; no `@nestjs/schedule` |
| ZERO_WASTE_WEEK uniqueness | Single lifetime badge; streak counter carries per-week signal |
| Milestone count source | Count `UserPoints` rows with reason `CONSUMED_BEFORE_EXPIRY` |
| "Value saved" | Sum `estimatedValueEur` of before-expiry CONSUMED events |
| Streak | Derived at read time, bounded backward walk |
| Badge push | New `deliverBadge` on `NotificationDeliveryService`, `type: "BADGE_EARNED"` |
| Dashboard surface | `insights.tsx` widget + new `/achievements` route |
