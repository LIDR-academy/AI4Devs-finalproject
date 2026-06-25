# Quickstart Validation Guide: Recipe Suggestions

**Feature**: 002-recipe-suggestions | **Date**: 2026-06-25

This guide describes how to validate that the feature works end-to-end after implementation. It is not a test suite — it is a runnable validation checklist.

## Prerequisites

1. Backend running on `http://localhost:3000` (`cd back && npm run start:dev`)
2. Frontend running on `http://localhost:3001` (or `npm run dev` in `front/`)
3. Postgres running locally (`docker compose up -d` or equivalent)
4. Prisma migrations up-to-date (`cd back && npx prisma migrate dev`)
5. User account created and JWT token obtained (use `/api/auth/login`)
6. At least 2 pantry items created with:
   - One item named `"Chicken"` expiring within 3 days
   - One item named `"Tomato"` expiring within 7 days

## Validation Scenarios

### S1 — Suggestions list loads

```bash
curl -s http://localhost:3000/api/recipes \
  -H "Authorization: Bearer <token>" | jq '.recipes[0]'
```

**Expected**: JSON object with `id`, `name`, `thumbnailUrl`, `matchedIngredients`, `missingIngredients`, `matchScore`. At least one result with `matchedIngredients` containing `"Chicken"` or `"Tomato"`.

---

### S2 — Results are ranked by expiry-weighted match

```bash
curl -s http://localhost:3000/api/recipes \
  -H "Authorization: Bearer <token>" | jq '[.recipes[] | {name, matchScore}]'
```

**Expected**: Results appear in descending `matchScore` order. Recipes using the soonest-expiring ingredient (`"Chicken"`) rank higher than those using only `"Tomato"`.

---

### S3 — Recipe detail returns full instructions and pantry match

```bash
MEAL_ID=$(curl -s http://localhost:3000/api/recipes \
  -H "Authorization: Bearer <token>" | jq -r '.recipes[0].id')

curl -s http://localhost:3000/api/recipes/$MEAL_ID \
  -H "Authorization: Bearer <token>" | jq '{name, matchedPantryItemIds, ingredientCount: (.ingredients | length)}'
```

**Expected**: `name` is set, `matchedPantryItemIds` is a non-empty array of valid UUIDs, `ingredientCount` is ≥ 1.

---

### S4 — Mark as cooked creates consumption events and updates pantry

```bash
# Get matched pantry item IDs from detail
MEAL_ID="<meal-id-from-S3>"
PANTRY_IDS=$(curl -s http://localhost:3000/api/recipes/$MEAL_ID \
  -H "Authorization: Bearer <token>" | jq -c '.matchedPantryItemIds')

# Cook the recipe
curl -s -X POST http://localhost:3000/api/recipes/$MEAL_ID/cook \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d "{\"pantryItemIds\": $PANTRY_IDS}" | jq .

# Verify items are consumed — they should no longer appear in use-next
curl -s http://localhost:3000/api/pantry/use-next \
  -H "Authorization: Bearer <token>" | jq '[.items[].name]'
```

**Expected**: Cook response has `consumedCount > 0` and `events` array. The consumed item names no longer appear in `GET /api/pantry/use-next`.

---

### S5 — Graceful degradation when TheMealDB is unreachable

Block TheMealDB in `/etc/hosts` or simulate by temporarily pointing the URL to a non-existent host in the service.

```bash
curl -s http://localhost:3000/api/recipes \
  -H "Authorization: Bearer <token>"
```

**Expected**: HTTP 503 with message `"Recipe suggestions are temporarily unavailable..."`. No crash, no unhandled error stack trace.

---

### S6 — Unauthorized access blocked

```bash
curl -s http://localhost:3000/api/recipes
```

**Expected**: HTTP 401 `{ "statusCode": 401, "message": "Unauthorized" }`.

---

### S7 — Cook with wrong pantry IDs rejected

```bash
curl -s -X POST http://localhost:3000/api/recipes/52795/cook \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"pantryItemIds": ["00000000-0000-0000-0000-000000000000"]}'
```

**Expected**: HTTP 404 — pantry item not found. No consumption events created.

---

## UI Validation

1. Open `http://localhost:3001/recipes` in a browser
2. Verify: Recipe cards load with real data (not mock data), showing thumbnail images and pantry match counts
3. Click a recipe card → verify detail view shows instructions and ingredient list with matched items highlighted
4. Tap "Mark as cooked" → verify success toast appears and the consumed pantry items no longer appear in the pantry list
5. Open the app with TheMealDB blocked → verify a user-friendly error message appears instead of a blank screen or crash

## Test Suite Commands

```bash
# Backend unit tests (from back/)
npx jest --config ./test/jest-unit.json --testPathPattern=recipes

# Backend E2E tests (from back/)
npx jest --config ./test/jest-e2e.json --testPathPattern=recipes

# Frontend unit tests (from front/)
npx vitest run src/features/recipes src/components/RecipeCard

# Frontend E2E (from front/)
npx playwright test tests/e2e/recipes/
```

## References

- [API Contracts](./contracts/api.md)
- [Data Model](./data-model.md)
- [Feature Spec](./spec.md)
