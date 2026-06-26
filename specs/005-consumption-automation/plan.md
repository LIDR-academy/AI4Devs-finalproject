# Implementation Plan: Consumption Automation for Long-Expired Items

**Branch**: `005-consumption-automation` | **Date**: 2026-06-26 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-consumption-automation/spec.md`

## Summary

Add a proactive cleanup layer for pantry items that have been expired for a long time. A daily
background job detects items whose `expirationDate` is older than the user's threshold (default
14 days), records an `AutoExpiryDigest`, and requests a digest notification. The frontend surfaces
these "stale candidates" as a banner on the pantry page leading to a bulk-review sheet where the
user can waste them all, keep specific items, or dismiss the batch (suppressed for a 7-day grace
period). A second background pass auto-wastes any candidates left unresolved after the 7-day grace,
tagging those waste events as automatic. Auto-expiry is per-user configurable (enable/disable +
threshold) via settings stored on the existing `NotificationPreference` row. All bulk and settings
operations are user-scoped and JWT-protected. Background jobs reuse the existing `setInterval`
scheduler pattern (`notifications.scheduler.ts` / `gamification-cron.service.ts`) and degrade
gracefully when notification delivery is unavailable — the in-app banner is the fallback.

## Technical Context

**Language/Version**: TypeScript 5.x — backend NestJS (CommonJS, Node ≥ 20), frontend TanStack
Start/Router (ESM, React 19).

**Primary Dependencies**: NestJS, Prisma ORM, PostgreSQL, `class-validator`/`class-transformer`
(backend); TanStack Router, TanStack Query, Radix UI, lucide-react (frontend). No new runtime
dependencies — the daily detection and auto-resolve passes reuse the existing `setInterval`-based
scheduler pattern, not `@nestjs/schedule`.

**Storage**: PostgreSQL via Prisma. One new model (`AutoExpiryDigest`); two new fields on
`NotificationPreference` (`autoExpiryEnabled`, `autoExpiryThresholdDays`); one new nullable field
on `ConsumptionEvent` (`method`) to tag automatic waste. `PantryItem` is read-only here.

**Testing**: Jest (backend unit + e2e via `test/*.e2e-spec.ts`), Vitest (frontend component),
Playwright (frontend e2e). TDD per Constitution I.

**Target Platform**: AWS-hosted web service + SSR/SPA web client.

**Project Type**: Web application (monorepo: `back/` NestJS API, `front/` TanStack Start).

**Performance Goals**: Expired-candidates endpoint returns in < 2 s. Background passes run off any
user request's critical path. Bulk-waste is atomic (single transaction).

**Constraints**: Bulk-waste MUST be all-or-nothing (FR-005). Auto-waste MUST NOT fire before the
7-day grace (FR-009/SC-003). Notification unavailability MUST NOT fail detection (FR-016/SC-007).
Per-user job failures MUST be isolated (FR-017). All endpoints JWT-protected and user-scoped
(FR-015/SC-006). Disabled users get zero digests and zero auto-waste (FR-011/SC-004).

**Scale/Scope**: Single-user-scoped aggregates. Two REST surfaces (pantry bulk ops, auto-expiry
settings — 5 endpoints), one Prisma model + three field additions, one cron service with two
passes, one frontend banner + review sheet + settings toggle.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify against RealSaveFooding Constitution v1.0.0:

- [x] **I. TDD** — Every service method (expired-candidates query, bulk-waste, bulk-dismiss,
  settings read/write, daily-digest pass, auto-resolve pass, digest delivery) and each controller
  gets a failing-test-first task; frontend banner/review/settings covered by Vitest. Enumerated in
  Phase 1 / handed to `/speckit-tasks`.
- [x] **II. Baby steps** — Decomposes into: schema migration → settings service → settings
  endpoints → expired-candidates query → candidates endpoint → bulk-waste → bulk-dismiss → daily
  digest pass → auto-resolve pass → digest delivery → frontend api → banner → review sheet →
  settings toggle. Each is independently testable.
- [x] **III. Type safety** — Strict TS; Prisma client types are the source of truth for
  `AutoExpiryDigest`/`NotificationPreference`/`ConsumptionEvent`; DTOs typed and validated; no `any`.
- [x] **IV. English only** — All artifacts in English.
- [x] **V. Clear naming** — `getExpiredCandidates`, `bulkWasteItems`, `bulkDismissExpired`,
  `getAutoExpirySettings`, `updateAutoExpirySettings`, `runDailyDigestPass`, `runAutoResolvePass`,
  `deliverDigest`, `AutoExpiryCronService` — intent-revealing; no `data`/`handler`/`util`.
- [x] **VI. Assumptions audited** — Schema reconciliation (no `PantryItem.status`, no
  `ConsumptionEvent.method`), the candidate-suppression model, grace-period semantics, and the two
  ticket Open Questions are stated and resolved in research.md; spec Assumptions cover the rest.
- [x] **VII. Pattern scan** — Reuses existing patterns: pantry module/controller/service layout,
  `registerEvent` transaction + delete-on-event mechanic, `JwtAuthGuard` + `RequestWithUser`,
  `setInterval` scheduler (`notifications.scheduler.ts` / `gamification-cron.service.ts`),
  `NotificationDeliveryService` for digest push/email, `NotificationPreference` for settings,
  TanStack Query API bindings (`pantry.api.ts`). No new abstraction where one exists.

**Result**: PASS — no violations; Complexity Tracking left empty.

## Project Structure

### Documentation (this feature)

```text
specs/005-consumption-automation/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   ├── pantry-expiry.openapi.yaml
│   └── auto-expiry-settings.openapi.yaml
├── checklists/
│   └── requirements.md  # /speckit-specify quality checklist
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created here)
```

### Source Code (repository root)

```text
back/
├── prisma/
│   ├── schema.prisma                                  # +AutoExpiryDigest, +NotificationPreference fields, +ConsumptionEvent.method
│   └── migrations/<ts>_add_auto_expiry/               # generated migration
├── src/modules/pantry/
│   ├── pantry.service.ts                              # +getExpiredCandidates, +bulkWasteItems, +bulkDismissExpired
│   ├── pantry.service.spec.ts                         # +unit tests
│   ├── pantry.controller.ts                           # +GET expired-candidates, +POST bulk-waste, +POST bulk-dismiss-expired
│   ├── auto-expiry-cron.service.ts                    # NEW: daily digest pass + auto-resolve pass
│   ├── auto-expiry-cron.service.spec.ts               # NEW: unit tests
│   ├── pantry.module.ts                               # wire cron service + notifications dependency
│   └── dto/
│       ├── bulk-waste.dto.ts                          # NEW
│       └── bulk-dismiss-expired.dto.ts                # NEW
└── src/modules/notifications/
    ├── notifications.controller.ts                    # +GET/PATCH settings/auto-expiry
    ├── notifications.controller.spec.ts               # +unit tests
    ├── notification-preferences.service.ts            # +getAutoExpiry, +updateAutoExpiry
    ├── notification-preferences.service.spec.ts       # +unit tests
    ├── notification-delivery.service.ts               # +deliverDigest (+ summary variant)
    ├── notification-delivery.service.spec.ts          # +unit tests
    └── dto/auto-expiry-settings.dto.ts                # NEW

front/
├── src/features/pantry/pantry.api.ts                  # +getExpiredCandidates, +bulkWaste, +bulkDismissExpired bindings
├── src/features/settings/settings.api.ts              # +getAutoExpiry, +updateAutoExpiry (path mirrors existing settings api)
├── src/routes/pantry.tsx                              # +expired-items banner
├── src/routes/pantry.test.tsx                         # +banner tests
├── src/routes/settings.tsx                            # +auto-expiry toggle + threshold input
├── src/components/ExpiredItemsReview.tsx              # NEW: bulk-review sheet
└── src/components/ExpiredItemsReview.test.tsx         # NEW: Vitest

back/test/auto-expiry.e2e-spec.ts                      # NEW: integration (detect → digest → auto-resolve)
```

**Structure Decision**: Web application monorepo. The feature lives almost entirely in the existing
`pantry` module (detection, bulk ops, cron) and `notifications` module (settings, digest delivery),
mirroring the gamification feature's split. No new module is introduced — pattern scan (VII)
confirms the pantry and notifications modules already own these responsibilities.

## Complexity Tracking

> No constitution violations. Section intentionally empty.
