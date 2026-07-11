# TDD log — localization-i18n

`tdd_craftsman` build log — one line per Red→Green→Refactor cycle, grouped by slice. Every `@s` in
`gherkin-scenarios.md` maps to ≥1 test below. (Full narrative lives in git history.)

## Design reconciliation (recorded for reviewers)
- **`device-locale.ts` is pure** (constraint #2): the lib never imports `expo-localization`; the **app** reads `getLocales()[0].languageTag` (SDK 57) and passes the raw tag into `<LocalizationProvider deviceLocale>`. Keeps the lib platform-agnostic (AC13).
- **First-paint gate in the provider**: renders `null` until async init (saved-pref → device → English) resolves — no flash of untranslated copy (spec Open decision + R2). `_layout.tsx` mounts it above the router, mirroring `useSession`.

## @s → test map
| @s | Scenario | Test(s) |
|---|---|---|
| @s1 | Provider exposes translations to descendants | `provider/localization-provider.test.tsx` |
| @s2 | Each locale resolves keys from its own bundle | `config/i18n.test.ts` |
| @s3 | First launch auto-detects supported device locale | `detector/resolve-initial-locale.test.ts`, `provider/localization-provider.test.tsx` |
| @s4 | Unsupported device locale falls back to English | `detector/resolve-initial-locale.test.ts` |
| @s5 | Settings lists 4 endonyms, active indicated | `language-selector.test.tsx`, `language-settings.test.tsx` |
| @s6 | Selecting a language updates UI immediately | `language-settings.test.tsx`, `provider/localization-provider.test.tsx` |
| @s7 | Selected language persists across restart | `locale-preference.dao.test.ts`, `locale-preference.service.test.ts`, provider integration |
| @s8 | Saved preference beats device locale | `provider/localization-provider.test.tsx` |
| @s9 | Missing key falls back to English | `config/i18n.test.ts` (fallback) |
| @s10 | Interpolated values injected | `config/i18n.test.ts` (interpolation) |
| @s11 | Pluralization by count | `config/i18n.test.ts` (plural) |
| @s12 | Failed preference read degrades gracefully | `locale-preference.service.test.ts`, provider integration |
| @s13 | Language selector is accessible | `language-selector.test.tsx` |
| @s14 | No hardcoded user-facing strings remain | `migration-coverage.test.ts` |
| @s15 | Identical across platforms (shared config) | provider (jsdom) + selector (jest-expo/RN) + Storybook e2e (web) |

---

## Slice 1 — Happy path: lib + provider + auto-detect (+ Loading gate)
- **task-1 (@s2)** — RED `config/i18n.test.ts` (key resolves per locale, all 4 registered, `fallbackLng==['en']`) → GREEN `libs/types/src/locale.ts` (`Locale`/`SUPPORTED_LOCALES`/`FALLBACK_LOCALE`/`isSupportedLocale`), 4 typed bundles, `config/i18n.ts` `createI18n()`, `supported-locales.ts` endonyms. 6 green.
- **task-2 (@s1)** — RED provider test (descendant reads `t`+`locale`, default en, `setLocale` switches, hook throws outside provider) → GREEN `localization-provider.tsx` + `hooks/use-localization.ts`. 11 green.
- **task-3 (@s3,@s4)** — RED `device-locale.test.ts` (`toBaseSubtag`), `resolve-initial-locale.test.ts`, provider `deviceLocale` cases → GREEN pure `toBaseSubtag`/`resolveInitialLocale`, provider `deviceLocale` prop (explicit `initialLocale` wins). Added `expo-localization@~57`. 30 green.
- **task-4 (@s1,@s3,@s4,@s15)** — `localization.integration.test.tsx` full slice path; wired `_layout.tsx` to read `getLocales()` + mount provider. 32 green.
- **Slice-1 gate ✅** — check-types/lint/test green. Commit `feat(localization-i18n): implement happy path`.

## Slice 2 — Manual override + persistence + fallback/error
- **task-5 (@s7,@s12)** — RED `locale-preference.dao.test.ts` (AsyncStorage mocked; get/set/clear, null-absent, read-failure rejects) → GREEN `LocalePreferenceDao` + `LOCALE_PREFERENCE_STORAGE_KEY`. 5 green.
- **task-6 (@s7,@s12)** — RED `locale-preference.service.test.ts` (validate supported, null-absent/unsupported, null-on-failure never throws, set rejects unsupported) → GREEN `LocalePreferenceService`. 6 green.
- **task-7 (@s6,@s7,@s8,@s12)** — RED `localization-persistence.test.tsx` (saved-pref on relaunch, beats device, device fallback, immediate+persist, failed-save logs never throws) → GREEN provider resolves precedence in effect, gates first paint (`return null` until `ready`), `setLocale` persists with caught+logged `TODO(FO1)`. 37 green; dep graph `localization→services→types`.
- **task-8 (@s5)** — RED `language-selector.test.tsx` (4 labels, active `selected`, single check indicator, `onChange` on press, none when disabled, group a11y label) → GREEN presentational token-driven molecule. 6 green.
- **task-9 (@s5,@s6,@s9)** — @s9 fallback added to `config/i18n.test.ts`; RED `language-settings.test.tsx` (endonyms, active selected, press calls `setLocale`, heading key) → GREEN scaffolded study-buddy jest-expo, `LanguageSettings` builds options from `LOCALE_LABELS`, Settings screen thin shell. 3 green.
- **Slice-2 gate ✅** — check-types + lint + test green (localization 38, services 13, components 10, study-buddy 3, hooks 4, storybook 2). Commit `feat(localization-i18n): add error handling and empty state`.

## Slice 3 — Full string migration + a11y + stories
- **task-10 (@s9,@s10,@s11,@s14)** — RED interpolation `lesson.title`→"Lesson 7" + plural `lessons.count` → GREEN expanded all 4 bundles with full app key set (key-aligned), migrated every screen + nav-title sets to `t(...)`; @s14 `migration-coverage.test.ts` fs audit asserts no hardcoded copy. 16 green.
- **task-11 (@s14)** — same audit scan over `libs/components/src`: every component prop-driven, no hardcoded copy → no migration needed; test enforces going forward.
- **task-12 (@s5,@s13,@s15)** — @s13 a11y assertions (radio role+label, one `selected`, disabled propagation); `language-selector.stories.tsx` (4 locales + Interactive + Disabled); @s15 web e2e `language-selector.e2e.js` (Playwright, storybook-e2e-tests skill). 8 unit + 5 e2e green.
- **Slice-3 gate ✅** — check-types + lint + test green (localization 45, components 12, …); e2e 5/5. Commit `feat(localization-i18n): add analytics, a11y, and i18n` (no analytics in feature).

**All 15 scenarios covered ✅.**

---

## Phase 4 — kill surviving mutants (see `mutation.md`)
Each = red test against the reported mutant, green on correct code, verified killed by re-running Stryker. Assertions only, no behavior change.
- **Group A (behavioral)** — #1 dao storage-key literal pinned; #2 hook forwards `t` options; #3–5 first-paint gate; #6 initial i18n uses `initialLocale`; #7 selector group a11y-label key; #8 failed-save warns with message.
- **Group B (StyleSheet via `toHaveStyle`)** — #9–16 selector styles; #17–19 language-settings spacing + heading typography.
- **Group C** — killed: `escapeValue` (#26/#27), `returnNull` (#29), useEffect deps (#20). Excluded equivalent: #21/#22 (stable-dep memo), #23/#24/#25 (unmount guard, React 18/19 no-op), #28 (`initImmediate`, inline resources sync).
- **Tooling fixes** — study-buddy `stryker.config.mjs` JSDoc `*/` + `inPlace:true`; explicit `plugins` in all 4 configs; `.gitignore` Stryker artifacts.
- **Re-work gate ✅** — services/components/study-buddy 100%; localization 100% non-equivalent, 6 documented equivalents.

## Phase 5 — post-approval polish (review.md minors)
Verdict was APPROVED; 6 actionable minors resolved. Finding 7 (selector single-select visual + `borderWidth 2/1`) not touched — human-gate-approved, not a violation.
- **F6 (a11y)** — RED heading `getByRole('header')` → GREEN `accessibilityRole="header"`.
- **F1 (a11y)** — tests only: `radiogroup` role asserted on the labelled node, check indicator tied to active option via `within`. *Correction (round-2): guards only the literal `accessibilityRole` prop value — does NOT prove native AT perceives the grouping (a real `getByRole('radiogroup')` throws here). WCAG group-semantics gap is real and open — see Phase 6 / spec FO2.*
- **F3 (code/security)** — RED unsupported `i18n.language`→`en` (hook) + out-of-set `onChange` not forwarded (settings) → GREEN guarded both boundaries with `isSupportedLocale`.
- **F4 (code)** — removed dead `LocalePreferenceDao.clearStoredLocale` + test/mocks; grep confirms no refs.
- **F5 (architecture)** — `index.ts` no longer `export *` the provider module (leaked `LocalizationContext`); named `LocalizationProvider` + type only.
- **F2 (performance)** — `use-localization.ts` memoized (DONE, 100%); `language-settings.tsx` `useMemo`/`useCallback` DECLINED (in-place re-render not test-observable under jest-expo+RNTL14+React19 → mutants survive for zero benefit); provider cold-start `changeLanguage` NOT TOUCHED (ready-gate load-bearing).

### @s → test map (Phase 5 additions)
| @s | Added/changed test |
|---|---|
| @s5/@s13 | `language-selector.test.tsx`: `exposes a radiogroup role for the container`, `places the check indicator inside the active option only` |
| @s6 (a11y) | `language-settings.test.tsx`: `exposes the language heading as a header` |
| @s6 (boundary) | `language-settings.test.tsx`: `does not forward a selection that is not a supported locale` |
| supplementary hardening (not a single @s) | `use-localization.test.tsx`: `falls back to the fallback locale when i18n reports an unsupported language` — defense-in-depth on the hook's `locale` exposure, NOT @s3/@s4. |

- **Phase 5 gate ✅** — check-types + lint + test green (localization 52, components 17, study-buddy 7, services 13, hooks 4, storybook 2); e2e 19/19; per-lib Stryker on changed files 100%.

## Phase 6 — round-2 change request (a11y major, `review.md`)
Request: can the container `radiogroup` role/label reach native AT without regressing the individually-accessible `radio` children? No `@s` demands new behavior; per Law 1 no production code written.
- **Investigation** — read installed RN `ViewAccessibility.js` + `RCTViewComponentView.mm:398` (`isAccessibilityElement` gated 1:1 on `accessible`): no public `View` prop exposes a group role/label to native AT without the `accessible={true}` opaque-leaf trap or native-module work. Throwaway probe proved RNTL's `isSubtreeInaccessible` never inspects an ancestor's `accessible` → a passing RNTL test could NOT verify a fix safe on-device (false-green trap).
- **Decision** — no verified-safe fix; production code unchanged; sibling `radio-group.tsx` not touched (out of scope). Doc corrections only: test comment, Phase-5 F1 correction (above), spec FO2 + AC14 footnote.
- **Phase 6 gate ✅** — doc/comment only; 95/95 tests, check-types/lint green, e2e 19/19. Human gate 2026-07-10: FO2 risk accepted → APPROVED.
