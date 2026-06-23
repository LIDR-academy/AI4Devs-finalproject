# Task: TK-032 · feature:settings — Native About / Terms / Privacy Screens

## Description

Replace the old `OpenUrl` side effects for About DiviDox, Terms & Conditions, and Privacy Policy with proper native Compose screens. The `SettingsViewModel` already emits `NavigateToAbout`, `NavigateToTerms`, `NavigateToPrivacy` — this task wires them to real screens.

**Three native screens:**
- **About DiviDox** — app name, version, tagline, informational disclaimer
- **Terms & Conditions** — scrollable legal text (app is purely informational, not financial advice)
- **Privacy Policy** — scrollable privacy text

**Depends on:** TK-031
**Status:** In Progress

### Phase 1: Architecture & Setup
- [x] **Create Git Branch** `feature/DVX-TK-032-native-about-terms-privacy`

### Phase 2: Strings
- [ ] **Add content strings** to `strings.xml` for all three screens
  - **Commit:** `DVX-TK-032 Add About/Terms/Privacy screen strings`

### Phase 3: Static screens
- [ ] **`AboutScreen.kt`** — top bar + app info (version passed as param)
- [ ] **`TermsScreen.kt`** — top bar + scrollable terms content
- [ ] **`PrivacyScreen.kt`** — top bar + scrollable privacy content
  - **Commit:** `DVX-TK-032 Add AboutScreen, TermsScreen, PrivacyScreen`

### Phase 4: Routes & navigation
- [ ] **Routes** `AboutRoute`, `TermsRoute`, `PrivacyRoute` in `MainNavigation.kt`
- [ ] **Nav nodes** `aboutScreenNode`, `termsScreenNode`, `privacyScreenNode`
- [ ] **Register** in `RootNavGraph.kt` (root level — full-screen, no bottom bar)
- [ ] **Wire side effects** in `settingsScreenNode` via `rootNavController`
  - **Commit:** `DVX-TK-032 Wire About/Terms/Privacy navigation`

### Phase 5: Quality & PR
- [ ] `./gradlew :feature:settings:jvmTest :feature:settings:detekt`
- [ ] Create Pull Request

## Progress Tracking

**Total Tasks:** 7 · **Completed:** 1 · **Remaining:** 6

## Notes

- The app is purely informational — it tracks your existing portfolio and shows dividend data. It does NOT give financial advice, recommend buy/sell actions, or influence investment decisions. This disclaimer must appear prominently in Terms & Conditions and About screen.
