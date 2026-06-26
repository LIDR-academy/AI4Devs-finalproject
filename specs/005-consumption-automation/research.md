# Phase 0 Research: Consumption Automation for Long-Expired Items

This document resolves the open design questions and reconciles the ticket
(`docs/tickets/extendedMVP/EXT-010-consumption-automation.md`) with the **actual** codebase, which
differs from the ticket's assumptions in two material ways.

## R1. What "active pantry item" means (schema reconciliation)

**Decision**: An "active" pantry item is simply a `PantryItem` row that still exists. Expired
candidates are `PantryItem` rows where `expirationDate < now - thresholdDays`. No status filter.

**Rationale**: The ticket assumes `PantryItem.status = ACTIVE`, but the real schema
(`back/prisma/schema.prisma`) has **no `status` field** on `PantryItem`. Consuming or wasting an
item *deletes* the `PantryItem` row and creates a `ConsumptionEvent` (`pantry.service.ts`
`registerEvent`). So a row's mere existence already means "active/unresolved". `getUseNext` follows
the same convention (`consumptionEvents: { none: {} }`). Following this avoids inventing a status
column that the rest of the system does not use (Constitution VII — no new abstraction).

**Alternatives considered**: Adding a `status` enum to `PantryItem` to match the ticket — rejected:
it would duplicate the existing "row exists = active" semantics and require touching every pantry
query. Soft-delete — rejected: the codebase uses hard delete + event record consistently.

## R2. How to tag automatically-wasted items (schema reconciliation)

**Decision**: Add a nullable `method String?` field to `ConsumptionEvent`. Manual waste leaves it
`null`; auto-waste sets it to `"AUTO_EXPIRED"`. The expired-candidates/bulk paths set it `null`
(user-initiated); only the auto-resolve pass sets `"AUTO_EXPIRED"`.

**Rationale**: The ticket says `ConsumptionEvent` "may already have a method/source field" — it does
**not**. It offers two options: a `method` field or overloading `notes`. `ConsumptionEvent` already
has an `itemNotes` field that snapshots the *item's* notes; writing `"AUTO_EXPIRED"` there would
clobber real user notes and make SC-005 ("100% of automatically wasted items are distinguishable")
fragile. A dedicated nullable `method` field is explicit, type-safe, and queryable. Kept as a
nullable `String?` (not a Prisma enum) for forward flexibility and to match the lightweight string
columns already used elsewhere (`NotificationLog.type/channel/status`); validated in code.

**Alternatives considered**: Boolean `autoExpired` — rejected: less extensible if future automatic
sources appear, and a named method reads better. Reusing `ExpirationMethod` enum — rejected: that
enum belongs to `ExpirationAssessment` and has unrelated values (`RULE_BASED_SPAIN`, etc.).
Overloading `itemNotes` — rejected: data-loss risk described above.

## R3. Auto-expiry settings storage

**Decision**: Add `autoExpiryEnabled Boolean @default(true)` and
`autoExpiryThresholdDays Int @default(14)` to the existing `NotificationPreference` model. Expose
via the existing notifications controller at `GET`/`PATCH /settings/auto-expiry`.

**Rationale**: `NotificationPreference` is the established per-user single-row preferences store
(`@unique userId`) and already backs `GET`/`PATCH /settings/notifications`. The ticket explicitly
extends this model. Defaults satisfy FR-018 (existing rows get defaults via Prisma column defaults —
no backfill, no data loss). The settings endpoints live in `notifications.controller.ts` alongside
`settings/notifications`, served by `NotificationPreferencesService`.

**Alternatives considered**: A separate `AutoExpirySetting` model — rejected: a second per-user
single-row preferences table duplicates `NotificationPreference` (Constitution VII).

**Validation**: `thresholdDays` constrained to 7–60 inclusive (FR-012) via `class-validator`
(`@IsInt`, `@Min(7)`, `@Max(60)`); `enabled` is `@IsBoolean`.

## R4. Candidate suppression and the digest lifecycle (reconciling banner vs. dismiss)

The ticket's task 3 ("exclude items covered by a PENDING digest in the last 7 days") conflicts with
the banner requirement (a PENDING digest is exactly when the user *should* see the banner to act).
We resolve this with one coherent lifecycle:

