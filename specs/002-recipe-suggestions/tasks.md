# Tasks: Recipe Suggestions Based on Current Pantry

**Input**: Design documents from `specs/002-recipe-suggestions/`

**Prerequisites**: [plan.md](./plan.md) · [spec.md](./spec.md) · [research.md](./research.md) · [data-model.md](./data-model.md) · [contracts/api.md](./contracts/api.md) · [quickstart.md](./quickstart.md)

**Tests**: TDD is **NON-NEGOTIABLE** per the RealSaveFooding Constitution (Principle I). Every implementation task is preceded by a failing test. Do not implement before the test exists and fails.

**Organization**: Tasks are grouped by user story to enable independent implementation and delivery.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel — different files, no dependency on an incomplete sibling task
- **[Story]**: Which user story this task belongs to (US1, US2, US3)

---

## Phase 1: Setup

**Purpose**: Create directory structure and shared TypeScript types before any story work begins.

- [x] T001 Create backend integration directory `back/src/integrations/themealdb/` and module directory `back/src/modules/recipes/dto/` (mkdir only — no implementation yet)
- [x] T002 Create `front/src/features/recipes/recipes.types.ts` with all TypeScript interfaces from data-model.md: `RecipeSuggestion`, `RecipeDetail`, `RecipeIngredient`, `CookRecipeResult`

---

## Phase 2: Foundational — TheMealDB Integration Service

**Purpose**: HTTP + cache layer that all recipe user stories depend on. No story can begin until this phase is complete.

**⚠️ CRITICAL**: Phases 3–5 are blocked until this phase reaches its checkpoint.

> **TDD Order**: Write test → confirm it fails → implement → confirm it passes.

- [x] T003 [P] Write failing Jest unit test for `ThemealdbService.searchByIngredient()` in `back/src/integrations/themealdb/themealdb.service.spec.ts` — mock global `fetch`, assert correct URL (`filter.php?i={ingredient}`), assert returns `MealSummary[]`, assert `null` meals response returns empty array
- [x] T004 [P] Write failing Jest unit test for `ThemealdbService.getMealDetail()` in `back/src/integrations/themealdb/themealdb.service.spec.ts` — mock global `fetch`, assert correct URL (`lookup.php?i={mealId}`), assert `strIngredient1..20`/`strMeasure1..20` pairs are extracted into `MealIngredient[]` array (empty strings omitted)
- [x] T005 Write failing Jest unit test for TTL cache behavior in `back/src/integrations/themealdb/themealdb.service.spec.ts` — first call fetches and caches, second identical call does NOT call `fetch` again; mock `Date.now()` to simulate cache expiry and assert fresh fetch on expired entry
- [x] T006 Implement `ThemealdbService` in `back/src/integrations/themealdb/themealdb.service.ts` — `@Injectable()`, private `Map<string, { data: unknown; expiresAt: number }>` cache (TTL = 3600000 ms), `searchByIngredient(ingredient: string): Promise<MealSummary[]>`, `getMealDetail(mealId: string): Promise<MealDetail>`, native `fetch` calls; throw `ServiceUnavailableException` on fetch error
- [x] T007 Create `ThemealdbModule` in `back/src/integrations/themealdb/themealdb.module.ts` — `@Module({ providers: [ThemealdbService], exports: [ThemealdbService] })`

**Checkpoint**: All ThemealdbService tests pass (`npx jest --testPathPattern=themealdb`). ThemealdbModule compiles without errors.

---

## Phase 3: User Story 1 — View Personalized Recipe Suggestions (Priority: P1) 🎯 MVP

**Goal**: Authenticated users open the Recipes tab and see a ranked list of recipe suggestions based on their expiring pantry items.

**Independent Test**: `GET /api/recipes` with a valid JWT and a pantry containing items named "Chicken" or "Tomato" returns at least one suggestion with `matchScore > 0`. Recipes tab in the UI renders real cards (not mock data).

> **TDD Order**: Write test → confirm it fails → implement → confirm it passes.

### Backend — Tests First

- [x] T008 [P] Write failing Jest unit test for `RecipesService.getSuggestedRecipes(userId, limit)` in `back/src/modules/recipes/recipes.service.spec.ts` — mock `ThemealdbService` and `PantryService`, assert: top 5 expiring item names are used as search inputs, results are sorted by `matchScore` descending, `matchScore` = matchedIngredients.length / totalIngredients, `null` meals from TheMealDB are handled gracefully
- [x] T009 [P] Write failing Jest unit test for `GET /recipes` in `back/src/modules/recipes/recipes.controller.spec.ts` — mock `RecipesService`, assert 200 status, assert response body shape `{ recipes: RecipeSuggestion[] }`, assert default `limit=10` when query param absent

