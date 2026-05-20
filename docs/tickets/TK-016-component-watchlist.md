# Task: TK-016 · component:watchlist — Scaffold + Domain + Data

## Description

Scaffold `:component:watchlist`, define the watchlist domain and use cases with TDD, then build the Firestore data layer and register the Koin module.

**User Stories:** DVX-US-009 · DVX-US-023 · DVX-US-024 · DVX-US-025
**ADRs:** ADR-005
**Depends on:** TK-013
**Blocks:** TK-017
**Status:** Done

---

## Subtasks

### Phase 1: Architecture & Setup
- [x] **Create Git Branch** `feature/DVX-TK-016-component-watchlist`

### Phase 2: Scaffold
- [x] **Scaffold `:component:watchlist`**
  - `component/watchlist/build.gradle.kts` — `dividox.kmp.library` + `dividox.kmp.test`
  - `include(":component:watchlist")` in `settings.gradle.kts`

### Phase 3: Domain Layer (TDD)
- [x] **`WatchlistEntry(tickerId: String, addedAt: Instant)`**
- [x] **`WatchlistRepository`:** `getWatchlist(): Flow<List<WatchlistEntry>>`, `addToWatchlist`, `removeFromWatchlist`, `isInWatchlist(ticker): Flow<Boolean>`
- [x] **Use cases + tests:** `GetWatchlistUseCase`, `AddToWatchlistUseCase`, `RemoveFromWatchlistUseCase`, `IsInWatchlistUseCase`
  - 10 unit tests — all passing

### Phase 4: Data Layer
- [x] **`WatchlistFirestoreDataSource`** — collection `users/{uid}/watchlist`
- [x] **`WatchlistRepositoryImpl`** (TDD, mock data source)
- [x] **`WatchlistModule.kt`** + added to `KoinInitializer.kt`

### Phase 5: Testing & Quality
- [x] `./gradlew :component:watchlist:jvmTest` — 10 tests, 0 failures
- [x] `./gradlew detekt` — clean
- [x] PR opened — `feature/DVX-TK-016-component-watchlist`

---

## Progress Tracking
**Total Tasks:** 6 **Completed:** 6 **Remaining:** 0

---

## Notes
- `WatchlistRepository` is the single source of truth for favourite state across all screens — never duplicate this state in a ViewModel
- `WatchlistEntry.addedAt` uses `kotlin.time.Instant` (stdlib, Kotlin 2.x)