**Decision**:

- `AutoExpiryDigest.status` ∈ `PENDING` | `USER_RESOLVED` | `AUTO_RESOLVED`.
- **`getExpiredCandidates(userId)`** (pure query): returns all stale `PantryItem`s
  (`expirationDate < now - threshold`). It does **not** itself consult digests.
- **`GET /pantry/items/expired-candidates`** (endpoint): returns the stale candidates **unless** a
  `USER_RESOLVED` digest exists for the user with `resolvedAt > now - 7 days` (dismiss
  suppression → return empty, banner hidden). Attaches `digestId` = the user's current `PENDING`
  digest id, or `null`.
- **Daily digest pass**: for each user with `autoExpiryEnabled`, if `getExpiredCandidates` is
  non-empty **and** the user has no `PENDING` digest **and** no digest created within the last
  7 days → create a `PENDING` digest and call `deliverDigest`.
- **Bulk-waste / bulk-dismiss**: resolve the user's `PENDING` digest to `USER_RESOLVED`
  (`resolvedAt = now`). Dismiss thereby starts the 7-day banner-suppression window.
- **Auto-resolve pass**: for each `PENDING` digest with `sentAt < now - 7 days`, re-query the
  still-stale candidates and auto-waste them (`method = AUTO_EXPIRED`), then set the digest
  `AUTO_RESOLVED` (`resolvedAt = now`).

**Rationale**: A user-level digest (the ticket's model — `AutoExpiryDigest` stores no item list)
works because candidates are *deterministic* from `expirationDate` + threshold, so any pass can
re-derive them. Suppression keys off a recently `USER_RESOLVED` digest, which cleanly implements
the 7-day dismiss assumption (spec Assumption / Open Question 1) without an item-level join table.
A `PENDING` digest keeps the banner visible (the user was notified and must act), matching FR-014.

**Alternatives considered**: Item-level `AutoExpiryDigestItem` join — rejected: unnecessary given
deterministic candidates; adds a table and write amplification for no behavioral gain (YAGNI, VII).
Suppressing on *any* digest in 7 days including PENDING — rejected: would hide the banner during the
active review window, defeating the in-app fallback (FR-016/SC-007).

## R5. Bulk-waste atomicity and reuse of the waste mechanic

**Decision**: `bulkWasteItems(userId, itemIds)` validates every item belongs to the user's
household (reusing `resolveHouseholdUserIds`), then in a **single `$transaction`** creates a
`WASTED` `ConsumptionEvent` (with `method` left `null`) and deletes the `PantryItem` for each id —
the same create-event + delete-item pair `registerEvent` already performs — and resolves the
`PENDING` digest. If any id is invalid/foreign or any write fails, the whole transaction rolls back
and the endpoint returns the failing ids (FR-005, error-handling section of the ticket).

**Rationale**: Mirrors `registerEvent`'s proven transaction shape so behavior (estimated value,
event snapshot fields) stays consistent. A single `$transaction` gives all-or-nothing semantics for
free. Gamification's fire-and-forget `processConsumptionEvent` hook may be invoked per event after
commit (out of the transaction) to keep points consistent, but a failure there must not fail the
bulk action — same swallow-and-log policy as `registerEvent`.

**Alternatives considered**: Per-item independent commits with partial success — rejected: FR-005
requires atomicity and the ticket specifies rollback on partial failure. Calling `registerEvent` in
a loop — rejected: it opens one transaction per item (not atomic across the batch) and re-runs
household resolution N times.

## R6. Scheduling: one cron service, two passes

**Decision**: A single `AutoExpiryCronService` (in the pantry module) implementing
`OnModuleInit`/`OnModuleDestroy` with a `setInterval`, guarded by `process.env.NODE_ENV === "test"`
(no timers in tests). On each tick it runs two idempotent passes — `runDailyDigestPass` and
`runAutoResolvePass`. The interval ticks hourly; each pass uses time-based guards (a date-stamp for
the daily pass; `sentAt < now - 7d` for auto-resolve) so the exact tick cadence does not matter.

