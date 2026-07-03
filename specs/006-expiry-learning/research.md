# Research: Automatic Expiry Learning from User Overrides

All technical unknowns resolved below. No external services, no new infrastructure, no cross-module dependencies needed.

---

## Decision 1: Placement of New Preference Endpoints

**Decision**: Add a new `ExpirationPreferencesController` with `@Controller("expiration")` base path to the existing `ExpirationModule`. Register it alongside `ExpirationController` (which keeps its `"pantry/items"` base path).

**Rationale**: The preference endpoints (`/expiration/preferences`) have a different URL family than pantry item endpoints (`/pantry/items/:id/...`). Mixing two base paths in one controller is non-standard NestJS. A second controller in the same module satisfies single-responsibility without introducing a cross-module dependency.

**Alternatives considered**:
- Extend `ExpirationController` with ad-hoc routes: rejected — mixing `"pantry/items"` and `"expiration"` base paths in one controller is misleading and fragile.
- Create a new `ExpirationPreferencesModule`: rejected — preferences require direct injection of `ExpirationPreferenceRepository`; an independent module would need re-export plumbing with no benefit.

---

## Decision 2: Delta Capture Timing in overrideItemExpiration

**Decision**: Read the existing `ExpirationAssessment` (if any) **before** the upsert in `overrideItemExpiration`. Compute the delta only when the pre-existing assessment has `method = RULE_BASED_SPAIN`. Record the delta in a try/catch that logs the error on failure and never rethrows.

**Rationale**: After the upsert the assessment row is overwritten with `method = MANUAL_OVERRIDE`. Reading before the upsert is the only reliable way to get the original rule-based suggestion. Scoping to `RULE_BASED_SPAIN` prevents recording deltas against a previous manual override (which would create a stacked learning bias). The try/catch guarantees that a DB error in preference storage never fails the override save.

**Alternatives considered**:
- Add a `originalSuggestedDate` column to `ExpirationAssessment`: rejected — unnecessary schema change; pre-read achieves the same result.
- Record delta in a background job after the upsert: rejected — adds async complexity for no gain; synchronous pre-read is simpler and fast.

---

## Decision 3: Confidence Upgrade Numeric Representation

**Decision**: Apply `adjustedConfidence = Math.max(baseConfidence, 0.60)` when storing the `ExpirationAssessment.confidence` value, if `sampleCount >= 3` for the user+category. No schema change needed.

**Rationale**: The existing system treats `confidence < 0.60` as `lowConfidence = true`. Raising to at least 0.60 is the minimal, non-breaking upgrade to "Medium" using the existing numeric scale. The `Decimal(3,2)` column accommodates 0.60. All named categories already have baseline confidence ≥ 0.60; this upgrade is practically meaningful only for the `"unknown"` category (baseline 0.45).

**Alternatives considered**:
- Add a `confidence_tier` enum (LOW/MEDIUM/HIGH): rejected — adds a migration and type changes across the entire expiration system without user-facing benefit.
- Add a `learningApplied: Boolean` column: rejected — `lowConfidence` derived from the numeric value already drives UI; a separate boolean is redundant.

---

## Decision 4: What Date Is Stored in ExpirationAssessment After Learning

**Decision**: Store the **learning-adjusted** date as `ExpirationAssessment.suggestedExpirationDate`. This is the date shown to the user as the suggestion.

**Rationale**: Future delta computation on a subsequent override should be relative to the date the user actually saw — the adjusted date. If the system suggests 12 days (7 baseline + 5 learned) and the user overrides to 14 days, the delta is +2, not +7. This incremental correction is the intended behavior: the system converges toward a delta of 0 (no correction needed) as it learns the user's preference.

**Alternatives considered**:
- Store unadjusted baseline date separately: rejected — over-engineering; storing only the adjusted date is sufficient.

---

## Decision 5: No New ExpirationMethod Enum Value

**Decision**: Continue using `RULE_BASED_SPAIN` as the method for learning-adjusted estimates.

**Rationale**: The method identifies the source of the estimate's logic (the Spain-calibrated rule set), not whether a personalization delta was applied. Adding a new enum value would require frontend changes to handle it and a Prisma migration. The `sampleCount` and `averageDelta` in the preference record already provide the audit trail.

**Alternatives considered**:
- Add `RULE_BASED_SPAIN_WITH_LEARNING`: rejected — complexity without user-facing benefit; confidence level is the signal that learning has been applied.

---

## Decision 6: Deltas Array Storage

**Decision**: Store `deltas` as a PostgreSQL `Float[]` column (Prisma array type). Slice/append/mean logic runs in TypeScript in `ExpirationPreferenceRepository.upsertDelta`.

**Rationale**: The window is always ≤ 5 elements. Application-level array manipulation is simple, unit-testable without a real DB, and avoids complex SQL array functions. Prisma's `Float[]` maps directly to PostgreSQL `double precision[]`.

**Alternatives considered**:
- Separate child table (one row per delta): rejected — a join table with a max of 5 rows is disproportionate overhead.
- JSON string column: rejected — PostgreSQL native Float[] gives type safety and direct Prisma support without manual serialization.

---

## Decision 7: Frontend API Function Placement

**Decision**: Add `getExpiryPreferences`, `resetExpiryPreference`, and `resetAllExpiryPreferences` to `front/src/features/pantry/pantry.api.ts`.

**Rationale**: The ticket specifies this file. Existing expiration functions (`estimateExpiration`, `overrideExpiration`, `estimateExpirationByName`) are already there. Maintaining consistency within the file is more important than splitting by sub-feature at the current file size.

**Alternatives considered**:
- Dedicated `expiration-preferences.api.ts`: applicable if the file grows to an unmanageable size; premature now.