### Backend — Implementation

- [x] T010 Implement `RecipesService.getSuggestedRecipes(userId: string, limit: number)` in `back/src/modules/recipes/recipes.service.ts` — inject `PantryService` and `ThemealdbService`; call `PantryService.getUseNext(userId)`, extract top-5 item names (lowercased), call `ThemealdbService.searchByIngredient()` for each in parallel via `Promise.allSettled` (graceful degradation), deduplicate by `idMeal`, compute `matchScore` using case-insensitive substring match (both directions), sort descending, return top `limit` results as `RecipeSuggestion[]`; throw `ServiceUnavailableException` only if all searches fail
- [x] T011 Add `GET /api/recipes` to `RecipesController` in `back/src/modules/recipes/recipes.controller.ts` — `@UseGuards(JwtAuthGuard)`, `@Get()`, `@Query('limit') limit = 10`, calls `getSuggestedRecipes`, returns `{ recipes }`
- [x] T012 Create `RecipesModule` in `back/src/modules/recipes/recipes.module.ts` — `@Module({ imports: [PantryModule, ThemealdbModule], controllers: [RecipesController], providers: [RecipesService] })`
- [x] T013 Register `RecipesModule` in `back/src/app.module.ts` — add to the `imports` array alongside existing modules

### Frontend — Tests First

- [x] T014 [P] Write failing Vitest test for `RecipeCard` in `front/src/test/RecipeCard.test.tsx` — renders recipe name, shows matched ingredient count as "X ingredients from your pantry", renders matched ingredient chips; use `@testing-library/react`

### Frontend — Implementation

- [x] T015 [P] Implement `RecipeCard` component in `front/src/components/RecipeCard.tsx` — props: `recipe: RecipeSuggestion`, `onSelect: () => void`; shows thumbnail image, name, `matchedIngredients.length` as match count, matched ingredient chips (green), missing ingredient chips (muted); tapping calls `onSelect`
- [x] T016 Implement `getRecipeSuggestions(limit?: number)` in `front/src/features/recipes/recipes.api.ts` — follows `pantry.api.ts` pattern: `getAccessToken()`, `API_BASE_URL`, `requestJson` wrapper, typed return `Promise<RecipeSuggestion[]>`; then convert `front/src/routes/recipes.tsx` — remove mock `RECIPES` array and `pantryItems`/`daysUntil` imports, add TanStack Query `useQuery` hook calling `getRecipeSuggestions`, render `RecipeCard` list, add loading skeleton and error/empty state

**Checkpoint**: `GET /api/recipes` returns ranked suggestions for a user with pantry items. Recipes tab shows real data. Validate with quickstart S1 and S2.

---

## Phase 4: User Story 3 — Mark Recipe as Cooked (Priority: P1)

**Goal**: Users can mark a recipe as cooked to record consumption events for all matched pantry items in a single atomic action.

**Independent Test**: `POST /api/recipes/:mealId/cook` with valid `pantryItemIds` returns 201 and creates consumption events; `GET /api/pantry/use-next` no longer returns the consumed items. Can be validated with curl (quickstart S4) without needing the detail UI.

> **TDD Order**: Write test → confirm it fails → implement → confirm it passes.

### Backend — Tests First

- [x] T017 [P] Write failing Jest unit test for `RecipesService.cookRecipe(userId, pantryItemIds)` in `back/src/modules/recipes/recipes.service.spec.ts` — mock `PantryService.registerEvent`, assert it is called for each `pantryItemId` (in parallel), assert all succeed → returns `CookRecipeResponse`; assert if any call throws a `NotFoundException` the whole operation throws and no partial response is returned
- [x] T018 [P] Write failing Jest unit test for `POST /recipes/:mealId/cook` in `back/src/modules/recipes/recipes.controller.spec.ts` — mock `RecipesService.cookRecipe`, assert 201 + `{ consumedCount, events }` on valid body; assert 400 when `pantryItemIds` is empty array

### Backend — Implementation

- [x] T019 [P] Create `CookRecipeDto` in `back/src/modules/recipes/dto/cook-recipe.dto.ts` — `@IsArray()`, `@ArrayNotEmpty()`, `@IsString({ each: true })` on `pantryItemIds: string[]`; add `ValidationPipe` usage note via `@UsePipes` or global pipe
- [x] T020 Implement `RecipesService.cookRecipe(userId: string, pantryItemIds: string[])` in `back/src/modules/recipes/recipes.service.ts` — `Promise.all(pantryItemIds.map(id => this.pantryService.registerEvent(userId, id, { type: PantryConsumptionEventType.CONSUMED })))`, collect results into `CookRecipeResponse`; any thrown exception propagates (atomic failure)
- [x] T021 Add `POST /api/recipes/:mealId/cook` to `RecipesController` — `@Post(':mealId/cook')`, `@Body() dto: CookRecipeDto`, calls `cookRecipe(req.user.id, dto.pantryItemIds)`, returns 201 with `CookRecipeResponse`

