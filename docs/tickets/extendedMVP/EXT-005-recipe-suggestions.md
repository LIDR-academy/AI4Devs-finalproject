# EXT-005 — Recipe Suggestions Based on Current Pantry

## Metadata
- **Type:** Full-Stack (Backend + Frontend)
- **Priority:** P2
- **Phase:** 2 — Growth
- **PRD Reference:** [P2-001](../../product/5_Extended-Non-MVP-PRD.md#p2-001-recipe-suggestions-based-on-current-pantry)
- **Effort:** Medium
- **Depends on:** TKT-009 (consumption events — done), TKT-002 (pantry CRUD — done)

---

## User Story

As a user, I want recipe suggestions based on what is expiring in my pantry, so that I can use those ingredients before they go bad.

---

## Context

TheMealDB (`themealdb.com/api`) is completely free, requires no API key, and returns recipes with ingredient lists. It has ~300 categorized meals with Spanish-relevant cuisine support.

The integration plan:
1. Fetch the user's pantry items ordered by expiry risk (use-next prioritization already exists).
2. Use the top-N expiring items as search ingredients.
3. Query TheMealDB `filter.php?i=<ingredient>` for each top ingredient.
4. Deduplicate and rank recipes by how many pantry items they use.
5. When user marks a recipe as "cooked", trigger `POST /pantry/items/:id/events` (CONSUMED) for each matched ingredient.

---

## Affected Slices

| Slice | Path | Change |
|---|---|---|
| Backend — module | `back/src/modules/recipes/` | New NestJS module |
| Backend — integration | `back/src/integrations/themealdb/` | New TheMealDB API client |
| Backend — app | `back/src/app.module.ts` | Register `RecipesModule` |
| Prisma schema | `back/prisma/schema.prisma` | No changes needed |
| Frontend — routes | `front/src/routes/recipes.tsx` | New route |
| Frontend — features | `front/src/features/recipes/` | API bindings + types |
| Frontend — components | `front/src/components/RecipeCard.tsx` | Reusable recipe display |

---

## API Contracts

```
GET /api/recipes?limit=10
Response: {
  recipes: Array<{
    id: string          // TheMealDB meal ID
    name: string
    category: string
    thumbnailUrl: string
    matchedIngredients: string[]   // pantry items used
    missingIngredients: string[]   // ingredients not in pantry
    matchScore: number             // 0-1, higher = more pantry overlap
  }>
}

GET /api/recipes/:mealId
Response: {
  id: string
  name: string
  category: string
  thumbnailUrl: string
  youtubeUrl: string | null
  instructions: string
  ingredients: Array<{ name: string; measure: string }>
  matchedPantryItemIds: string[]
}

POST /api/recipes/:mealId/cook
Body: { pantryItemIds: string[] }  // items to mark as consumed
Response: { consumedCount: number; events: Array<{ id: string }> }
```

---

## Data Model Changes

No Prisma schema changes. The `POST /api/recipes/:mealId/cook` endpoint reuses the existing `ConsumptionEvent` creation flow.

---

## Technical Implementation Tasks

Follow TDD: write failing test before implementing each unit.

1. **TheMealDB integration** (`back/src/integrations/themealdb/themealdb.service.ts`)
   - `searchByIngredient(ingredient: string): Promise<MealSummary[]>`
     - GET `https://www.themealdb.com/api/json/v1/1/filter.php?i={ingredient}`
     - Cache responses in memory with a 1-hour TTL (use `@nestjs/cache-manager`).
   - `getMealDetail(mealId: string): Promise<MealDetail>`
     - GET `https://www.themealdb.com/api/json/v1/1/lookup.php?i={mealId}`
   - Unit tests: mock `HttpService` (Axios), assert correct URLs, cache hit on second call.

2. **Recipes service** (`back/src/modules/recipes/recipes.service.ts`)
   - `getSuggestedRecipes(userId, limit): Promise<RecipeSuggestion[]>`
     1. Fetch user's pantry items ordered by expiry risk (query pantry module or use `PantryService`).
     2. Extract normalized ingredient names from top 5 expiring items.
     3. Call `ThemealdbService.searchByIngredient` for each ingredient (in parallel via `Promise.all`).
     4. Deduplicate meals by `idMeal`.
     5. For each unique meal, count how many pantry item names appear in the meal's ingredient list (case-insensitive substring match).
     6. Sort by `matchScore` descending, return top `limit`.
   - Unit tests: mock TheMealDB service and PantryService, verify ranking logic.

3. **Recipes controller** (`back/src/modules/recipes/recipes.controller.ts`)
   - `GET /recipes` → `getSuggestedRecipes`.
   - `GET /recipes/:mealId` → `getMealDetail` + match against current pantry.
   - `POST /recipes/:mealId/cook` → validate `pantryItemIds` belong to user, call `PantryService.registerEvent(itemId, CONSUMED)` for each.
   - Unit tests: mock service, assert correct responses and status codes.

4. **RecipesModule** (`back/src/modules/recipes/recipes.module.ts`)
   - Import `PantryModule`, `ThemealdbModule`, `CacheModule`.
   - Register `RecipesController`, `RecipesService`.

5. **Register module** (`back/src/app.module.ts`)
   - Add `RecipesModule` to imports.

6. **Frontend — API bindings** (`front/src/features/recipes/recipes.api.ts`)
   - `getRecipeSuggestions(limit?: number): Promise<RecipeSuggestion[]>`
   - `getRecipeDetail(mealId: string): Promise<RecipeDetail>`
   - `cookRecipe(mealId: string, pantryItemIds: string[]): Promise<{ consumedCount: number }>`

7. **Frontend — types** (`front/src/features/recipes/recipes.types.ts`)
   - `RecipeSuggestion`, `RecipeDetail`, `RecipeIngredient` interfaces.

8. **RecipeCard component** (`front/src/components/RecipeCard.tsx`)
   - Props: `recipe: RecipeSuggestion`, `onSelect: () => void`.
   - Shows thumbnail, name, `matchScore` as "X ingredients from your pantry", matched ingredient chips.
   - Vitest: renders name, shows correct matched ingredient count.

9. **Recipes route** (`front/src/routes/recipes.tsx`)
   - Loads `getRecipeSuggestions` on mount.
   - Shows list of `RecipeCard` components.
   - On card click: navigate to `/recipes/$mealId` detail view.
   - Detail view shows instructions, full ingredient list (matched = green, missing = grey), "Mark as cooked" button.
   - "Mark as cooked" → `cookRecipe(mealId, matchedPantryItemIds)` → success toast + refetch pantry.

10. **Add Recipes to bottom navigation** (`front/src/components/BottomNav.tsx` or equivalent)
    - New nav item: "Recipes" with a recipe icon, links to `/recipes`.

---

## Error Handling

- TheMealDB is a free external service with no SLA. If the API is unavailable, return cached results or an empty list with a `503` and a friendly "Recipes unavailable right now" message.
- `matchScore = 0` recipes are shown but ranked last; the UI may choose to hide them if `matchScore < 0.1`.
- `POST /cook` with an invalid `pantryItemId` → 400, no partial consume.

---

## Security

- TheMealDB is a read-only public API; no credentials required.
- `POST /cook` must verify each `pantryItemId` belongs to the authenticated user's household before creating events.
- Cache is per-process (in-memory) and does not leak between users.

---

## Testing Requirements

| Test type | Coverage |
|---|---|
| Unit — TheMealDB service | HTTP mock, cache hit/miss |
| Unit — Recipes service | ranking algorithm, deduplication |
| Unit — Recipes controller | 200 response structure |
| Vitest — RecipeCard | renders name, match score |
| Vitest — Recipes route | shows loading, shows cards, cook flow |
| E2E (Playwright) | open recipes tab, see suggestion, click cook, pantry item consumed |

---

## Acceptance Criteria

1. `GET /api/recipes` returns at least one recipe suggestion when the user has pantry items with recognizable ingredient names (e.g. "chicken", "tomato").
2. Recipes are ranked by number of pantry items used; items expiring soonest contribute most to ranking.
3. The frontend Recipes tab is accessible from the bottom navigation.
4. "Mark as cooked" triggers consume events for all matched pantry items and shows a success message.
5. If TheMealDB is unreachable, the UI shows an error state — not a crash.

---

## Non-Goals

- AI-generated recipes or LLM integration.
- Saving favourite recipes.
- Custom recipe creation.
- Scaling-up ingredient matching beyond substring (fuzzy matching is a future enhancement).

---

## Open Questions

1. Should missing ingredients be shown in the recipe detail to prompt the user to buy them? (Recommendation: yes, shown in grey — good UX without extra backend work.)
2. Should "cook" consume the full quantity of each item or just decrement? (Recommendation: consume the full item — simple and consistent with the existing consume flow.)

---

## Readiness Check

- [x] Clear actor and value
- [x] Testable acceptance criteria
- [x] Scope is one full-stack feature with a free external dependency
- [x] Dependencies identified (TKT-002, TKT-009 done; TheMealDB no auth required)