**Rationale**: Directly mirrors `notifications.scheduler.ts` and `gamification-cron.service.ts`,
which both use `setInterval` + the `NODE_ENV==='test'` guard rather than `@nestjs/schedule` (plan
Technical Context: no new dependency). One service hosting both passes keeps wiring minimal; the
business logic of each pass is unit-tested directly by calling the pass method with an injected
`now`, independent of the timer (matching how `gamification-cron` tests call `evaluateZeroWasteWeek`).

**Alternatives considered**: `@nestjs/schedule` `@Cron` decorators — rejected: introduces a new
dependency and diverges from the two existing schedulers. Two separate cron services — rejected:
unnecessary duplication of the timer lifecycle boilerplate.

**Per-user isolation (FR-017)**: each pass iterates users/digests inside a `try/catch` per user and
logs-and-continues on error, so one user's failure never aborts the batch.

## R7. Digest delivery and graceful degradation

**Decision**: Add `deliverDigest(userId, items, userEmail)` to `NotificationDeliveryService`, and a
summary variant for the post-auto-resolve notification (spec Assumption / Open Question 2). Both
follow the existing never-throw policy: wrap email/push in try/catch, log on failure, and return
normally. The daily pass **always** creates the `AutoExpiryDigest` first, then attempts delivery —
so if delivery is unavailable (EXT-001 not live / no push subscription / SES error), the digest
still exists and the in-app banner serves as the fallback (FR-016/SC-007).

**Rationale**: `deliverExpiry`/`deliverBadge` already establish the never-throw, log-on-failure
pattern with email (SES) + optional web-push. `deliverDigest` reuses that exact shape. Creating the
digest *before* delivery decouples the durable record (drives the banner) from best-effort delivery.

**Alternatives considered**: Failing the pass when delivery fails — rejected: violates FR-016 and
the ticket's "degrade gracefully" requirement. Sending the summary unconditionally — rejected:
Open Question 2's recommendation is to send it only when delivery is available.

## R8. Frontend integration points

**Decision**: Add API bindings to `front/src/features/pantry/pantry.api.ts`
(`getExpiredCandidates`, `bulkWaste`, `bulkDismissExpired`) using the existing `requestJson` helper
and auth headers, and settings bindings (`getAutoExpiry`, `updateAutoExpiry`) in a settings api
module consumed by `settings.tsx`. The pantry route renders a dismissible banner when candidates
exist, opening a new `ExpiredItemsReview` component (Radix dialog/sheet, matching existing UI
primitives). Settings gains an "Auto-expire stale items" toggle + threshold number input (7–60).

**Rationale**: `pantry.api.ts` already centralizes pantry HTTP calls with typed payloads and an
`ApiError`/`WasteConfirmationRequiredError` convention; new calls follow it. TanStack Query
invalidation after bulk actions refreshes the pantry list and hides the banner (FR-014).

**Alternatives considered**: A separate hooks layer — rejected: the existing api-module + component
pattern is the established convention; no new abstraction needed (VII).

## Resolved unknowns summary

| # | Question | Resolution |
|---|----------|------------|
| R1 | "active" item definition | Row exists; candidates = `expirationDate < now - threshold` (no `status` column) |
| R2 | auto-waste tagging | New nullable `ConsumptionEvent.method`; `"AUTO_EXPIRED"` for auto, `null` for manual |
| R3 | settings storage | Extend `NotificationPreference`; endpoints `GET/PATCH /settings/auto-expiry`; threshold 7–60 |
| R4 | banner vs. dismiss suppression | Banner shows on stale candidates; `USER_RESOLVED` digest < 7d suppresses; PENDING keeps banner |
| R5 | bulk-waste atomicity | Single `$transaction`, all-or-nothing, return failing ids on rollback |
| R6 | scheduling | One `AutoExpiryCronService`, `setInterval` + `NODE_ENV` guard, two idempotent passes, per-user try/catch |
| R7 | delivery degradation | Create digest first, then best-effort never-throw `deliverDigest`; banner is fallback |
| R8 | frontend | Extend `pantry.api.ts` + settings api; banner → `ExpiredItemsReview` sheet; settings toggle |

No `NEEDS CLARIFICATION` markers remain.