### Frontend — Implementation

- [x] T022 Add `cookRecipe(mealId: string, pantryItemIds: string[])` to `front/src/features/recipes/recipes.api.ts` — POST to `/recipes/${mealId}/cook`, body `{ pantryItemIds }`, returns `Promise<CookRecipeResult>`

**Checkpoint**: `POST /api/recipes/:mealId/cook` creates consumption events. Consumed items disappear from pantry. Validate with quickstart S4 and S7.

---

## Phase 5: User Story 2 — Recipe Detail with Pantry Match (Priority: P2)

**Goal**: Users tap a recipe suggestion and see full cooking instructions with a clear visual distinction between pantry-matched and missing ingredients. The "Mark as cooked" button on this screen completes the US3 flow.

**Independent Test**: `GET /api/recipes/:mealId` returns full detail with `matchedPantryItemIds` for a user with matching pantry items. Detail route in the UI renders ingredients with match highlighting and the cook button triggers the cook action.

> **TDD Order**: Write test → confirm it fails → implement → confirm it passes.

### Backend — Tests First

- [x] T023 [P] Write failing Jest unit test for `RecipesService.getRecipeDetail(userId, mealId)` in `back/src/modules/recipes/recipes.service.spec.ts` — mock `ThemealdbService.getMealDetail` and `PantryService.getUseNext`, assert `matchedPantryItemIds` contains IDs of pantry items whose names match any recipe ingredient (case-insensitive substring); assert 404 thrown when `getMealDetail` returns `null`
- [x] T024 [P] Write failing Jest unit test for `GET /recipes/:mealId` in `back/src/modules/recipes/recipes.controller.spec.ts` — mock `RecipesService.getRecipeDetail`, assert 200 + `RecipeDetailResponse` shape with `matchedPantryItemIds`; assert 404 propagated when service throws `NotFoundException`

### Backend — Implementation

- [x] T025 Implement `RecipesService.getRecipeDetail(userId: string, mealId: string)` in `back/src/modules/recipes/recipes.service.ts` — call `ThemealdbService.getMealDetail(mealId)` (throw `NotFoundException` if null), call `PantryService.getUseNext(userId)` to get active pantry items, compute `matchedPantryItemIds` and `matchedIngredientNames` by checking each pantry item name against the meal's ingredient list (case-insensitive substring, both directions), return `RecipeDetailResponse`
- [x] T026 Add `GET /api/recipes/:mealId` to `RecipesController` — `@Get(':mealId')`, calls `getRecipeDetail(req.user.id, mealId)`, returns `RecipeDetailResponse`; `NotFoundException` from service yields 404

### Frontend — Implementation

- [x] T027 [P] Add `getRecipeDetail(mealId: string)` to `front/src/features/recipes/recipes.api.ts` — GET `/recipes/${mealId}`, returns `Promise<RecipeDetail>`
- [x] T028 Create `front/src/routes/recipes.$mealId.tsx` — TanStack Router file route (`createFileRoute('/recipes/$mealId')`), `beforeLoad: requireAuthBeforeLoad`, loads `getRecipeDetail(mealId)` via TanStack Query, renders: thumbnail, name, cooking instructions, full ingredient list with matched items in green and missing items in muted/grey, "Mark as cooked" button that calls `cookRecipe(mealId, matchedPantryItemIds)`, shows `sonner` toast on success, invalidates pantry query on success; add `onSelect` navigation from `RecipeCard` in `recipes.tsx` to this route via TanStack Router `Link` or `navigate`

**Checkpoint**: Detail route shows full recipe with ingredient match overlay. Cook button on detail page works end-to-end. Validate with quickstart S3 and S4.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: E2E coverage, graceful degradation hardening, navigation, and final validation.

