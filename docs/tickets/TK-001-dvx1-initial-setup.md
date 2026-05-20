# Task: TK-001 · DVX-1 — Initial Project Setup

## Description

Bootstrap the Dividox KMP project: Gradle convention plugins, Koin DI, MVI pattern, navigation-compose typed routes, `:common:ui-resources` module, design system, ADRs for auth & storage, and foundational CI (PR action + BuildNumber). Done as a series of direct commits to `main` before the PR workflow was established.

**ADRs:** ADR-001, ADR-002, ADR-003, ADR-005, ADR-008
**Depends on:** —
**Blocks:** —
**Status:** Done

---

## Subtasks

### Phase 1: Project Bootstrap
- [x] Initial project structure and Gradle wrapper
- [x] Convention plugins (`dividox.kmp.application`, `dividox.kmp.library`, `dividox.compose.multiplatform`, `dividox.kmp.ios`, `dividox.kmp.test`, `dividox.detekt`)
  - **Commit:** `DVX-1 Convention Plugins`

### Phase 2: Architecture Patterns
- [x] MVI pattern scaffolded in `App.kt` (Contract: State / Event / Effect)
  - **Commit:** `DVX-1 Add MVI pattern and add agents`
- [x] MVI pattern applied on App composable
  - **Commit:** `DVX-1 Implement MVI pattern on App`
- [x] navigation-compose typed routes in `:common:ui-resources`
  - **Commit:** `DVX-1 Implement Navigation Pattern` · `DVX-1 Move routes`
- [x] `:common:ui-resources` module scaffolded
  - **Commit:** `DVX-1 Add ui-resources module`

### Phase 3: DI & Tooling
- [x] Koin integrated as DI framework
  - **Commit:** `DVX-1 Integrate Koin as DI`
- [x] Skills added (doc, stitch, OWASP, DI pattern)
  - **Commit:** `DVX-1 Add Skills` · `DVX-1 Add DOC skills` · `DVX-1 Add Stitch skills` · `DVX-1 Add OWASP skill and hook for precommit`

### Phase 4: Design & Documentation
- [x] Material3 design system tokens applied
  - **Commit:** `DVX-1 Add Design System`
- [x] ADRs: Auth module split (ADR-002), Token storage strategy (ADR-003), Token storage contract (ADR-008)
  - **Commit:** `DVX-1 Add ADRs file of Auth & Storage` · `DVX-1 Add Token storage ADR`
- [x] Pull Request action + BuildNumber CI step
  - **Commit:** `DVX-1 Add Pull Request action and BuildNumber`

---

## Progress Tracking
**Total Tasks:** 11 **Completed:** 11 **Remaining:** 0
