# Implementation Plan: Gamification and Achievement System

**Branch**: `004-gamification` | **Date**: 2026-06-26 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-gamification/spec.md`

## Summary

Add a points-and-badges layer that rewards users for consuming food before expiry and
penalises waste. The system reads the existing `ConsumptionEvent` signal: when an event is
created in `PantryService.registerEvent`, a new `GamificationModule` computes a point delta,
persists it, and re-evaluates badge conditions — all fire-and-forget so a failure never
breaks the consume/waste action. A weekly background evaluation awards the `ZERO_WASTE_WEEK`
badge. Two read endpoints expose a summary (totals, badges, streak) and a paginated history.
The frontend adds an `/achievements` page and a points widget on the existing dashboard
surface (`insights.tsx`). Badge awards trigger an optional push notification via the existing
`NotificationDeliveryService`.

## Technical Context

**Language/Version**: TypeScript 5.x — backend NestJS (CommonJS, Node ≥ 20), frontend
TanStack Start/Router (ESM, React 19)

**Primary Dependencies**: NestJS, Prisma ORM, PostgreSQL, `class-validator`/`class-transformer`
(backend); TanStack Router, TanStack Query, Radix UI, lucide-react (frontend). No new runtime
dependencies — the weekly job reuses the existing `setInterval`-based scheduler pattern
(`notifications.scheduler.ts`), not `@nestjs/schedule`.

**Storage**: PostgreSQL via Prisma. Two new models: `UserPoints`, `UserBadge`. No changes to
`ConsumptionEvent` (read-only source).

**Testing**: Jest (backend unit + e2e via `test/*.e2e-spec.ts`), Vitest (frontend component),
Playwright (frontend e2e). TDD per Constitution I.

**Target Platform**: AWS-hosted web service + SSR/SPA web client.

**Project Type**: Web application (monorepo: `back/` NestJS API, `front/` TanStack Start).

**Performance Goals**: Summary endpoint returns in < 2 s (SC-001). Points/badge processing runs
off the consume request's critical path (fire-and-forget) so it adds no user-visible latency.

**Constraints**: Gamification computation MUST NOT fail the consume/waste API (FR-018, SC-002).
All endpoints JWT-protected and user-scoped (FR-020, SC-006). User-facing totals clamped to ≥ 0
(FR-007).

**Scale/Scope**: Single-user-scoped aggregates; history paginated (default 20/page). Badge set
is fixed and small (7 badge codes). Weekly job iterates only users with activity in the past week.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify against RealSaveFooding Constitution v1.0.0:

- [x] **I. TDD** — Every service (points, badge, gamification, cron) and the pantry hook has a
  failing-test-first task in tasks.md; controllers covered by unit + e2e tests.
- [x] **II. Baby steps** — Work decomposes into: migration → points engine → badge engine →
  summary/history service → controller → pantry hook → weekly job → frontend API → achievements
  page → dashboard widget. Each is independently testable.
- [x] **III. Type safety** — Strict TS; Prisma client types are the source of truth for
  `UserPoints`/`UserBadge`; DTOs typed; no `any`.
- [x] **IV. English only** — All artifacts in English.
- [x] **V. Clear naming** — `processConsumptionEvent`, `evaluateBadges`, `getSummary`,
  `getHistory`, `GamificationCronService` — intent-revealing; no `data`/`handler`/`util`.
- [x] **VI. Assumptions audited** — Week boundary (Mon–Sun UTC), "value saved" definition,
  milestone counting, and streak derivation are stated in research.md; spec Assumptions resolved
  the two ticket Open Questions.
- [x] **VII. Pattern scan** — Reuses existing patterns: module/controller/service layout
  (mirrors `insights`), `JwtAuthGuard`, `RequestWithUser`, `setInterval` scheduler
  (`notifications.scheduler.ts`), `NotificationDeliveryService` for push, TanStack Query API
  bindings (mirrors `insights.api.ts`). No new abstraction introduced where one exists.

**Result**: PASS — no violations; Complexity Tracking left empty.

## Project Structure

### Documentation (this feature)

```text
specs/004-gamification/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (gamification-summary, gamification-history)
└── tasks.md             # Phase 2 output (/speckit-tasks — NOT created here)
```

### Source Code (repository root)

```text
back/
├── prisma/
│   └── schema.prisma                         # + UserPoints, UserBadge models; User back-relations
└── src/
    ├── modules/
    │   ├── gamification/                      # NEW module
    │   │   ├── gamification.module.ts
    │   │   ├── gamification.controller.ts     # GET /gamification/summary, /history
    │   │   ├── gamification.controller.spec.ts
    │   │   ├── gamification.service.ts        # getSummary, getHistory, weekly streak
    │   │   ├── gamification.service.spec.ts
    │   │   ├── points.service.ts              # processConsumptionEvent
    │   │   ├── points.service.spec.ts
    │   │   ├── badge.service.ts               # evaluateBadges + badge catalog
    │   │   ├── badge.service.spec.ts
    │   │   ├── gamification-cron.service.ts    # weekly ZERO_WASTE_WEEK evaluation (setInterval)
    │   │   ├── gamification-cron.service.spec.ts
    │   │   ├── badge-catalog.ts               # static badge definitions (code/label/description)
    │   │   └── dto/                           # history query DTO, response types
    │   ├── pantry/
    │   │   └── pantry.service.ts              # MODIFIED: call PointsService after event create
    │   └── notifications/
    │       └── notification-delivery.service.ts  # MODIFIED: add deliverBadge(...)
    ├── app.module.ts                          # MODIFIED: register GamificationModule
    └── test/
        └── gamification.e2e-spec.ts           # NEW e2e: consume → points + badge persisted

front/
├── src/
│   ├── features/gamification/                 # NEW
│   │   ├── gamification.api.ts                # getGamificationSummary, getPointsHistory + types
│   │   └── badge-catalog.ts                   # client badge labels/descriptions for locked state
│   ├── components/
│   │   └── PointsSummaryWidget.tsx            # NEW dashboard widget
│   └── routes/
│       ├── achievements.tsx                   # NEW route: badges grid + points + history
│       └── insights.tsx                       # MODIFIED: render PointsSummaryWidget + link
└── tests/e2e/gamification/                     # NEW Playwright (optional, mirrors insights e2e)
```

**Structure Decision**: Web-application monorepo. A new self-contained `gamification` NestJS
module owns all scoring/badge logic; the only edits to existing code are (1) a fire-and-forget
hook in `PantryService.registerEvent`, (2) a new `deliverBadge` method on
`NotificationDeliveryService`, (3) module registration in `app.module.ts`, and (4) frontend
widget + nav linkage on the existing dashboard surface (`insights.tsx`). The dashboard widget
lives on `insights.tsx` because that is the real authenticated dashboard route (it already calls
`getDashboardSummary()`); the ticket's `dashboard.tsx` path does not exist in the repo.

## Complexity Tracking

> No constitution violations. No complexity justification required.
