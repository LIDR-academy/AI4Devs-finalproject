# Implementation Plan: Recipe Suggestions Based on Current Pantry

**Branch**: `002-recipe-suggestions` | **Date**: 2026-06-25 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/002-recipe-suggestions/spec.md`

## Summary

Allow authenticated users to receive recipe suggestions ranked by how many of their expiring pantry items each recipe uses. Users can view a recipe's full details (matched vs. missing ingredients) and mark a recipe as cooked to atomically record consumption events for all matched pantry items. Recipe data is fetched from TheMealDB (free, no-auth public API) and cached in-process with a 1-hour TTL. No database schema changes are required.

## Technical Context

**Language/Version**: TypeScript (strict) — Node.js 20 (backend CommonJS), ESM (frontend)

**Primary Dependencies**:
- Backend: NestJS, Prisma ORM, Jest (unit + e2e via `supertest`)
- Frontend: TanStack Start, TanStack Query, Vitest, Playwright (E2E)

**HTTP Client for TheMealDB**: Node.js native `fetch` (available in Node 20+) — `@nestjs/axios` is NOT installed and should not be added. Use native fetch directly in the TheMealDB service, consistent with Node 20 standards.

**Caching**: Plain in-process `Map<string, { data: unknown; expiresAt: number }>` within the TheMealDB service — `@nestjs/cache-manager` is NOT installed. A simple TTL Map is sufficient and adds no new dependencies.

**Storage**: PostgreSQL via Prisma — no schema changes for this feature. Reuses existing `PantryItem` and `ConsumptionEvent` tables.

**Testing**: Jest (backend unit + E2E), Vitest (frontend unit), Playwright (E2E)

**Target Platform**: AWS-hosted web service + SPA (Node.js 20 server)

**Performance Goals**: Recipe suggestions list returns within 3 seconds under normal external API latency; cache eliminates repeated TheMealDB calls within 1-hour windows.

**Constraints**: TheMealDB is a free public service with no SLA — graceful degradation to empty list + 503 on unavailability is required. Cook action must be atomic (all-or-nothing).

**Scale/Scope**: Single full-stack feature; existing user scale (household-level). No new infrastructure.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify against RealSaveFooding Constitution v1.0.0:

- [x] **I. TDD** — Each implementation task is preceded by a failing test; TDD loop enforced in tasks.md
- [x] **II. Baby steps** — Tasks scoped to one logical change each: integration service, recipes service, controller, module wiring, frontend API bindings, component, route conversion, detail route, E2E
- [x] **III. Type safety** — TypeScript strict; all TheMealDB response shapes typed; no `any`; Prisma types used for pantry/event entities
- [x] **IV. English only** — All code, docs, specs, and commit messages in English
- [x] **V. Clear naming** — `ThemealdbService`, `RecipesService`, `RecipeSuggestion`, `RecipeDetail`, `cookRecipe`; no vague identifiers
- [x] **VI. Assumptions audited** — HTTP client choice, cache approach, ingredient matching strategy, pantry data access method all stated explicitly in research.md
- [x] **VII. Pattern scan** — Existing patterns checked: integration services pattern (`web-push`), module pattern (`PantryModule`), consumption event API (`PantryService.registerEvent`), frontend API module (`pantry.api.ts`), frontend feature module (`features/pantry/`). No new abstractions beyond what the feature requires.

## Project Structure

### Documentation (this feature)

```text
specs/002-recipe-suggestions/
├── plan.md              # This file
├── research.md          # Phase 0 — decisions and rationale
├── data-model.md        # Phase 1 — entity shapes and TheMealDB response types
├── quickstart.md        # Phase 1 — validation guide
├── contracts/
│   └── api.md           # Phase 1 — endpoint contracts
└── tasks.md             # Phase 2 — /speckit-tasks output (NOT created here)
```

### Source Code (repository root)

```text
back/
├── src/
│   ├── integrations/
│   │   └── themealdb/
│   │       ├── themealdb.module.ts          # NestJS module exporting ThemealdbService
│   │       ├── themealdb.service.ts         # Fetch + in-process TTL cache
│   │       └── themealdb.service.spec.ts    # Unit: mocked fetch, cache hit/miss
│   └── modules/
│       └── recipes/
│           ├── dto/
│           │   └── cook-recipe.dto.ts       # CookRecipeDto: { pantryItemIds: string[] }
│           ├── recipes.controller.ts        # GET /recipes, GET /recipes/:id, POST /recipes/:id/cook
│           ├── recipes.controller.spec.ts   # Unit: mock service, status codes
│           ├── recipes.module.ts            # Imports PantryModule + ThemealdbModule
│           ├── recipes.service.ts           # Ranking logic, cook orchestration
│           └── recipes.service.spec.ts      # Unit: mock ThemealdbService + PantryService

front/
├── src/
│   ├── features/
│   │   └── recipes/
│   │       ├── recipes.api.ts               # getRecipeSuggestions, getRecipeDetail, cookRecipe
│   │       └── recipes.types.ts             # RecipeSuggestion, RecipeDetail, RecipeIngredient
│   ├── components/
│   │   └── RecipeCard.tsx                   # Reusable card; Vitest: renders name + match count
│   └── routes/
│       ├── recipes.tsx                      # CONVERT: replace mock data with real API
│       └── recipes.$mealId.tsx              # NEW: detail view with cook action

front/tests/e2e/
└── recipes/
    └── recipe-suggestions.spec.ts           # E2E: open tab, see suggestion, click cook, pantry updated
```

**Structure Decision**: Web application (Option 2). Backend follows existing `back/src/integrations/` + `back/src/modules/` layout. Frontend follows existing `front/src/features/` + `front/src/routes/` layout. No new top-level directories.
