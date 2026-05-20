# Task: TK-020 · feature:portfolio — Add/Edit Holding Sheets MVI + Navigation

## Description

Implement the Add Holding and Edit Holding bottom sheet flows: contracts, view models, sheet composables, and wire `AddHoldingRoute` + `EditHoldingRoute` in `mainGraph`.

**User Stories:** DVX-US-014 · DVX-US-015
**PRD:** PRD-03
**ADRs:** ADR-010, ADR-011
**Stitch Design:** https://stitch.withgoogle.com/projects/10568397103146599411
**Depends on:** TK-019
**Blocks:** TK-021
**Status:** Backlog

---

## Subtasks

### Phase 1: Architecture & Setup
- [ ] **Create Git Branch** `feature/DVX-TK-020-feature-add-edit-holding` — `skill: manage-git-flow`

### Phase 2: Add Holding MVI
- [ ] **`AddHoldingContract`** — State: `searchQuery, searchResults, selectedSecurity, shares, pricePerShare, currency, estimatedTotal, dividendYield?, isLoading, error` · Event/Effect as needed
- [ ] **`AddHoldingViewModel`** + unit tests — `SearchSecuritiesUseCase` (live, 250ms debounce), `AddHoldingUseCase` on confirm, live `estimatedTotal = shares × pricePerShare`
  - **Verify:** `./gradlew :feature:portfolio:jvmTest`
  - **Commit:** `DVX-TK-020 Add AddHolding MVI`

### Phase 3: Edit Holding MVI
- [ ] **`EditHoldingViewModel`** + unit tests — `GetSecurityHoldingUseCase` for pre-fill, `UpdateHoldingUseCase` on save, `RemoveHoldingUseCase` on Delete (after confirmation)
  - **Verify:** `./gradlew :feature:portfolio:jvmTest`
  - **Commit:** `DVX-TK-020 Add EditHolding MVI`

### Phase 4: Sheet UI
- [ ] **`AddHoldingSheet`** + **`EditHoldingSheet`**
  - Drag handle + close button + title
  - Smart search autocomplete (Add mode) · numeric inputs (shares, price) · currency chips (USD · EUR · …)
  - Live "Estimated Total" + Dividend Yield context
  - Primary CTA with haptic feedback (mobile)
  - Edit mode: "Delete Position" destructive button + confirmation dialog
  - **Commit:** `DVX-TK-020 Add Add/Edit Holding sheet UI`

### Phase 5: Navigation + Koin
- [ ] **Wire `AddHoldingRoute` and `EditHoldingRoute`** as bottom sheet destinations in `mainGraph`
  - **Verify:** `./gradlew :composeApp:assembleDebug`
  - **Commit:** `DVX-TK-020 Wire AddHolding and EditHolding routes`

### Phase 6: Testing & Quality
- [ ] `./gradlew test` + `./gradlew detekt`
- [ ] Create Pull Request — `skill: manage-git-flow`

---

## Progress Tracking
**Total Tasks:** 7 **Completed:** 0 **Remaining:** 7

---

## Notes
- Delete confirmation: "Remove {TICKER} from your portfolio? This cannot be undone."
- Currency defaults to `UserSettings.baseCurrency` — use "USD" as default until TK-029 injects `GetSettingsUseCase`
