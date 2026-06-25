# Data Model: Recipe Suggestions Based on Current Pantry

**Feature**: 002-recipe-suggestions | **Date**: 2026-06-25

## Overview

No Prisma schema changes. This feature is entirely read-through: it fetches data from the TheMealDB external API, enriches it with the user's live pantry state, and reuses the existing `ConsumptionEvent` write path. All types below are TypeScript interfaces/types used in the backend service layer and frontend feature module.

---

## Backend Types (`back/src/integrations/themealdb/`)

### `MealSummary` — TheMealDB ingredient search result

```typescript
interface MealSummary {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
}

interface MealSearchResponse {
  meals: MealSummary[] | null; // TheMealDB returns null, not [], when no results
}
```

### `MealDetailRaw` — TheMealDB lookup raw response

```typescript
interface MealDetailRaw {
  idMeal: string;
  strMeal: string;
  strCategory: string;
  strYoutube: string | null;
  strInstructions: string;
  strMealThumb: string;
  // Flat pairs: strIngredient1..20, strMeasure1..20 (empty string when unused)
  [key: string]: string | null;
}
```

### `MealIngredient` — normalized ingredient pair

```typescript
interface MealIngredient {
  name: string;
  measure: string;
}
```

### `MealDetail` — parsed and normalized detail

```typescript
interface MealDetail {
  id: string;
  name: string;
  category: string;
  thumbnailUrl: string;
  youtubeUrl: string | null;
  instructions: string;
  ingredients: MealIngredient[];
}
```

---

## Backend Types (`back/src/modules/recipes/`)

### `RecipeSuggestion` — enriched suggestion with pantry overlap

```typescript
interface RecipeSuggestion {
  id: string;           // TheMealDB idMeal
  name: string;
  category: string;
  thumbnailUrl: string;
  matchedIngredients: string[];   // pantry item names matched to this recipe
  missingIngredients: string[];   // recipe ingredients NOT in user's pantry
  matchScore: number;             // 0–1: matchedIngredients.length / totalIngredients
}
```

**Validation rules**:
- `matchScore` is always `0 ≤ score ≤ 1`
- `matchScore = 0` is valid and included in results, ranked last
- Results are sorted descending by `matchScore`; ties broken by `matchedIngredients.length` desc

### `RecipeDetailResponse` — detail with pantry match overlay

```typescript
interface RecipeDetailResponse {
  id: string;
  name: string;
  category: string;
  thumbnailUrl: string;
  youtubeUrl: string | null;
  instructions: string;
  ingredients: MealIngredient[];
  matchedPantryItemIds: string[];  // IDs of user's pantry items that matched
}
```

### `CookRecipeDto` — cook action request body

```typescript
// back/src/modules/recipes/dto/cook-recipe.dto.ts
class CookRecipeDto {
  @IsArray()
  @IsString({ each: true })
  @ArrayNotEmpty()
  pantryItemIds: string[];
}
```

**Validation rules**:
- `pantryItemIds` must be non-empty array of strings
- Each ID must belong to the authenticated user's household (enforced by `PantryService.registerEvent`)
- If any ID is invalid, the whole request is rejected (400) — no partial consumption

### `CookRecipeResponse` — cook action success response

```typescript
interface CookRecipeResponse {
  consumedCount: number;
  events: Array<{ id: string }>;
}
```

---

## Frontend Types (`front/src/features/recipes/recipes.types.ts`)

```typescript
export interface RecipeSuggestion {
  id: string;
  name: string;
  category: string;
  thumbnailUrl: string;
  matchedIngredients: string[];
  missingIngredients: string[];
  matchScore: number;
}

export interface RecipeIngredient {
  name: string;
  measure: string;
}

export interface RecipeDetail {
  id: string;
  name: string;
  category: string;
  thumbnailUrl: string;
  youtubeUrl: string | null;
  instructions: string;
  ingredients: RecipeIngredient[];
  matchedPantryItemIds: string[];
}

export interface CookRecipeResult {
  consumedCount: number;
  events: Array<{ id: string }>;
}
```

---

## Reused Prisma Entities (no changes)

| Entity | Table | Used by this feature |
|---|---|---|
| `PantryItem` | `PantryItem` | Read via `PantryService.getUseNext()` for ranking inputs |
| `ConsumptionEvent` | `ConsumptionEvent` | Written via `PantryService.registerEvent()` on cook action |

---

## Cache Entry Shape (internal to `ThemealdbService`)

```typescript
interface CacheEntry<T> {
  data: T;
  expiresAt: number; // epoch milliseconds: Date.now() + TTL_MS
}

// TTL_MS = 60 * 60 * 1000 (1 hour)
```

Cache is a private `Map<string, CacheEntry<unknown>>` keyed by request URL. Entries are checked on read; stale entries are treated as misses and overwritten on the next successful fetch.

---

## State Transitions

### Pantry item state after "Mark as cooked"

```
PantryItem (active, no consumptionEvents)
    │
    │  POST /recipes/:mealId/cook  { pantryItemIds: [id] }
    ▼
ConsumptionEvent created (type: CONSUMED)
    │
    ▼
PantryItem effectively consumed — excluded from future getUseNext() results
```

This transition reuses the identical path as the existing "consume item" flow in the pantry feature. No new state machine.
