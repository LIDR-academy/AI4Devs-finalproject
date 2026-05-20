# Task: TK-014 · component:portfolio — Scaffold + Domain + Data

## Description

Scaffold `:component:portfolio`, define the `Holding` domain model and `PortfolioRepository` interface, implement all use cases with TDD, then build the Firestore data layer and register the Koin module.

**User Stories:** DVX-US-011 · DVX-US-014 · DVX-US-015
**ADRs:** ADR-005
**Depends on:** TK-013
**Blocks:** TK-017
**Status:** Done

---

## Subtasks

### Phase 1: Architecture & Setup
- [x] **Create Git Branch** `feature/DVX-TK-014-component-portfolio` — `skill: manage-git-flow`

### Phase 2: Scaffold
- [x] **Scaffold `:component:portfolio`**
  - `component/portfolio/build.gradle.kts` — `dividox.kmp.library` + `dividox.kmp.test`
  - `include(":component:portfolio")` in `settings.gradle.kts`
  - **Verify:** `./gradlew :component:portfolio:compileKotlinJvm`
  - **Commit:** `DVX-TK-014 Scaffold component:portfolio module`

### Phase 3: Domain Layer (TDD)
- [x] **Domain models:** `HoldingId` (value class), `Holding(id, tickerId, shares: Double, purchasePrice, purchaseCurrency, purchaseDate: LocalDate)`
- [x] **`PortfolioRepository` interface:** `getPortfolio(): Flow<List<Holding>>`, `addHolding`, `updateHolding`, `removeHolding(id)`
- [x] **Use cases + tests:** `GetPortfolioUseCase`, `AddHoldingUseCase`, `UpdateHoldingUseCase`, `RemoveHoldingUseCase`
  - **Verify:** `./gradlew :component:portfolio:jvmTest`
  - **Commit:** `DVX-TK-014 Add portfolio domain layer with tests`

### Phase 4: Data Layer
- [x] **`PortfolioFirestoreDataSource`** — collection `users/{uid}/holdings`, maps Firestore ↔ `Holding`
- [x] **`PortfolioRepositoryImpl`** (TDD, mock data source)
  - **Verify:** `./gradlew :component:portfolio:jvmTest`
- [x] **`PortfolioModule.kt`** + add to `App.kt` startKoin
  - **Commit:** `DVX-TK-014 Implement portfolio data layer and Koin module`

### Phase 5: Testing & Quality
- [x] `./gradlew test` + `./gradlew detekt`
- [x] Create Pull Request — PR #43 merged

---

## Progress Tracking
**Total Tasks:** 6 **Completed:** 6 **Remaining:** 0

---

## Notes
- Fractional shares: `Double`, not `Int`
- `purchaseCurrency` is whatever string the feature layer passes — no validation at component level
