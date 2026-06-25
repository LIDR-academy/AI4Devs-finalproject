# Research: Recipe Suggestions Based on Current Pantry

**Feature**: 002-recipe-suggestions | **Date**: 2026-06-25

## Decision 1: HTTP Client for TheMealDB

**Decision**: Use Node.js native `fetch` (no new dependency).

**Rationale**: The backend (`back/package.json`) does not include `@nestjs/axios`, `axios`, or any HTTP client library beyond the AWS SDK. Node.js 20 ships with `fetch` as a stable global. Using it directly in a plain NestJS `@Injectable()` service requires zero new packages, is fully typed via the built-in `lib.dom.d.ts` fetch types (already in scope via `@types/node` and Node 20's native support), and matches the project's pattern of writing thin integration wrappers (see `web-push` integration: plain `@Injectable()` with no framework HTTP module).

**Alternatives considered**:
- `@nestjs/axios` + `HttpModule`: Adds a dependency and RxJS Observable wrapper for what is a simple one-shot request. Rejected — unnecessary complexity.
- `node-fetch` or `got`: Third-party packages solving a problem that native fetch already solves in Node 20. Rejected — YAGNI.

---

## Decision 2: In-Process Cache for TheMealDB Responses

**Decision**: Use a private `Map<string, { data: T; expiresAt: number }>` inside `ThemealdbService` with a 1-hour TTL (3600 seconds).

**Rationale**: `@nestjs/cache-manager` is not installed and is not used anywhere in the codebase. The cache need here is simple: deduplicate repeated calls to the same TheMealDB URL within a sliding 1-hour window. A typed private Map achieves this with zero dependencies and zero configuration. Cache entries are keyed by URL, values carry a data payload and an `expiresAt` epoch-ms timestamp. On each read, stale entries are returned as misses. Cache is per-process (does not survive restarts) — acceptable per spec Assumption §9.

**Alternatives considered**:
- `@nestjs/cache-manager` + `cache-manager`: Correct for multi-service shared caches or Redis-backed caches. Overkill for a single service, single key-space, in-process TTL. Rejected — would add two packages for zero extra value at current scale.
- No cache: Violates FR-010 and leaves the app fully exposed to TheMealDB downtime. Rejected.

---

## Decision 3: Pantry Data Access for Ranking

**Decision**: Call `PantryService.getUseNext(userId)` to obtain the expiry-ranked active pantry items, then extract the top 5 item names as search ingredients for TheMealDB.

**Rationale**: `getUseNext` already implements the expiry-risk ranking logic (`compareUseNextCandidates` + `riskFromDays`). This is exactly the sort order needed for ingredient prioritization — items with `riskLevel: HIGH` (≤3 days) rank first, followed by MEDIUM, then LOW. Reusing this method avoids duplicating the ranking algorithm and respects Constitution Principle VII (pattern scan before adding code).

**Ingredient count**: Top 5 expiring items are used as search inputs. Each is queried independently against TheMealDB `filter.php?i={ingredient}`, results are deduplicated by `idMeal`, then ranked by pantry overlap count. 5 is the ticket's stated recommendation; it balances coverage against API call volume.

**Alternatives considered**:
- Query Prisma directly in `RecipesService`: Would duplicate the ranking query and bypass the household visibility logic in `PantryService`. Rejected — DRY violation + security gap.
- All pantry items (not just top 5): Produces too many TheMealDB calls, many of which return zero results for non-standard ingredient names. Rejected — unnecessary load on an unmetered free API.

---

## Decision 4: Ingredient Matching Algorithm

**Decision**: Case-insensitive substring match between normalized pantry item names and TheMealDB ingredient names.

**Rationale**: TheMealDB returns ingredient names like `"Chicken Breast"`, `"Cherry Tomatoes"`, `"Olive Oil"`. Pantry item names are user-entered free text. A case-insensitive `includes` check (e.g., `"chicken breast".includes("chicken")`) covers the common case without requiring any additional library. This is explicitly within scope (spec Assumption §5) and matches the ticket's stated matching strategy. Fuzzy/semantic matching is a future enhancement.

**Implementation note**: Normalize both sides with `.toLowerCase().trim()` before comparing. Match is bidirectional: check if pantry name substring appears in recipe ingredient name OR recipe ingredient name appears in pantry name.

**Alternatives considered**:
- Exact match: Too brittle for user-entered data. Rejected.
- Fuzzy matching (e.g., `fuse.js`, Levenshtein): Out of scope per Non-Goals in spec. Rejected for v1.

---

## Decision 5: Cook Action Atomicity

**Decision**: Call `PantryService.registerEvent(userId, itemId, dto)` for each matched `pantryItemId` in parallel (`Promise.all`). If any call throws, catch the error and re-throw — no partial commit.

**Rationale**: `registerEvent` is a single-item operation. The spec requires the cook action to be atomic (FR-007). Parallel execution via `Promise.all` means all calls either succeed or the whole operation fails with no partially-consumed state — the error is surfaced as a 400/500 and the caller can retry. This is the simplest correct implementation without adding a DB transaction layer.

**Boundary check**: Before calling `registerEvent`, the controller validates that all submitted `pantryItemIds` belong to the authenticated user's household. This is done by calling `PantryService.registerEvent` which already performs the household visibility check (`assertUserCanAccessPantry` + `resolveHouseholdUserIds`) per the existing service code.

**Alternatives considered**:
- Prisma `$transaction` across multiple items: Would require direct Prisma access in `RecipesService`, bypassing `PantryService`'s business logic and auth checks. Rejected.
- Sequential calls: Slower; does not change atomicity semantics since a failure still aborts the remaining calls via throw. Rejected in favour of `Promise.all` for performance.

---

## Decision 6: Frontend Route Strategy

**Decision**: Convert `front/src/routes/recipes.tsx` (currently using mock data) to call `getRecipeSuggestions()` from a new `features/recipes/recipes.api.ts` module. Add `front/src/routes/recipes.$mealId.tsx` as a new file-based route for the detail view.

**Rationale**: The route file already exists with the full UI shell, filter logic, and `RecipeCard`-equivalent inline markup. The conversion task is: remove the hardcoded `RECIPES` array, add a TanStack Query data fetch, replace the inline card markup with the new `RecipeCard` component, and wire up navigation to the detail route. The detail route does not exist yet and must be created.

**Pattern reference**: `front/src/features/pantry/pantry.api.ts` is the model for the new `recipes.api.ts` — same fetch wrapper pattern, same `getAccessToken()` usage, same `API_BASE_URL` constant.

---

## TheMealDB API — Confirmed Response Shapes

Both endpoints are unauthenticated GET requests. Base URL: `https://www.themealdb.com/api/json/v1/1/`

### `filter.php?i={ingredient}` — ingredient search

```json
{
  "meals": [
    { "strMeal": "Chicken Handi", "strMealThumb": "https://...", "idMeal": "52795" }
  ]
}
```

Returns `null` for `meals` when no results are found (not an empty array — must null-check).

### `lookup.php?i={mealId}` — meal detail

```json
{
  "meals": [
    {
      "idMeal": "52795",
      "strMeal": "Chicken Handi",
      "strCategory": "Chicken",
      "strYoutube": "https://...",
      "strInstructions": "...",
      "strMealThumb": "https://...",
      "strIngredient1": "Chicken", "strMeasure1": "1kg",
      "strIngredient2": "Onion",   "strMeasure2": "2",
      ...up to strIngredient20 / strMeasure20 (empty string when not used)
    }
  ]
}
```

Ingredients are flat key-value pairs (not an array). The service must extract non-empty `strIngredient1..20` / `strMeasure1..20` pairs and return them as `Array<{ name: string; measure: string }>`.
