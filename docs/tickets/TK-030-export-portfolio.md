# Task: TK-030 · feature:settings — Export Portfolio

## Description

Implement CSV portfolio export from Settings. When the user taps "Export Portfolio", generate a CSV of all holdings and launch the OS native share sheet so they can save or send the file.

**User Stories:** DVX-US-030
**PRD:** PRD-08
**Stitch Design:** https://stitch.withgoogle.com/projects/10568397103146599411
**Depends on:** TK-029
**Blocks:** —
**Status:** Done

---

## Subtasks

### Phase 1: Architecture & Setup
- [x] **Create Git Branch** `feature/DVX-TK-030-export-portfolio`

### Phase 2: Domain — `ExportPortfolioUseCase`
- [x] **Add `ExportPortfolioUseCase`** in `component/portfolio/domain/usecase/`
  - Pure function: `List<Holding>` → CSV `String` (header + rows, ISO-8601 dates)
  - Unit tests: empty list, single holding, multiple holdings, date format
  - **Commit:** `DVX-TK-030 Add ExportPortfolioUseCase`

### Phase 3: Platform share — `FileShareService`
- [x] **`FileShareService` expect/actual** in `common/settings/data/share/`
  - `share(fileName: String, csvContent: String)` — write to temp dir, launch OS share sheet
  - Android: `FileProvider` + `Intent.ACTION_SEND`
  - iOS: `UIActivityViewController`
  - JVM: write to `java.io.tmpdir`, open via `Desktop.getDesktop().open()`
  - Register `FileShareService` in Koin `SettingsModule`
  - **Commit:** `DVX-TK-030 Add FileShareService expect/actual`

### Phase 4: SettingsViewModel
- [x] **Update `SettingsContract`** — rename `LaunchShareSheet(fileUri)` → `LaunchShareSheet(csvContent)`, add `isExporting` to state
- [x] **Implement `doExportPortfolio()`** — set `isExporting = true`, call `GetPortfolioUseCase`, call `ExportPortfolioUseCase`, emit `LaunchShareSheet(csv)` or `ShowError`
- [x] **Update DI** — inject `GetPortfolioUseCase` + `ExportPortfolioUseCase` into `SettingsViewModel`, register `ExportPortfolioUseCase` in Koin
- [x] **Unit tests**: empty portfolio, holdings present, repo failure
  - **Commit:** `DVX-TK-030 Implement export in SettingsViewModel with tests`

### Phase 5: Navigation wiring
- [x] **Handle `LaunchShareSheet` in `settingsScreenNode`** — call `fileShareService.share()` on `Dispatchers.Default`
  - Also fix `OpenUrl` side effect (was falling through `else` branch)
  - **Commit:** `DVX-TK-030 Wire LaunchShareSheet and OpenUrl in navigation`

### Phase 6: Testing & Quality
- [x] `./gradlew :component:portfolio:jvmTest :feature:settings:jvmTest`
- [x] Create Pull Request #59

---

## Progress Tracking
**Total Tasks:** 9 **Completed:** 9 **Remaining:** 0

---

## Notes
- ViewModel is FS-free: CSV content passed via side effect; `FileShareService` handles IO in the navigation layer
- `kotlinx-datetime` must be added to `component/portfolio/build.gradle.kts` (it's not pulled in transitively)
- Naming conflict: function `exportPortfolio()` vs property `exportPortfolio`; rename function to `doExportPortfolio()`
