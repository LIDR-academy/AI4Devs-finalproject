# Tasks: Automatic Expiry Learning from User Overrides

**Input**: Design documents from `specs/006-expiry-learning/`

**Prerequisites**: [plan.md](./plan.md) · [spec.md](./spec.md) · [research.md](./research.md) · [data-model.md](./data-model.md) · [contracts/expiration-preferences-api.md](./contracts/expiration-preferences-api.md) · [quickstart.md](./quickstart.md)

**TDD**: Tests are mandatory per the RealSaveFooding Constitution (Principle I). Every implementation task is preceded by a failing test task. Write the test, confirm it fails, then implement.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel with other tasks at the same level (touches different files, no incomplete dependency)
- **[US#]**: Which user story this task delivers (maps to spec.md)

---

## Phase 1: Setup (Prisma Schema + Migration)

**Purpose**: Create the new database model and run the migration. Blocks ALL subsequent phases.

**⚠️ CRITICAL**: No repository, service, or frontend work can begin until the migration has been applied.

- [X] T001 Add `UserCategoryExpiryPreference` model and `categoryExpiryPreferences UserCategoryExpiryPreference[]` relation to `User` model in `back/prisma/schema.prisma`
- [X] T002 Run Prisma migration from `back/`: `npx prisma migrate dev --name add-user-category-expiry-preference`

**Checkpoint**: `back/prisma/migrations/` contains the new migration file; `npx prisma studio` shows the `UserCategoryExpiryPreference` table.

---

## Phase 2: Foundational — ExpirationPreferenceRepository

**Purpose**: Build and register the repository that all downstream service and controller tasks depend on.

**⚠️ CRITICAL**: Must be complete before Phase 3. Tests MUST fail before implementation.

- [X] T003 Write failing unit tests for `ExpirationPreferenceRepository` in `back/src/modules/expiration/expiration-preference.repository.spec.ts` — cover: `upsertDelta` rolling window (drop oldest when > 5 entries), `upsertDelta` averageDelta recomputation, `upsertDelta` sampleCount increment, `deleteCategory` idempotency (no error when record does not exist), `deleteAll` removes all records for userId
- [X] T004 Create `ExpirationPreferenceRepository` in `back/src/modules/expiration/expiration-preference.repository.ts` with methods: `findByUserAndCategory(userId, category)`, `upsertDelta(userId, category, delta)`, `deleteCategory(userId, category)`, `deleteAll(userId)` — inject `PrismaService`; `upsertDelta` must use `slice(-5)` to enforce the rolling window and recompute `averageDelta` as `mean(deltas)`
- [X] T005 Register `ExpirationPreferenceRepository` as a provider in `back/src/modules/expiration/expiration.module.ts`

**Checkpoint**: Run `cd back && npm test expiration-preference.repository` — all T003 tests pass.

---

## Phase 3: User Story 1 — Improved Expiry Suggestions (Priority: P1) 🎯 MVP

**Goal**: When a user has ≥ 3 overrides in a food category, future estimates for that category are automatically adjusted by the rolling average delta (clamped ±30 days).

**Independent Test**: Seed 3 calls to `ExpirationPreferenceRepository.upsertDelta` for `(userId, "dairy", +5)`, then call `ExpirationService.estimateForItem` for a dairy item owned by that user — verify the returned `suggestedExpirationDate` is 5 days later than the baseline rule would produce.

### Tests (write first — must FAIL before T008–T010)

- [X] T006 [US1] Write failing unit test for delta recording in `back/src/modules/expiration/expiration.service.spec.ts`: assert `upsertDelta` is called with the correct signed delta when `overrideItemExpiration` is called and a prior `RULE_BASED_SPAIN` assessment exists; assert `upsertDelta` is NOT called when no prior assessment exists; assert `upsertDelta` is NOT called when prior assessment has `method = MANUAL_OVERRIDE`
- [X] T007 [US1] Write failing unit test for delta application in `back/src/modules/expiration/expiration.service.spec.ts`: assert `estimateForItem` returns a `suggestedExpirationDate` offset by `averageDelta` when a preference exists; assert the result is clamped to exactly +30 days when `averageDelta` exceeds +30; assert the result is clamped to exactly −30 days when `averageDelta` is below −30; assert no change when no preference exists

### Implementation

- [X] T008 [US1] Inject `ExpirationPreferenceRepository` into `ExpirationService` constructor in `back/src/modules/expiration/expiration.service.ts`
- [X] T009 [US1] Modify `overrideItemExpiration` in `back/src/modules/expiration/expiration.service.ts` to: (1) read `ExpirationAssessment` for `pantryItem.id` BEFORE the upsert, (2) if found and `method === ExpirationMethod.RULE_BASED_SPAIN`, compute `delta = daysBetween(assessment.suggestedExpirationDate, dto.expirationDate)`, (3) call `this.expirationPreferenceRepository.upsertDelta(userId, assessment.category, delta)` inside a `try/catch` that logs a warning and swallows the error without rethrowing
- [X] T010 [US1] Modify `estimateForItem` in `back/src/modules/expiration/expiration.service.ts` to: (1) after `expirationRulesService.buildEstimate`, call `expirationPreferenceRepository.findByUserAndCategory(userId, estimate.category)`, (2) if preference found, compute `adjustedDate = baseDate + averageDelta days`, clamp to `[baseDate − 30d, baseDate + 30d]`, store as `suggestedExpirationDate` in the `ExpirationAssessment` upsert

**Checkpoint**: `cd back && npm test expiration.service` — T006 and T007 tests pass.

---

## Phase 4: User Story 2 — Confidence Level Reflects Learning Progress (Priority: P2)

**Goal**: When `sampleCount ≥ 3` for a user+category, the confidence of the estimate is raised to at least 0.60 (`lowConfidence = false`).

**Independent Test**: Seed a preference with `sampleCount = 3` for the `"unknown"` category (baseline confidence 0.45), call `estimateForItem` for an unrecognized item — verify `confidence ≥ 0.60` and `lowConfidence = false` in the response.

### Tests (write first — must FAIL before T012)

- [X] T011 [US2] Write failing unit test for confidence upgrade in `back/src/modules/expiration/expiration.service.spec.ts`: assert `confidence ≥ 0.60` in the assessment upsert when `sampleCount = 3`; assert `confidence` equals the baseline value when `sampleCount = 2`; assert `confidence` is unchanged for categories whose baseline already exceeds 0.60 (e.g., dairy at 0.86 stays 0.86, not capped downward)

### Implementation

- [X] T012 [US2] Modify `estimateForItem` in `back/src/modules/expiration/expiration.service.ts` to: after reading the preference, set `adjustedConfidence = pref && pref.sampleCount >= 3 ? Math.max(estimate.confidence, 0.60) : estimate.confidence`, store `adjustedConfidence.toFixed(2)` in the `ExpirationAssessment` upsert

**Checkpoint**: `cd back && npm test expiration.service` — T011 test passes; no previously passing tests regress.

---

## Phase 5: User Story 3 — View Learned Preferences in Settings (Priority: P3)

**Goal**: A settings section lists all food categories where learning has occurred, showing the average adjustment per category in plain language. Shows an empty state when no preferences exist.

**Independent Test**: (1) Call `GET /api/expiration/preferences` after seeding preference data — verify 200 response with correct category list, averageDeltas, and sampleCounts. (2) Render `SettingsPage` with mocked `getExpiryPreferences` returning two entries — verify both categories appear with human-readable delta text.

### Tests (write first — must FAIL before T015–T019)

- [X] T013 [P] [US3] Write failing unit test for `GET /expiration/preferences` in `back/src/modules/expiration/expiration.controller.spec.ts`: assert 200 with `{ preferences: [...] }` when preferences exist; assert 200 with `{ preferences: [] }` when none; assert 401 when no JWT (test that `JwtAuthGuard` is applied)
- [X] T014 [P] [US3] Write failing Vitest tests for the ExpiryLearning section in `front/src/routes/settings.test.tsx`: assert the section renders when `getExpiryPreferences` returns two entries; assert each row shows the category name and a human-readable delta string ("+5 days" / "−2 days"); assert an empty state message renders when `getExpiryPreferences` returns an empty array; assert no error page renders when the API call rejects

### Implementation

- [X] T015 [US3] Create `ExpiryPreferenceResponseDto` class in `back/src/modules/expiration/dto/expiry-preference.dto.ts` with fields: `category: string`, `averageDelta: number`, `sampleCount: number`, `lastUpdatedAt: string`; also export a `ExpiryPreferencesResponseDto` wrapping `preferences: ExpiryPreferenceResponseDto[]`
- [X] T016 [US3] Add `ExpirationPreferencesController` class (decorated with `@Controller("expiration")` and `@UseGuards(JwtAuthGuard)`) and a `@Get("preferences")` handler that calls `ExpirationPreferenceService` (or repository directly) and returns `ExpiryPreferencesResponseDto` in `back/src/modules/expiration/expiration.controller.ts`
- [X] T017 [US3] Register `ExpirationPreferencesController` in the `controllers` array of `back/src/modules/expiration/expiration.module.ts`
- [X] T018 [US3] Add `ExpiryPreference` interface, `ExpiryPreferencesResponse` interface, and `getExpiryPreferences(): Promise<ExpiryPreferencesResponse>` function to `front/src/features/pantry/pantry.api.ts` calling `GET /expiration/preferences`
- [X] T019 [US3] Add `ExpiryLearning` section to `front/src/routes/settings.tsx`: fetch preferences on mount via `getExpiryPreferences`; render a `<Group title="Expiry Learning" ...>` section; for each preference show category name + `averageDelta` formatted as "+N days" or "−N days"; show empty-state text when `preferences.length === 0`; on fetch failure show empty state (not error page)

**Checkpoint**: `cd back && npm test expiration.controller` passes T013. `cd front && npm test settings` passes T014.

---

## Phase 6: User Story 4 — Reset Learned Preferences (Priority: P3)

**Goal**: User can reset learning for a single category or all categories from the Settings page. Resets take immediate effect on subsequent estimates.

**Independent Test**: (1) Call `DELETE /api/expiration/preferences/dairy` (204), then `GET /api/expiration/preferences` — verify "dairy" is absent. (2) Click the Reset button for "dairy" in the rendered ExpiryLearning section — verify `resetExpiryPreference("dairy")` was called.

### Tests (write first — must FAIL before T022–T024)

- [X] T020 [P] [US4] Write failing unit tests for `DELETE /expiration/preferences/:category` and `DELETE /expiration/preferences` in `back/src/modules/expiration/expiration.controller.spec.ts`: assert 204 when preference exists; assert 204 when preference does not exist (idempotent); assert 401 when no JWT
- [X] T021 [P] [US4] Write failing Vitest tests for reset buttons in `front/src/routes/settings.test.tsx`: assert clicking a per-category Reset button calls `resetExpiryPreference(category)`; assert clicking "Reset all" calls `resetAllExpiryPreferences`; assert the preferences list re-fetches after a successful reset

### Implementation

- [X] T022 [US4] Add `@Delete("preferences/:category")` and `@Delete("preferences")` handlers to `ExpirationPreferencesController` in `back/src/modules/expiration/expiration.controller.ts`: each calls the corresponding repository method and returns `@HttpCode(HttpStatus.NO_CONTENT)`
- [X] T023 [US4] Add `resetExpiryPreference(category: string): Promise<void>` and `resetAllExpiryPreferences(): Promise<void>` to `front/src/features/pantry/pantry.api.ts` calling `DELETE /expiration/preferences/:category` and `DELETE /expiration/preferences` respectively
- [X] T024 [US4] Add per-category Reset button (calls `resetExpiryPreference(category)`) and a "Reset all" button (calls `resetAllExpiryPreferences`) to the `ExpiryLearning` section in `front/src/routes/settings.tsx`; on success, re-fetch preferences; on failure, show inline error message in the section (not a full error page)

**Checkpoint**: All controller spec tests pass. All settings.test.tsx tests pass.

---

## Final Phase: Polish & Cross-Cutting Concerns

**Purpose**: Type safety verification, full test suite confirmation, and end-to-end validation.

- [X] T025 [P] Run `cd back && npx tsc --noEmit` — assert zero TypeScript errors
- [X] T026 [P] Run `cd front && npx tsc --noEmit` — assert zero TypeScript errors
- [X] T027 Run full backend test suite: `cd back && npm test` — assert all tests pass including new repository, service, and controller specs
- [X] T028 Run full frontend test suite: `cd front && npm test` — assert all tests pass including updated `settings.test.tsx`

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup) → Phase 2 (Foundational) → Phase 3 (US1) → Phase 4 (US2) → Phase 5 (US3) → Phase 6 (US4) → Final
```

- **Phase 1**: No dependencies — start immediately
- **Phase 2**: Requires Phase 1 (Prisma types must be generated before repository compilation)
- **Phase 3**: Requires Phase 2 (repository must exist to inject into service)
- **Phase 4**: Requires Phase 3 (modifies the same `estimateForItem` function)
- **Phase 5**: Requires Phase 2 (repository); Phase 3+4 should be complete for a coherent demo but are not strictly blocking the GET endpoint
- **Phase 6**: Requires Phase 5 (DELETE endpoints extend the same controller; reset buttons extend the same settings section)
- **Final**: Requires all phases

### User Story Dependencies

| Story | Blocking dependency | Independently testable? |
|-------|--------------------|-----------------------|
| US1 | Phase 2 (repository) | Yes — service unit tests validate independently |
| US2 | US1 (same function) | Yes — add one more assertion to estimateForItem |
| US3 | Phase 2 (repository data to display) | Yes — GET endpoint + settings render independently |
| US4 | US3 (same controller class + same settings section) | Yes — DELETE tests and reset button tests are independent |

### Within Each Phase

1. Write test → confirm it FAILS → implement → confirm it PASSES
2. Models/DTOs before services
3. Services before controllers
4. Backend before frontend
5. Commit after each task

### Parallel Opportunities

Within Phase 5 (US3), T013 and T014 can run in parallel (different files — backend controller spec vs frontend settings spec).

Within Phase 6 (US4), T020 and T021 can run in parallel (same reason).

Within Final Phase, T025 and T026 can run in parallel.

---

## Parallel Execution Example: Phase 5

```
# Run these in parallel — different files, no shared dependency:
T013: Write failing controller spec for GET /expiration/preferences
T014: Write failing Vitest test for ExpiryLearning section render

