# Implementation Plan: Automatic Expiry Learning from User Overrides

**Branch**: `006-expiry-learning` | **Date**: 2026-06-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/006-expiry-learning/spec.md`

## Summary

Extends the existing expiration estimation system (`ExpirationService` + `ExpirationRulesService`) to learn from user overrides on a per-category basis. When a user saves an override, the signed delta between the rule-based suggestion and the user's chosen date is recorded in a new `UserCategoryExpiryPreference` table (rolling window of 5 entries). On the next estimate for the same user+category, the average delta is applied (clamped ±30 days) and confidence is upgraded to at least 0.60 once the user has ≥ 3 overrides for that category. A new settings section surfaces the learned preferences and allows per-category or full reset.

## Technical Context

**Language/Version**: TypeScript, Node.js ≥ 20

**Primary Dependencies**: NestJS (backend), Prisma ORM, React + TanStack Start (frontend), Vitest (frontend tests), Jest (backend tests)

**Storage**: PostgreSQL via Prisma ORM

**Testing**: Jest (backend unit + integration), Vitest (frontend unit), Playwright (e2e — not in scope for this feature)

**Target Platform**: Linux server (NestJS API in `back/`), browser (TanStack Start SPA in `front/`)

**Project Type**: Web application — NestJS API + TanStack Start SPA

**Performance Goals**: Override endpoint must respond within 200 ms even with learning applied; preference recording runs in a non-blocking try/catch and never delays the response

**Constraints**:
- Rolling delta window capped at 5 entries; oldest dropped on 6th insert
- Applied adjustment clamped ±30 days from the baseline suggestion
- Preference recording failure must never block or delay the override response
- All preference data scoped to the authenticated user (JWT `userId`); no cross-user access

**Scale/Scope**: Single-user preferences per pantry; 5 named categories + "unknown"; no cross-user aggregation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify against RealSaveFooding Constitution v1.0.0:

- [x] **I. TDD** — Tests are scoped in tasks.md and written before implementation; each task starts with a failing test
- [x] **II. Baby steps** — Each task targets one logical change, is independently testable, and can be validated in isolation
- [x] **III. Type safety** — TypeScript strict throughout; Prisma-generated types used for all DB entities; no `any`
- [x] **IV. English only** — All code, docs, specs, and commit messages in English
- [x] **V. Clear naming** — All proposed identifiers are descriptive: `ExpirationPreferenceRepository`, `upsertDelta`, `averageDelta`, `sampleCount`
- [x] **VI. Assumptions audited** — All inferences stated in `spec.md` Assumptions section; technical decisions resolved in `research.md`
- [x] **VII. Pattern scan** — New preference code reuses `PrismaService` injection pattern, `JwtAuthGuard` from existing auth module, and the `ExpirationModule` boundary rather than adding a new module

*Post-design re-check: all gates remain green. No new module introduced; new controller added to existing module; new repository follows same `PrismaService` injection as other repositories.*

## Project Structure

### Documentation (this feature)

```text
specs/006-expiry-learning/
├── plan.md                          # This file
├── research.md                      # Phase 0 — technical decisions
├── data-model.md                    # Phase 1 — schema + delta rules
├── quickstart.md                    # Phase 1 — validation scenarios
├── contracts/
│   └── expiration-preferences-api.md  # Phase 1 — API contract
└── tasks.md                         # Phase 2 — /speckit-tasks output (NOT created here)
```

### Source Code (repository root)

```text
back/
├── prisma/
│   └── schema.prisma                              MODIFY — add UserCategoryExpiryPreference model + User relation
├── src/modules/expiration/
│   ├── dto/
│   │   ├── update-item-expiration.dto.ts          existing — no change
│   │   └── expiry-preference.dto.ts               NEW — ExpiryPreferenceDto response shape
│   ├── expiration-preference.repository.ts        NEW — findByUserAndCategory, upsertDelta, deleteCategory, deleteAll
│   ├── expiration-preference.repository.spec.ts   NEW — unit tests for rolling window + average
│   ├── expiration-rules.service.ts                existing — no change
│   ├── expiration-rules.service.spec.ts           existing — no change
│   ├── expiration.service.ts                      MODIFY — record delta on override; apply delta on estimate; upgrade confidence
│   ├── expiration.service.spec.ts                 NEW — unit tests for delta recording, clamp, confidence upgrade
│   ├── expiration.controller.ts                   MODIFY — add GET /expiration/preferences + two DELETE endpoints
│   ├── expiration.controller.spec.ts              NEW — unit tests for preference endpoints (200, 204, 401)
│   └── expiration.module.ts                       MODIFY — register ExpirationPreferenceRepository as provider

front/
├── src/
│   ├── features/pantry/
│   │   └── pantry.api.ts                          MODIFY — add getExpiryPreferences, resetExpiryPreference, resetAllExpiryPreferences
│   └── routes/
│       ├── settings.tsx                           MODIFY — add ExpiryLearning section
│       └── settings.test.tsx                      MODIFY — tests for ExpiryLearning section rendering + reset
```

**Structure Decision**: Web application layout (backend `back/`, frontend `front/`). New preference code lives inside the existing `expiration` module — a new module is not warranted because preferences are tightly coupled to `ExpirationService`. A second controller (`ExpirationPreferencesController`) is added to the same module to handle the `/expiration/preferences` path family, keeping the `pantry/items` base path of the existing `ExpirationController` unchanged.
