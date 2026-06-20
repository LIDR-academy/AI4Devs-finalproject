# EXT-007 — Automatic Expiry Learning from User Overrides

## Metadata
- **Type:** Full-Stack (Backend + Frontend)
- **Priority:** P2
- **Phase:** 2 — Growth
- **PRD Reference:** [P2-003](../../product/5_Extended-Non-MVP-PRD.md#p2-003-automatic-expiry-learning-from-user-overrides)
- **Effort:** Medium
- **Depends on:** TKT-004 (expiration estimation — done)

---

## User Story

As a user, I want the system to remember my preferred expiry windows per food category, so that I spend less time correcting the same suggestions over and over.

---

## Context

The MVP expiration module (TKT-004) stores an `ExpirationAssessment` each time a suggestion is generated and when the user overrides it. The override date is persisted on `PantryItem.expirationDate`. However, the delta (how many days off the suggestion was) is never used to improve future estimates.

This ticket adds a **pure data-driven learning layer** — no AI, no ML infrastructure, no external service:

- When the user confirms an override, compute the signed delta: `userDays - suggestedDays` per category.
- Store it in a new `UserCategoryExpiryPreference` table.
- Maintain a rolling weighted average of the last 5 overrides per user per category.
- On next estimate for the same user+category, apply the average delta on top of the baseline rule.
- Clamp to a ±30-day window to prevent runaway offsets from outliers.

The confidence level is upgraded from `LOW` to `MEDIUM` once a category has ≥ 3 historical overrides.

---

## Affected Slices

| Slice | Path | Change |
|---|---|---|
| Prisma schema | `back/prisma/schema.prisma` | Add `UserCategoryExpiryPreference` model |
| Backend — module | `back/src/modules/expiration/` | Update `ExpirationService` to read/write preferences |
| Backend — module | `back/src/modules/expiration/` | Update `overrideExpiration` to store delta |
| Backend — module | `back/src/modules/expiration/expiration.controller.ts` | New preferences endpoints |
| Frontend — features | `front/src/features/pantry/pantry.api.ts` | Add preferences API calls |
| Frontend — routes | `front/src/routes/settings.tsx` | Show per-category learning summary + reset |

---

## API Contracts

```
GET /api/expiration/preferences
Response: {
  preferences: Array<{
    category: string
    averageDelta: number     // days; positive = user prefers longer, negative = shorter
    sampleCount: number
    lastUpdatedAt: string
  }>
}

DELETE /api/expiration/preferences/:category
Response: 204

DELETE /api/expiration/preferences
Response: 204   (reset all)
```

The existing `PATCH /api/pantry/items/:id/expiration` endpoint is extended (not replaced) to record the delta when the user saves an override.

---

## Data Model Changes

```prisma
model UserCategoryExpiryPreference {
  id            String   @id @default(uuid())
  userId        String
  category      String   // e.g. "dairy", "produce", "meat"
  deltas        Float[]  // last 5 override deltas (days); oldest dropped on insert
  averageDelta  Float    @default(0)
  sampleCount   Int      @default(0)
  updatedAt     DateTime @updatedAt
  user          User     @relation(fields: [userId], references: [id])

  @@unique([userId, category])
  @@index([userId])
}
```

Migration: `npx prisma migrate dev --name add-user-category-expiry-preference`.

---

## Algorithm Detail

```
function recordOverride(userId, category, suggestedDate, userDate):
  delta = daysBetween(suggestedDate, userDate)   // signed integer
  pref = findOrCreate(userId, category)
  pref.deltas = [...pref.deltas.slice(-4), delta]  // keep last 5
  pref.averageDelta = mean(pref.deltas)
  pref.sampleCount += 1
  save(pref)

function applyLearning(userId, category, baseEstimateDate):
  pref = find(userId, category)
  if pref == null: return baseEstimateDate
  adjusted = baseEstimateDate + pref.averageDelta (days)
  return clamp(adjusted, baseEstimateDate - 30, baseEstimateDate + 30)

function confidenceLevel(pref):
  if pref == null or pref.sampleCount < 3: return baseline_confidence
  return max(baseline_confidence, MEDIUM)
```

---

## Technical Implementation Tasks

Follow TDD: write failing tests before implementing.

1. **Prisma migration** — add `UserCategoryExpiryPreference` model, run migration.

2. **Preference repository** (`back/src/modules/expiration/expiration-preference.repository.ts`)
   - `findByUserAndCategory(userId, category): Promise<UserCategoryExpiryPreference | null>`
   - `upsertDelta(userId, category, delta): Promise<UserCategoryExpiryPreference>`
     - Appends delta to `deltas` array (last 5).
     - Recomputes `averageDelta = mean(deltas)`.
     - Increments `sampleCount`.
   - `deleteCategory(userId, category): Promise<void>`
   - `deleteAll(userId): Promise<void>`
   - Unit tests: verify delta rolling window (drop oldest when >5), averageDelta computation.

3. **Update `overrideExpiration`** (`back/src/modules/expiration/expiration.service.ts`)
   - After saving the override, look up the original `ExpirationAssessment.suggestedExpirationDate`.
   - Compute delta in days.
   - Infer category from `ExpirationAssessment.category` (already stored).
   - Call `ExpirationPreferenceRepository.upsertDelta`.
   - Unit tests: assert `upsertDelta` called with correct delta; assert no call when no prior assessment.

4. **Update `estimateExpiration`** (`back/src/modules/expiration/expiration.service.ts`)
   - After computing the base estimate, call `ExpirationPreferenceRepository.findByUserAndCategory`.
   - Apply `averageDelta` offset (clamped ±30 days).
   - Upgrade confidence from `LOW` to `MEDIUM` if `sampleCount >= 3`.
   - Unit tests: verify offset applied, clamp enforced, confidence upgrade.

5. **Preferences controller** (`back/src/modules/expiration/expiration.controller.ts`)
   - `GET /expiration/preferences` — list all preferences for the user.
   - `DELETE /expiration/preferences/:category` — reset one category.
   - `DELETE /expiration/preferences` — reset all.
   - Unit tests: 200, 204 responses; 404 on missing category delete.

6. **Frontend — API bindings** (`front/src/features/pantry/pantry.api.ts`)
   - `getExpiryPreferences(): Promise<ExpiryPreference[]>`
   - `resetExpiryPreference(category: string): Promise<void>`
   - `resetAllExpiryPreferences(): Promise<void>`

7. **Settings UI** (`front/src/routes/settings.tsx`)
   - New section: "Expiry learning" — shows a list of categories where preferences have been learned.
   - Each row: category name, average delta (e.g. "You prefer +5 days for Dairy"), sample count, reset button.
   - "Reset all" button at bottom.
   - Vitest: renders list, shows correct average delta, reset button triggers API call.

---

## Error Handling

- If category cannot be inferred from the `ExpirationAssessment` (rare), skip delta recording silently — do not fail the override save.
- If `upsertDelta` throws (DB error), log a warning but still return the override response — learning failure must not block the user's edit.
- Preference fetch failure on settings page → show empty state (not an error page).

---

## Security

- All preference endpoints are JWT-protected; preferences are scoped to the authenticated user.
- `DELETE /preferences` can only delete the caller's own preferences (enforced by `userId` from JWT, not from URL).
- `deltas` array is an internal field; not returned in the `GET /preferences` response (return only `averageDelta` and `sampleCount`).

---

## Testing Requirements

| Test type | Coverage |
|---|---|
| Unit — preference repository | rolling delta window, average computation |
| Unit — estimation service | offset applied, clamp, confidence upgrade |
| Unit — override handler | delta recorded after user save |
| Unit — preferences controller | list, delete one, delete all |
| Vitest — settings page | list renders, reset triggers API |
| Integration | override item 3× in same category, verify 4th estimate is adjusted |

---

## Acceptance Criteria

1. After a user overrides an expiry suggestion in a category 3 times with a consistent offset, the next suggestion for the same category is automatically adjusted by the average offset.
2. The adjusted confidence level is `MEDIUM` (not `LOW`) for categories with ≥ 3 overrides.
3. The settings page shows a list of learned categories with the average delta in human-readable form (e.g., "+5 days for Dairy").
4. User can reset learning for a single category or all categories from settings.
5. The override save endpoint still returns within 200 ms after learning is applied (no blocking calls).

---

## Non-Goals

- AI/ML model training — this is a pure weighted-average algorithm in the NestJS service.
- Cross-user learning (user preferences are strictly per-user, never aggregated in this ticket).
- Learning from items where no `ExpirationAssessment` exists (manual add without estimate).

---

## Open Questions

1. Should the delta be shown to the user in the expiry estimation UI ("Your preference: +5 days")? (Recommendation: yes, on the confidence badge tooltip — transparent and builds trust.)
2. Should a large single-outlier delta (e.g. +180 days) be clipped before storage, or only at apply-time? (Recommendation: clip at apply-time only; store raw deltas to allow future recalculation.)

---

## Readiness Check

- [x] Clear actor and value
- [x] Testable acceptance criteria
- [x] Scope is a contained backend extension + small settings UI
- [x] Dependencies identified (TKT-004 done; no external services required)
