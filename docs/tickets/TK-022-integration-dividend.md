# Task: TK-022 · integration:dividend — Scaffold + Enriched Models + Use Cases

## Description

Scaffold `:integration:dividend`, define enriched dividend models (`DividendActivitySummary`, `EnrichedPayment`, `MonthBar`), implement the integration use cases that combine dividend + portfolio + market data, and register the Koin module.

**ADRs:** ADR-006
**Depends on:** TK-021
**Blocks:** TK-023
**Status:** Backlog

---

## Subtasks

### Phase 1: Architecture & Setup
- [ ] **Create Git Branch** `feature/DVX-TK-022-integration-dividend` — `skill: manage-git-flow`

### Phase 2: Scaffold
- [ ] **Scaffold `:integration:dividend`**
  - `integration/dividend/build.gradle.kts` — `dividox.kmp.library` + `dividox.kmp.test`
  - `include(":integration:dividend")` in `settings.gradle.kts`
  - **Verify:** `./gradlew :integration:dividend:compileKotlinJvm`
  - **Commit:** `DVX-TK-022 Scaffold integration:dividend module`

### Phase 3: Enriched Models + Use Cases (TDD)
- [ ] **Models:**
  - `DividendActivitySummary(lifetime, ytd, yoyPercent, nextPayout, yoc, yocTarget)`
  - `EnrichedPayment` — `DividendPayment` + `CompanyInfo`
  - `MonthBar(month: YearMonth, amount: Double, isProjected: Boolean)`

- [ ] **Use cases + tests:**
  - `GetDividendActivitySummaryUseCase`
  - `GetEnrichedUpcomingPaymentsUseCase`
  - `GetEnrichedPaymentHistoryUseCase` — grouped by month
  - `GetDividendProjectionBarsUseCase` — past (Room data) + future (upcoming payments)
  - **Verify:** `./gradlew :integration:dividend:jvmTest`
  - **Commit:** `DVX-TK-022 Add integration:dividend models and use cases with tests`

- [ ] **`DividendIntegrationModule.kt`** + add to `App.kt` startKoin
  - **Commit:** `DVX-TK-022 Register dividend integration Koin module`

### Phase 4: Testing & Quality
- [ ] `./gradlew test` + `./gradlew detekt`
- [ ] Create Pull Request — `skill: manage-git-flow`

---

## Progress Tracking
**Total Tasks:** 6 **Completed:** 0 **Remaining:** 6

---

## Notes
- YoC = Yield on Cost = annual dividends received / total cost basis
- YoC indicator: green >= 5.0%, red < 5.0%