- [ ] T029 [P] Write backend E2E test in `back/test/recipes.e2e-spec.ts` — cover: `GET /api/recipes` 200 with real pantry items (using test DB), `GET /api/recipes` 401 without token, `GET /api/recipes` 503 when TheMealDB fetch is mocked to fail, `POST /api/recipes/:mealId/cook` 201 with valid IDs, `POST /cook` 404 with unknown pantry item ID
- [ ] T030 [P] Write Playwright E2E test in `front/tests/e2e/recipes/recipe-suggestions.spec.ts` — open Recipes tab, assert at least one RecipeCard renders with real data, click a card, navigate to detail page, assert ingredient list renders, click "Mark as cooked", assert success toast, navigate to Pantry tab and assert consumed items are gone
- [x] T031 Verify graceful degradation in `RecipesService.getSuggestedRecipes` — `Promise.allSettled` used so partial TheMealDB failures return partial results; only throws `ServiceUnavailableException` when all ingredient searches fail; error state displayed in `front/src/routes/recipes.tsx`
- [x] T032 [P] Verify Recipes tab appears in bottom navigation — `front/src/components/AppShell.tsx` already has `{ to: "/recipes", label: "Recipes", icon: ChefHat }` in the nav array

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)
    └──► Phase 2 (Foundational — TheMealDB Integration)
              └──► Phase 3 (US1 — Suggestions, P1) ◄─ 🎯 MVP stop point
              └──► Phase 4 (US3 — Cook Action, P1)
              └──► Phase 5 (US2 — Detail View, P2)
                        ▲
                 (Cook button UI requires Phase 4 cookRecipe API fn — T022)
              └──► Phase 6 (Polish — after desired stories complete)
```

### User Story Dependencies

- **US1 (P1)**: Depends on Phase 2 completion. No dependency on US2 or US3.
- **US3 (P1)**: Depends on Phase 2 completion. Backend is independent of US1 and US2. Frontend `cookRecipe()` (T022) is independent; UI wiring appears in US2's detail route (T028).
- **US2 (P2)**: Depends on Phase 2 completion. Detail route (T028) calls `cookRecipe()` (T022 from US3) — US3 frontend task must complete before T028.

### Within Each Phase

```
Each user story phase:
  Spec file (test) → FAIL → Implement → PASS → next task
  Tests for different endpoints [P] can be written in parallel
  Implementation tasks follow test completion
```

---

## Parallel Opportunities

### Phase 2 (Foundational)
```
T003 [P] searchByIngredient test
T004 [P] getMealDetail test
          ↓
T005 cache TTL test
T006 ThemealdbService implementation (after T003–T005 pass)
T007 [P] ThemealdbModule (can be written alongside T006)
```

### Phase 3 (US1)
```
T008 [P] RecipesService test       T014 [P] RecipeCard Vitest test
T009 [P] RecipesController test    T015 [P] RecipeCard implementation (after T014)
      ↓                                  ↓
T010 RecipesService impl           T016 recipes.tsx conversion (after T010+T015)
T011 Controller GET /recipes
T012 RecipesModule
T013 Register in AppModule
```

### Phase 4 (US3)
```
T017 [P] cookRecipe service test   T019 [P] CookRecipeDto
T018 [P] cook controller test      T022 [P] frontend cookRecipe()
      ↓
T020 cookRecipe impl (after T017+T019)
T021 Controller POST /cook (after T018+T019)
```

### Phase 5 (US2)
```
T023 [P] getRecipeDetail test      T027 [P] frontend getRecipeDetail()
T024 [P] detail controller test
      ↓
T025 getRecipeDetail impl (after T023)
T026 Controller GET /:mealId (after T024)
T028 recipes.$mealId.tsx (after T025+T026+T027+T022)
```

### Phase 6 (Polish)
```
T029 [P] Backend E2E
T030 [P] Playwright E2E
T031    Graceful degradation (✓ complete)
T032 [P] Nav verification (✓ complete)
```

---

## Implementation Strategy

### MVP First (US1 Only — Phase 1 + 2 + 3)

1. Complete Phase 1 (Setup) — ~15 min
2. Complete Phase 2 (Foundational) — ThemealdbService tests pass
3. Complete Phase 3 (US1) — Recipes tab shows real data
4. **STOP and VALIDATE**: Run quickstart S1 + S2; open browser and verify cards load
5. Ship or demo: the core food-waste-reduction value is delivered

### Incremental Delivery

1. Phase 1 + 2 → TheMealDB integration ready
2. Phase 3 (US1) → Recipes list works → Demo!
3. Phase 4 (US3) → Cook action works (API-level) → validate S4
4. Phase 5 (US2) → Detail view + cook button wired up → full user journey complete
5. Phase 6 (Polish) → E2E tests, graceful degradation, nav verified → production-ready

---

## Notes

- `[P]` tasks operate on different files with no dependency on an incomplete sibling — safe to parallelise
- Every `[Story]` task maps directly to its user story's acceptance criteria
- Run `npx jest --testPathPattern=recipes` after each backend phase checkpoint
- Run `npx vitest run src/features/recipes src/components/RecipeCard` after frontend unit tasks
- Commit after each logical group: one NestJS service → one commit; one route → one commit
- Validate S1–S7 in [quickstart.md](./quickstart.md) before marking Phase 6 complete
