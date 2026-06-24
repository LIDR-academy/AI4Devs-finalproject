# Test-Integrity Cleanup Implementation Plan

> Executed subagent-driven; controller triages any newly-enabled test that fails.

**Goal:** Make the suites tell the truth — un-skip tests that silently never run, and clear the lint/type debt that makes `next build` fail — then **triage anything that fails once it actually runs** (a silently-skipped test can hide a real bug).

**Background (found while building US4):**
- **Backend:** JUnit silently ignores `@Test fun x() = runBlocking { …non-Unit-last-line }` (Kotest `shouldBe`/`shouldThrow` return their receiver). Confirmed silently-skipped on main: `RegisterGuestUseCaseTest` (1), `CreateBookingUseCaseTest` (2), `ConfirmBookingUseCaseTest` (3). The codebase convention `{ runBlocking { … } }` (block body) runs fine; `= runTest { }` is also safe (TestResult = Unit). See `reference_kotlin_junit_runblocking_skip` memory.
- **Frontend:** `next build` (lint + type-check) fails on pre-existing test-file debt: `no-assign-module-variable` (`propertyService.test.ts`, `searchService.test.ts`), missing `beforeEach` import (`PriceBreakdown.test.tsx`), `no-explicit-any`, and a stale type assertion in `bookingService.test.ts` (`booking_id` not on `BookingDetailResponse`).

**Detection:** backend — compare each test class's source `@Test` count to `tests="N"` in `build/test-results/test/*.xml`; a gap = silent skips. Frontend — `npx next build --no-lint` for type errors, `npx eslint` for lint.

**Branch:** `fix-silently-skipped-tests`. One PR.

---

### Task 1: Backend — convert `= runBlocking` test bodies to block form

**Files:** every backend test with `@Test fun …() = runBlocking { … }` (sweep `backend/src/test` for `) = runBlocking {`).

- [ ] Baseline: `cd backend && ./gradlew test` — record the TOTAL test count.
- [ ] Convert each `@Test fun NAME(...) = runBlocking {  …  }` to block body:
  ```kotlin
  @Test
  fun NAME(...) {
      runBlocking {
          … (unchanged body) …
      }
  }
  ```
  Purely structural — do NOT change any assertion. (`= runTest { }` may be left as-is; it's already Unit-safe.)
- [ ] Re-run `./gradlew test`. The TOTAL count must INCREASE (the previously-skipped tests now run). Report before/after.
- [ ] **Triage:** for any test that now FAILS, do not weaken it — investigate. If it reveals a real product bug, report it (and, if small + clearly correct, fix the product code with the test as the red→green driver). If the test itself was wrong (asserted against a non-existent contract), fix the test to assert the real behavior. Report every failure + resolution.

### Task 2: Frontend — clear test-file lint/type debt

**Files:** `propertyService.test.ts`, `searchService.test.ts`, `PriceBreakdown.test.tsx`, `bookingService.test.ts` (and any others `next build` flags).

- [ ] `npx eslint <files>` + `npx next build --no-lint` to enumerate. Fix each: rename `module` locals (e.g. `mod`) for `no-assign-module-variable`; add the missing `beforeEach` import; replace `any` with a real type or `unknown`+narrowing; fix the stale `bookingService.test.ts` assertion to match the real `BookingDetailResponse`/`ConfirmBookingResponse` shape.
- [ ] `npm run test` (vitest) stays green; `npm run build` (full, lint on) now succeeds.

### Task 3: Verify + PR

- [ ] Backend `./gradlew clean test` green (higher count); frontend `npm run test` + `npm run build` green.
- [ ] Push, open PR. Summarize before/after counts and list any real bug a newly-enabled test exposed.

## Self-review
- Coverage: backend runBlocking skips ✓; frontend lint/type debt ✓; triage-don't-mask discipline ✓; verification by count delta + green build ✓.
