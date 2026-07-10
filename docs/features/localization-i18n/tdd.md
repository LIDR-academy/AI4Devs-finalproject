# TDD log — localization-i18n

`tdd_craftsman` build log. One block per Red→Green→Refactor cycle, grouped by slice.
Every `@s` scenario in `gherkin-scenarios.md` maps to at least one concrete test below.

## Design reconciliation (recorded for reviewers)
- **`device-locale.ts` is pure** (critical design constraint #2, which overrides task-3's literal
  "reads expo-localization"): the lib never imports `expo-localization`. The **app** reads
  `getLocales()[0].languageTag` (Expo SDK 57 shape, verified against
  https://docs.expo.dev/versions/v57.0.0/) and passes the raw tag into
  `<LocalizationProvider deviceLocale={...}>`. Keeps `@helsoft/localization` platform-agnostic (AC13).
- **First-paint gate lives in the provider**: it renders `null` until the async init
  (saved-preference read → device detection → English) resolves, so no flash of untranslated copy
  (spec Open decision + R2). The app's `_layout.tsx` mounts it above the router, mirroring `useSession`.

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

### task-1 — Scaffold @helsoft/localization + i18next config + bundles (@s2)
- **RED** — `config/i18n.test.ts`: a key resolves to its own translation for each of `en`/`es`/`pt`/`de`;
  all four registered; `fallbackLng === ['en']`. Failed to compile (no `Locale`, no `createI18n`).
- **GREEN** — added `libs/types/src/locale.ts` (`Locale`, `SUPPORTED_LOCALES`, `FALLBACK_LOCALE`,
  `isSupportedLocale`); four resource bundles typed by a derived `TranslationResource` (compiler
  key-alignment, R6); `resources/index.ts`; `config/i18n.ts` `createI18n()` (fallbackLng en,
  initImmediate:false, isolated instance); `config/supported-locales.ts` `LOCALE_LABELS` endonyms.
- **REFACTOR** — none needed; functions already single-purpose.
- 6 tests green; `check-types` clean for `@helsoft/localization` + `@helsoft/types`.

### task-2 — LocalizationProvider + useLocalization hook (@s1)
- **RED** — `provider/localization-provider.test.tsx`: a descendant `Consumer` renders `t('settings.title')`
  and `locale` for the active locale; default is English; `supportedLocales` exposed; `setLocale` switches;
  hook throws outside the provider. Failed to compile (no provider/hook).
- **GREEN** — `provider/localization-provider.tsx` (isolated i18next per instance, `setLocale` via context)
  + `hooks/use-localization.ts` (wraps `useTranslation`; returns `{ t, locale, setLocale, supportedLocales }`).
  Added `"lib": ["ESNext","DOM"]` to the lib tsconfig for the jsdom test types (runtime stays DOM-free).
- **REFACTOR** — none.
- 11 tests green; `check-types` clean. (`ready`/first-paint gate is deferred to task-4/task-7 where its
  test lives — not built ahead here.)

### task-3 — Device-locale detection + resolve-initial-locale (@s3, @s4)
- **RED** — `detector/device-locale.test.ts` (`toBaseSubtag`: `pt-BR`→`pt`, `EN`→`en`, …);
  `detector/resolve-initial-locale.test.ts` (supported region tags → base locale; unsupported/absent → `en`);
  extended provider test with `deviceLocale="pt-BR"`→Portuguese and `deviceLocale="fr-FR"`→English. Compile-failed.
- **GREEN** — pure `toBaseSubtag`; pure `resolveInitialLocale` (uses `isSupportedLocale` from `@helsoft/types`);
  provider gained a `deviceLocale` prop (explicit `initialLocale` wins, else resolve from device tag).
  Added `expo-localization@~57.0.0` to `apps/app-study-buddy` + `@helsoft/localization` app workspace dep.
  The lib itself does NOT import `expo-localization` (constraint #2); the app reads `getLocales()` in task-4.
- **REFACTOR** — none.
- 30 tests green; `check-types` clean.

### task-4 — Mount provider at app root + slice-1 integration (@s1, @s3, @s4, @s15)
- **RED/GREEN** — `provider/localization.integration.test.tsx`: full slice path
  (detection → config → provider → hook) with an app-screen-like + shared-component-like descendant
  both rendering the detected locale (`pt-BR`→Portuguese), and a switch propagating to both at once.
- **Wiring** — `apps/app-study-buddy/src/app/_layout.tsx` now reads `getLocales()[0].languageTag`
  (the only native-locale read; app stays a thin shell) and mounts `<LocalizationProvider deviceLocale>`
  above the router. Session gate unchanged; the i18n first-paint gate becomes load-bearing in task-7
  (async saved-preference read) — in slice 1 resolution is synchronous so there is nothing to flash.
- **@s15** — the shared, platform-agnostic config is exercised under jsdom here; the RN/native leg runs
  under `jest-expo` via the components lib (slice 2+) and the web leg via the Storybook e2e (slice 3).
  (The app has no jest runner, matching the pre-existing untested `_layout.tsx`.)
- 32 tests green.

### Slice-1 gate ✅
`pnpm check-types` (8 pkgs), `pnpm lint`, `pnpm test` (32 localization tests) all green.
No hardcoded colors/dims; user-facing copy is sourced from bundles (endonyms static by design).
Commit: `feat(localization-i18n): implement happy path`.

---

## Slice 2 — Manual override + persistence + fallback/error

### task-5 — LocalePreferenceDao (@s7, @s12)
- **RED** — `dao/locale-preference.dao.test.ts` (AsyncStorage mocked): get returns the stored value under
  the well-known key; get→null when absent; set/clear call through; a read failure surfaces as a rejection.
- **GREEN** — `LocalePreferenceDao` (abstract, static get/set/clear) over `@react-native-async-storage/async-storage`
  (added to `@helsoft/services`) with `LOCALE_PREFERENCE_STORAGE_KEY`. Raw access only; no validation.
- 5 DAO tests green.

### task-6 — LocalePreferenceService (@s7, @s12)
- **RED** — `services/locale-preference.service.test.ts` (DAO mocked): supported value read back; null when
  absent; null when stored value unsupported; **null on a DAO read failure (never throws)**; set validates +
  persists a supported locale; set rejects an unsupported value without persisting.
- **GREEN** — `LocalePreferenceService` validates against `SUPPORTED_LOCALES`; `getStoredLocale` try/catch→null;
  `setStoredLocale` rejects unsupported. Exported via `services/index.ts` + `src/index.ts`.
- 6 service tests green.

### task-7 — Wire persistence + precedence into the provider (@s6, @s7, @s8, @s12)
- **RED** — `provider/localization-persistence.test.tsx` (`@helsoft/services` mocked): relaunch uses saved pref
  (@s7); saved pref beats device (@s8); no saved pref → device detection (@s12); `setLocale` switches immediately
  AND persists (@s6); a failed save applies in-memory + logs, never throws (Open decision / FO1). 4 failed initially.
- **GREEN** — provider now (a) resolves initial locale in an effect with precedence
  `initialLocale ?? savedPreference ?? resolveInitialLocale(device)`, (b) **gates first paint** (`return null`
  until `ready`), (c) `setLocale` calls `i18n.changeLanguage` + `LocalePreferenceService.setStoredLocale(...)`
  with a caught+logged rejection carrying a **`TODO(FO1)`** comment → spec Follow-on FO1. Added `@helsoft/services`
  dep. Slice-1 provider + integration tests updated to mock the service and await readiness (`findBy*`).
- **REFACTOR** — none.
- 37 tests green; `check-types` clean. Dep graph stays acyclic: `localization → services → types`.

### task-8 — LanguageSelector molecule (@s5)
- **RED** — `language-selector.test.tsx` (jest-expo + RN Testing Library): renders all four labels; marks the
  active option `selected`; a single check indicator on the active option (non-color, @s5/@s13); `onChange`
  fires the value on press; no `onChange` when disabled; group accessibility label applied. Module-not-found.
- **GREEN** — `language-selector.tsx`: presentational controlled molecule (`options/value/onChange/disabled/
  accessibilityLabel`), token-driven (spacing/shape/colors/typography, `touchTarget` min height), active state
  = check `Icon` + heavier `titleMedium` label + `accessibilityState.selected`. Exported via molecules barrel.
- **REFACTOR** — none.
- 6 tests green (10 total in components); `check-types` clean. Stories + full a11y contract + e2e land in task-12.

### task-9 — LanguageSettings feature component + Settings screen (@s5, @s6, @s9)
- **@s9 (fallback)** — added to `config/i18n.test.ts`: with `de` active, a key present only in `en`
  resolves to the English string (never a raw key) — the AC10/@s9 safety net.
- **RED** — `language-settings.test.tsx` (jest-expo; `@helsoft/localization` mocked): lists the four endonyms
  with the active one `selected` (@s5); pressing an option calls `setLocale('es')` (@s6); the heading renders
  from `t('settings.language.heading')`. Module-not-found.
- **GREEN** — scaffolded `@helsoft/study-buddy` testing (jest-expo config reusing the components unistyles theme
  registration; an inline AsyncStorage mock for the transitive services import; deps + tsconfig). `LanguageSettings`
  reads `{ t, locale, setLocale, supportedLocales }`, builds options from `LOCALE_LABELS` (endonyms), passes them
  to `LanguageSelector`. Added `settings.language.{heading,a11yLabel}` keys to all four bundles (key-aligned).
  Settings screen (`apps/*`) now renders only `<LanguageSettings />` — a thin shell.
- **REFACTOR** — none.
- 3 study-buddy tests green.

### Slice-2 gate ✅
`pnpm check-types` (8 pkgs) + `pnpm --filter app-study-buddy lint` clean; `pnpm test` green across all workspaces
(localization 38, services 13, components 10, study-buddy 3, hooks 4, lib-with-storybook 2). No hardcoded
colors/dims; selector labels are caller-supplied endonyms. `@helsoft/components test:e2e` for the selector is
part of task-12 (slice 3). Commit: `feat(localization-i18n): add error handling and empty state`.
</content>
</invoke>
