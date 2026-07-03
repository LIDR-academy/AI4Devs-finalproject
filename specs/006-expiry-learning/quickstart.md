# Quickstart: Expiry Learning Validation

Runnable validation scenarios that confirm the feature works end-to-end. Run after implementation is complete.

See [contracts/expiration-preferences-api.md](./contracts/expiration-preferences-api.md) for API shapes and [data-model.md](./data-model.md) for delta rules.

---

## Prerequisites

- Backend running: `cd back && npm run start:dev`
- Frontend running: `cd front && npm run dev`
- An authenticated user session (register or log in via `/auth`)
- Prisma migration applied: `cd back && npx prisma migrate dev`

---

## Scenario 1: Learning Data Is Recorded After Overrides

**Goal**: Verify that overriding the expiry suggestion for items in the same category records preference data.

Steps:
1. Add a pantry item named "Greek Yogurt" and estimate its expiry (expected: ~7 days for dairy).
2. Override the expiry to 12 days from now (+5 day delta). Save.
3. Add "Milk", estimate, override to +5 days again. Save.
4. Add "Cheese", estimate, override to +5 days. Save.
5. Navigate to **Settings → Expiry Learning**.

Expected:
- `"dairy"` appears in the list.
- Average delta shown as approximately **+5 days**.
- Sample count is 3.

---

## Scenario 2: Fourth Estimate Is Automatically Adjusted

**Goal**: Verify that the suggestion for a category with ≥ 3 overrides is adjusted.

Continuing from Scenario 1:

Steps:
1. Add a 4th dairy item (e.g., "Butter").
2. Click **Estimate expiry**.

Expected:
- Suggested date is approximately **12 days** from now (7 baseline + 5 learned), not 7.
- The confidence indicator is NOT flagged as low confidence.

---

## Scenario 3: Clamp Is Enforced on Extreme Deltas

**Goal**: Verify that adjustments exceeding ±30 days are clamped.

Steps:
1. Add 5 pantry items whose names are unrecognized (e.g., "Mystery Ingredient A" through "E").
2. For each, estimate and override to +100 days (far beyond the 30-day clamp).
3. Add a 6th unrecognized item and estimate.

Expected:
- Suggested date is at most **37 days** from now (7 baseline unknown + 30 clamp), never 107 days.

---

## Scenario 4: Reset Single Category

**Goal**: Verify that resetting one category removes its learning without affecting others.

Prerequisites: Scenario 1 completed AND at least one override recorded for a second category (e.g., "produce").

Steps:
1. In **Settings → Expiry Learning**, click **Reset** next to "dairy".
2. Add a new dairy item and estimate.

Expected:
- "dairy" no longer appears in the preferences list immediately after reset.
- Suggested date for the new dairy item uses the **baseline rule (7 days)**, no adjustment.
- "produce" preferences remain intact (if present).

---

## Scenario 5: Reset All Preferences

**Goal**: Verify that "Reset all" clears every learned preference.

Steps:
1. In **Settings → Expiry Learning**, click **Reset all**.

Expected:
- Preferences list shows **empty state**, not an error page.
- Next expiry estimate for any category uses the baseline rule.

---

## Scenario 6: Learning Failure Does Not Block Override

**Goal**: Verify the override endpoint responds successfully even if preference storage throws.

Steps (test environment only — temporarily force `ExpirationPreferenceRepository.upsertDelta` to throw):
1. Override an expiry date for any item with a prior rule-based estimate.

Expected:
- Override returns **200 OK** with the correct response shape.
- Backend console shows a **warning log** (not an error response to the client).
- No error message appears in the UI.

---

## Automated Test Reference

| Layer | File | Coverage |
|-------|------|----------|
| Backend unit | `expiration-preference.repository.spec.ts` | Rolling window, average computation, deleteCategory idempotency |
| Backend unit | `expiration.service.spec.ts` | Delta recorded with correct value, clamp enforced, confidence upgrade at sampleCount ≥ 3, no call when no prior RULE_BASED assessment |
| Backend unit | `expiration.controller.spec.ts` | GET 200 with preferences, DELETE 204, 401 on missing JWT |
| Frontend unit | `settings.test.tsx` | ExpiryLearning section renders list, shows correct delta text, reset button triggers correct API call |
| Integration | Scenario 1–2 above | Override 3× same category → 4th estimate is adjusted |