# Then sequentially:
T015 → T016 → T017 → T018 → T019
```

---

## Implementation Strategy

### MVP First (User Stories 1 and 2 Only)

1. Complete Phase 1: Schema + migration
2. Complete Phase 2: Repository
3. Complete Phase 3: US1 (automatic adjustment)
4. Complete Phase 4: US2 (confidence upgrade)
5. **STOP and VALIDATE**: Run quickstart.md Scenarios 1–3; verify estimates are adjusted and confidence is correct
6. Ship the backend learning logic — no UI change needed for MVP

### Incremental Delivery

1. Phase 1 + 2 → Repository foundation ready
2. Phase 3 → US1 complete → validate Scenario 2 from quickstart.md
3. Phase 4 → US2 complete → validate Scenario 3 from quickstart.md
4. Phase 5 → US3 complete → users can see learned preferences
5. Phase 6 → US4 complete → users can reset preferences
6. Final → full validation pass

---

## Notes

- `[P]` tasks touch different files — safe to parallelize within the same developer's session
- Each user story phase delivers independently testable value; stop at any checkpoint to validate
- The TDD constraint (Constitution Principle I) is non-negotiable: every `spec.ts` test must be confirmed FAILING before the matching implementation task begins
- `overrideItemExpiration` delta recording uses a `try/catch` — the override response must succeed even when preference storage throws (verify with T006)
- The `deltas` raw array is never returned by the API — only `averageDelta` and `sampleCount` (enforced by DTO in T015)
- After T002 (migration), run `cd back && npx prisma generate` to regenerate the Prisma client before writing TypeScript code that references `UserCategoryExpiryPreference`

---

## Phase 7: Convergence

- [X] T029 Resolve spec conflict between US1/AC2 ("1–2 overrides → baseline only") and FR-004 ("at least one override → apply adjustment"); decide the intended threshold and update either `back/src/modules/expiration/expiration.service.ts` `applyLearning` to gate the date offset on `sampleCount >= 3`, or amend US1/AC2 in `specs/006-expiry-learning/spec.md` to align with FR-004 per US1/AC2 vs FR-004 (contradicts)
- [X] T030 Apply the pending Prisma migration against the running database (`cd back && npx prisma migrate dev --name add-user-category-expiry-preference`) to create the `UserCategoryExpiryPreference` table — blocks all preference endpoints and the enhanced `estimateForItem` at runtime per T002 (missing)

---

## Phase 8: Convergence

- [X] T031 Update FR-004 in `specs/006-expiry-learning/spec.md` and the Learning Application Rules pseudocode in `specs/006-expiry-learning/data-model.md` (lines ~81–83) to state the learned adjustment is applied only once the user has 3 or more recorded overrides for the category (`sampleCount >= 3`), matching the T029 fix in `back/src/modules/expiration/expiration.service.ts` `applyLearning` and acceptance scenario US1/AC2 per FR-004 (contradicts)
