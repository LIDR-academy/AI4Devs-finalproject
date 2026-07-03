# Data Model: Automatic Expiry Learning from User Overrides

## New Model: UserCategoryExpiryPreference

Stores the accumulated learning data for one user's expiry preferences for one food category.

### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK, auto-generated | Unique identifier |
| `userId` | String | FK → User, NOT NULL | Owner of this preference |
| `category` | String | NOT NULL | Food category key (see Category Values below) |
| `deltas` | Float[] | NOT NULL, default `[]` | Sliding window of the last 5 signed override differences (days). Positive = user prefers longer; negative = shorter. Oldest entry dropped when a 6th is added. |
| `averageDelta` | Float | NOT NULL, default `0` | Rolling mean of `deltas`; recomputed on every upsert |
| `sampleCount` | Int | NOT NULL, default `0` | Total number of overrides ever recorded for this user+category (not capped; incremented on every upsert) |
| `updatedAt` | DateTime | auto-managed | Last write timestamp |

### Indexes and Constraints

- `@@unique([userId, category])` — one record per user per category; upsert-friendly
- `@@index([userId])` — efficient lookup of all preferences for a given user

### Relationships

- Belongs to `User` via `userId` (cascade delete: when user is deleted, preferences are deleted)
- The `User` model gains a new relation field: `categoryExpiryPreferences UserCategoryExpiryPreference[]`

---

## Existing Model Changes

### ExpirationAssessment (no schema change)

Two behavioral changes in how the existing fields are populated:

1. **`suggestedExpirationDate`**: When learning is applied, stores the *adjusted* date (baseline + averageDelta, clamped ±30 days). This is the date shown to the user.
2. **`confidence`**: When `sampleCount >= 3` for the user+category, stored as `Math.max(baseConfidence, 0.60)`. No column type change; `Decimal(3,2)` already accommodates 0.60.

### ExpirationMethod enum (no change)

`RULE_BASED_SPAIN` continues to be used for learning-adjusted estimates. No new enum value added.

---

## Delta Rolling Window Rules

Applied on every call to `ExpirationPreferenceRepository.upsertDelta(userId, category, delta)`:

```
existing = findOrCreate(userId, category)   // start with deltas = []
updated  = [...existing.deltas, delta].slice(-5)   // append + keep last 5
average  = sum(updated) / updated.length
sampleCount = existing.sampleCount + 1
save { deltas: updated, averageDelta: average, sampleCount }
```

Examples:

| Call | deltas before | delta | deltas after | averageDelta |
|------|--------------|-------|--------------|-------------|
| 1st  | []           | +5    | [5]          | 5.0 |
| 2nd  | [5]          | +3    | [5, 3]       | 4.0 |
| 3rd  | [5, 3]       | +7    | [5, 3, 7]    | 5.0 |
| 4th  | [5, 3, 7]    | +4    | [5, 3, 7, 4] | 4.75 |
| 5th  | [5, 3, 7, 4] | +6    | [5, 3, 7, 4, 6] | 5.0 |
| 6th  | [5, 3, 7, 4, 6] | +2 | [3, 7, 4, 6, 2] | 4.4 (5 dropped) |

---

## Learning Application Rules

Applied in `ExpirationService.estimateForItem(userId, itemId)` after the baseline estimate is built:

```
pref = findByUserAndCategory(userId, category)

if pref is null or pref.sampleCount < 3:
  use baseEstimateDate unchanged

if pref is not null and pref.sampleCount >= 3:
  adjusted = baseEstimateDate + pref.averageDelta (days)
  adjusted = clamp(adjusted, baseEstimateDate - 30d, baseEstimateDate + 30d)

if pref is not null and pref.sampleCount >= 3:
  confidence = max(baseConfidence, 0.60)
else:
  confidence = baseConfidence

store adjusted (or unchanged) date and confidence in ExpirationAssessment
```

---

## Category Values

Matches the `category` string returned by `ExpirationRulesService.estimateFromName`:

| Value | Example items |
|-------|--------------|
| `"dairy"` | yogurt, milk, cheese, butter |
| `"meat_fish"` | chicken, beef, fish, salmon |
| `"produce"` | apple, banana, tomato, lettuce, carrot |
| `"bakery"` | bread, croissant, muffin |
| `"pantry"` | rice, pasta, canned goods, beans |
| `"unknown"` | items not matching any keyword rule |

The `"unknown"` category is the only one where the confidence upgrade (to ≥ 0.60) has practical effect, since all named categories already have baseline confidence ≥ 0.70.

---

## Repository Operations

| Method | Signature | Behavior |
|--------|-----------|----------|
| `findByUserAndCategory` | `(userId, category) → Preference \| null` | Returns the full record or null |
| `upsertDelta` | `(userId, category, delta) → Preference` | Appends delta, truncates to 5, recomputes average, increments sampleCount |
| `deleteCategory` | `(userId, category) → void` | Deletes the record; no error if not found (idempotent) |
| `deleteAll` | `(userId) → void` | Deletes all records for this userId |
