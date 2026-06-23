# Task: TK-021 · component:dividend — Scaffold + Room + Domain + Data

## Description

Scaffold `:component:dividend`, add Room KMP dependencies, define the Room entity/DAO and `DividendDatabase` expect/actual, define the dividend domain layer with TDD, and implement the data layer (Local + Remote datasources, DividendRepositoryImpl, Koin module).

**User Stories:** DVX-US-016 · DVX-US-017 · DVX-US-018 · DVX-US-019
**ADRs:** ADR-005, ADR-012
**Depends on:** TK-020
**Blocks:** TK-022
**Status:** Backlog

---

## Subtasks

### Phase 1: Architecture & Setup
- [ ] **Create Git Branch** `feature/DVX-TK-021-component-dividend` — `skill: manage-git-flow`

### Phase 2: Scaffold + Room Setup
- [ ] **Scaffold `:component:dividend`**
  - `component/dividend/build.gradle.kts` — `dividox.kmp.library` + `dividox.kmp.test`
  - `include(":component:dividend")` in `settings.gradle.kts`
  - **Commit:** `DVX-TK-021 Scaffold component:dividend module`

- [ ] **Add Room KMP dependencies** to `:component:dividend`
  - `androidx.room:room-runtime` (KMP 2.7+), `androidx.room:room-compiler` (KSP)
  - Add `room = "2.7.0"` to `libs.versions.toml`
  - **Commit:** `DVX-TK-021 Add Room KMP dependencies`

- [ ] **Define `DividendPaymentEntity`** — `id`, `tickerId`, `amount: Double`, `currency`, `paymentDate` (ISO-8601 String), `method` (CASH|REINVESTED)
- [ ] **Define `DividendDao`** — `observeAll(): Flow<List<...>>`, `sumByYear(year: String): Double`, `upsert()`, `clearAll()`
- [ ] **Create `DividendDatabase` expect/actual**
  - `commonMain`: abstract `RoomDatabase`
  - `androidMain` / `iosMain` / `jvmMain`: `Room.databaseBuilder(...)` actuals
  - **Verify:** `./gradlew :component:dividend:compileKotlinJvm`
  - **Commit:** `DVX-TK-021 Add DividendDatabase entity, DAO, and expect/actual`

### Phase 3: Domain Layer (TDD)
- [ ] **Models:** `DividendPaymentId` (value class), `PaymentMethod` enum (`CASH | REINVESTED`), `DividendPayment(id, tickerId, amount, currency, paymentDate: LocalDate, method)`
- [ ] **`DividendRepository`:** `getDividendHistory(): Flow<List<...>>`, `getLifetimeDividends(): Flow<Double>`, `getYtdDividends(): Flow<Double>`, `getUpcomingPayments(): Flow<List<...>>`, `addDividendPayment`
- [ ] **Use cases + tests:** `GetDividendHistoryUseCase`, `GetLifetimeDividendsUseCase`, `GetYtdDividendsUseCase`, `GetUpcomingPaymentsUseCase`, `AddDividendPaymentUseCase`
  - **Verify:** `./gradlew :component:dividend:jvmTest`
  - **Commit:** `DVX-TK-021 Add dividend domain layer with tests`

### Phase 4: Data Layer
- [ ] **`DividendLocalDataSource`** (Room DAO wrapper, maps entity ↔ domain model)
- [ ] **`DividendRemoteDataSource`** (Firestore — collection `users/{uid}/dividends`)
- [ ] **`DividendRepositoryImpl`** — Firestore source of truth, Room as read cache (TDD, mock data sources)
  - **Verify:** `./gradlew :component:dividend:jvmTest`
- [ ] **`DividendModule.kt`** + add to `App.kt` startKoin
  - **Commit:** `DVX-TK-021 Implement dividend data layer and Koin module`

### Phase 5: Testing & Quality
- [ ] `./gradlew test` + `./gradlew detekt`
- [ ] Create Pull Request — `skill: manage-git-flow`

---

## Progress Tracking
**Total Tasks:** 9 **Completed:** 0 **Remaining:** 9

---

## Notes
- `paymentDate` stored as ISO-8601 so `strftime('%Y', payment_date)` works in `sumByYear()`
- REINVESTED payments must NOT count toward cash totals in summary metrics
- Use `getDatabaseBuilder()` expect/actual pattern from Room KMP docs
