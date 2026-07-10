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

---

## Slice 3 — Full string migration + a11y + stories

### task-10 — Migrate app screens + nav titles; interpolation + pluralization (@s9, @s10, @s11, @s14)
- **RED** — `config/i18n.test.ts` extended: interpolation `lesson.title` → "Lesson 7"/"Lección 7" (@s10);
  pluralization `lessons.count` → singular/plural for en+es (@s11). 5 failed.
- **GREEN** — expanded all four bundles with the full app key set (`nav`, `home`, `lessons` (plural),
  `upload`, `lesson` (interpolated title), `player`, `results`, `auth`, `settings`), key-aligned (compiler-enforced).
  Migrated every app screen + both `_layout` nav-title sets to `t(...)` via `useLocalization`; Settings stays a
  thin shell. Added `@helsoft/localization` app dep (slice 1) already in place.
- **@s14** — `coverage/migration-coverage.test.ts`: fs audit over `apps/app-study-buddy/src/app` +
  `libs/components/src` (stories/tests excluded) flags hardcoded `<Text>` children and literal `title:`;
  asserts none remain, plus a self-sanity check of the detector regexes.
- 14 config-level + 2 audit tests green; app `check-types` + `expo lint` clean.

### task-11 — Audit + confirm no hardcoded copy in @helsoft/components (@s14)
- Covered by the same `migration-coverage.test.ts` scan over `libs/components/src`. **Audit result:** every
  shared component is prop-driven — visible text is always a `{children}`/`{label}`/`{name}` expression (Icon
  renders the ligature name from its `name` prop; LanguageSelector renders caller-supplied endonyms). **No component
  carried hardcoded copy, so no migration was needed.** The test now enforces this going forward.

### task-12 — LanguageSelector a11y hardening + stories + web e2e (@s5, @s13, @s15)
- **@s13** — added assertions to `language-selector.test.tsx`: all four options expose a radio role + label,
  exactly one is announced `selected`, and options announce `disabled` when the group is disabled (locks the
  a11y contract built in task-8 for mutation testing). Non-color indicator (check icon) already covered.
- **Stories** — `language-selector.stories.tsx` (patterns from `lib-with-storybook`): English/Spanish/Portuguese/
  German (each locale active), Interactive (stateful switch), Disabled. Demo labels are endonyms (allowed in stories).
- **@s15 web / e2e** — `tests/e2e/molecules/language-selector/language-selector.e2e.js` (Playwright, via the
  storybook-e2e-tests skill; mirrors the `src/` path): story loads, all four endonyms render, the active option
  shows the check indicator, an interactive switch works on the web, disabled renders. `getByText('check',{exact})`
  avoids matching Storybook's boilerplate. **5/5 e2e pass** on chromium (`pnpm --filter @helsoft/components test:e2e`).
- @s15 is now proven on both environments: RN/native via jest-expo (components + study-buddy) and web via this e2e.
- 8 selector unit tests + 5 e2e green; `check-types` clean.

### Slice-3 gate ✅
`pnpm check-types` (8 pkgs) + `pnpm lint` clean; `pnpm test` green everywhere (localization 45, components 12,
services 13, study-buddy 3, hooks 4, lib-with-storybook 2); `pnpm --filter @helsoft/components test:e2e` = 5/5.
No hardcoded strings/colors/dims (audit-enforced). Commit: `feat(localization-i18n): add analytics, a11y, and i18n`
(no analytics in this feature — the commit covers a11y hardening + full string migration/i18n per the plan).

## All 15 scenarios covered ✅ — see the @s → test map above. Feature left for reviews_lead (not self-marked done).

---

## Phase 4 re-work — kill surviving mutants (mutation_tester report `mutation.md`)

Each item below is a red test written to fail against the reported mutant, then confirmed green on
correct code, then verified killed by re-running Stryker per lib on the changed files. No production
behavior was changed — only assertions were added/tightened.

### Group A — behavioral gaps (killed)
- **#1 `dao/locale-preference.dao.ts:4`** — added `persists under a stable, well-known storage key`
  to `locale-preference.dao.test.ts` pinning `LOCALE_PREFERENCE_STORAGE_KEY === 'study-buddy.locale-preference'`
  (was tautological). Also switched the read assertion to the literal key. → services 100%.
- **#2 `hooks/use-localization.ts:33`** — new `hooks/use-localization.test.tsx`: a consumer calls
  `t('lesson.title', { id: '7' })` through the hook and asserts `Lesson 7`, proving options are forwarded
  (kills `?? {}` → `&& {}`).
- **#3–5 `provider:33,68`** — added `renders nothing until the initial locale resolves, then reveals its
  children` to `localization-provider.test.tsx`: `queryByText` is null on first synchronous paint, then
  `findByText` after the async resolve (the R2 no-flash gate). Kills the `ready` useState / `if (!ready)` mutants.
- **#6 `provider:32`** — added `builds the initial i18n instance for the explicit initialLocale, not the
  device locale`: spies on `createI18n` and asserts it is called with `'es'` when `initialLocale="es"`
  `deviceLocale="de-DE"` (kills `?? resolveInitialLocale` → `&&`).
- **#7 `study-buddy/language-settings.tsx:25`** — added `labels the selector group from the a11y
  translation key` to `language-settings.test.tsx`: asserts `t` called with `'settings.language.a11yLabel'`
  and the selector exposes that label (@s13).
- **#8 `provider:60`** — tightened the failed-save test in `localization-persistence.test.tsx` to
  `expect(warn).toHaveBeenCalledWith('Failed to persist locale preference', expect.any(Error))`.

### Group B — StyleSheet values on changed `.tsx` (killed via resolved-style assertions)
- **#9–16 `components/language-selector.tsx`** — added three tests using `toHaveStyle` on the rendered
  elements: group laid out from tokens (`alignSelf: 'stretch'`, `gap: 8`); each option a spaced row
  (`flexDirection/alignItems/justifyContent`); active label carries the heavier title typography
  (`fontWeight: '600'`, `fontSize: 16`). Kills the ObjectLiteral/StringLiteral style mutants.
- **#17–19 `study-buddy/language-settings.tsx`** — added `spaces the section from a spacing token and
  styles the heading typography`: heading `toHaveStyle({ fontWeight: '600', fontSize: 14 })` and its
  container `toHaveStyle({ gap: 12 })`.

### Group C — memo/effect internals & i18next flags
- **Killed:** `config/i18n.ts` `escapeValue` (#26/#27) — `injects interpolated values without
  HTML-escaping them` asserts `t('lesson.title', { id: '<b>&"' }) === 'Lesson <b>&"'`; `returnNull`
  (#29) — `returns a string, never null, for a null-valued resource`; the useEffect dep-array (#20,
  `provider:50`) — `re-resolves the locale when the device locale prop changes` re-renders with a new
  `deviceLocale` and asserts the effect re-runs.
- **Excluded as equivalent (written justification appended to `mutation.md`):** #21/#22 (useCallback/useMemo
  dep arrays — perf-only, `i18n`/`setLocale` are stable), #23/#24/#25 (async-set-after-unmount guard — no
  observable effect / no warning in React 18/19), #28 (`initImmediate` — no async backend, inline resources
  load synchronously either way).

### Tooling fixes (mutation.md "Infra blockers")
- `libs/study-buddy/stryker.config.mjs` — reworded the JSDoc example so `*/` no longer prematurely closes
  the block comment; added `inPlace: true` (jest `setupFiles` reaches the sibling `@helsoft/components`
  theme, absent from Stryker's sandbox); named `plugins`.
- Explicit `plugins` in all four affected `stryker.config.mjs` (ts-jest libs:
  `jest-runner` + `typescript-checker`; jest-expo libs: `jest-runner`) so runs work under pnpm without
  an ad-hoc `--plugins` flag.
- `.gitignore` — ignore Stryker `reports/mutation/` + `.stryker-tmp/`.

### Re-work gate ✅
`pnpm check-types` (8 pkgs) + `pnpm lint` clean; `pnpm test` green everywhere (localization 51, components 15,
study-buddy 5, services 14, hooks 4, lib-with-storybook 2); `pnpm --filter @helsoft/components test:e2e` = 19/19.
Per-lib Stryker on changed files: services / components / study-buddy = **100%**; localization = 100% of
non-equivalent mutants killed, 6 documented equivalents. Left for re-review (not self-marked done).

---

## Phase 5 — post-approval polish (review.md minor findings)

Review verdict was APPROVED (no blocker/major); these 6 actionable minors were resolved as a follow-on.
Each production change was driven RED→GREEN; behavior-preserving refactors rode existing tests. Finding 7
(the selector's distinct single-select visual + `borderWidth: 2/1` literals) was **not** touched — it is
human-gate-approved and explicitly not a violation.

### Finding 6 (a11y) — heading exposes header role
- **RED** — `language-settings.test.tsx` → `exposes the language heading as a header`:
  `getByRole('header', { name: 'Language' })` (WCAG 1.3.1). Failed (heading was plain `Text`).
- **GREEN** — added `accessibilityRole="header"` to the heading `Text` in `language-settings.tsx`.
- Kills the `"header"` StringLiteral mutant on the changed line.

### Finding 1 (a11y, mutation-relevant) — tightened selector assertions
- **Tests only** (`language-selector.test.tsx`, presentational component unchanged):
  `exposes a radiogroup role for the container` asserts the labelled container node's
  `accessibilityRole === 'radiogroup'` (the container is intentionally **not** an accessibility *element*
  — marking it `accessible` would hide the option children — so the role is asserted on the node, not via a
  `byRole` query, which only reaches accessible elements); `places the check indicator inside the active
  option only` uses `within(activeRadio)` to tie the non-color check cue to the selected row and asserts no
  inactive row carries it. Both green on the existing component (no `radiogroup` was missing).
- **Correction (round-2 re-review, 2026-07-10):** the paragraph above, and this write-up's original framing,
  overclaimed what `exposes a radiogroup role for the container` proves. It is a real, legitimate regression
  guard for the literal `accessibilityRole` prop *value* — nothing more. It does **not** prove, and should
  not be read as proving, that native (iOS/Android) assistive tech ever perceives the "radiogroup" grouping:
  a genuine `getByRole('radiogroup')` query throws on this exact markup (empirically reconfirmed independently
  below, in Phase 6), precisely because the container is never `accessible={true}`. That is by design — see
  Phase 6 for why — but it means the WCAG 1.3.1/4.1.2 group-semantics gap for the container is real, not
  closed by this test. The test's own comment and this section have both been corrected accordingly (see
  `language-selector.test.tsx`'s updated comment on that test, and Phase 6 below for the full investigation
  and the human-facing "Known limitation" write-up in `spec.md` FO2).

### Finding 3 (code/security) — narrowed the type-boundary casts via `isSupportedLocale`
- **`use-localization.ts`** — **RED**: `use-localization.test.tsx` →
  `falls back to the fallback locale when i18n reports an unsupported language` renders the provider with
  `initialLocale={'fr' as Locale}` (i18next reports `i18n.language === 'fr'`, no `supportedLngs` filtering)
  and asserts the hook exposes `locale === 'en'`. Failed (rendered `fr` via the unguarded cast).
  **GREEN**: `locale: isSupportedLocale(i18n.language) ? i18n.language : FALLBACK_LOCALE`.
  The new branch is killed both ways — false branch by this test (`fr`→`en`), true branch by the existing
  per-locale assertions (`es`/`pt`/…).
- **`language-settings.tsx`** — **RED**: `language-settings.test.tsx` →
  `does not forward a selection that is not a supported locale` drives the real selector's `onChange` with an
  out-of-set value (`supportedLocales: ['en','fr']`, `fr` labelled but not a `Locale`) and asserts `setLocale`
  is **not** called. Failed (the `value as Locale` cast forwarded `fr`). **GREEN**: guard the boundary —
  `onChange` only calls `setLocale(value)` when `isSupportedLocale(value)`.

### Finding 4 (code) — removed dead `clearStoredLocale`
- No production consumer existed. Removed `LocalePreferenceDao.clearStoredLocale`, its DAO test
  (`clearStoredLocale removes the preference key`) + the now-unused `removeItem` on the AsyncStorage mock,
  and the stray `clearStoredLocale: jest.fn()` entry in `locale-preference.service.test.ts`. Grep confirms no
  remaining references. Remaining DAO/service mutants stay 100%.

### Finding 5 (architecture) — stopped over-exporting the internal context
- `libs/localization/src/index.ts` no longer does `export * from './provider/localization-provider'` (which
  leaked the runtime `LocalizationContext`, letting callers bypass `useLocalization`). Now names the public
  surface: `export { LocalizationProvider }` + `export type { LocalizationProviderProps }`. The hook still
  reaches the context via its in-lib relative import; grep confirms no external consumer used the context or
  `LocalizationContextValue`. (Barrels are excluded from mutation.)

### Finding 2 (performance, mutation-relevant) — memoization, applied selectively
- **`use-localization.ts` — DONE.** The result object (and its `t` wrapper) is now built inside a single
  `useMemo(…, [t, language, setLocale])`, so consumers get a stable reference. The empty-deps
  `ArrayDeclaration` mutant is killed by the existing `re-resolves the locale when the device locale prop
  changes` test (frozen deps would leave `locale` stale on the in-place re-render). 100% on the file.
- **`language-settings.tsx` — DECLINED (noted per the task's gate-first guidance).** Wrapping `options` in
  `useMemo` and the handler in `useCallback` each add an `ArrayDeclaration` dep-array mutant that can only be
  killed by observing an **in-place re-render** where the dep changes. Under the study-buddy harness
  (jest-expo + RNTL 14 + React 19) an in-place re-render does not re-invoke the component in a test-observable
  way — verified by probes: neither `rerender(<propless/>)` nor a reducer-driven update re-ran the component
  or updated queried output (existing study-buddy tests only ever assert interaction *side-effects*, never
  re-rendered output). So those mutants would survive and break the 100%-on-changed-lines gate, for **zero**
  perf benefit (4 static items feeding an unmemoized selector — the review's own "harmless in current usage").
  The finding-3 guard was therefore kept as a plain inline handler and `options` left inline (the
  previously-100%-covered shape). `language-settings.tsx` stays at 100%.
- **`localization-provider.tsx` — NOT TOUCHED.** Per the task, the reportedly-redundant cold-start
  `changeLanguage` was only to be changed if the first-paint/ready-gate tests and provider mutation both stayed
  100%. The ready-gate (no flash of untranslated copy, R2) is load-bearing and its mutants are already killed;
  altering the cold-start path risked regressing that gate with no test-observable win, so it was left as-is.

### @s → test map (additions)
| @s | Added/changed test |
|---|---|
| @s5/@s13 | `language-selector.test.tsx`: `exposes a radiogroup role for the container`, `places the check indicator inside the active option only` |
| @s6 (a11y) | `language-settings.test.tsx`: `exposes the language heading as a header` |
| @s6 (boundary) | `language-settings.test.tsx`: `does not forward a selection that is not a supported locale` |
| supplementary hardening (not tied to a single @s) | `use-localization.test.tsx`: `falls back to the fallback locale when i18n reports an unsupported language` — a defense-in-depth guard on the hook's `locale` exposure (guards against i18next ever reporting an out-of-set `i18n.language` reaching a consumer unguarded), not the device-locale-detection scenario itself; the real @s3/@s4 coverage is `detector/resolve-initial-locale.test.ts` + `provider/localization-provider.test.tsx` as already listed in the `@s → test map` above. |

### Phase 5 gate ✅
`pnpm check-types` (8 pkgs) + `pnpm lint` clean; `pnpm test` green everywhere (localization 52, components 17,
study-buddy 7, services 13, hooks 4, lib-with-storybook 2); `pnpm --filter @helsoft/components test:e2e` = 19/19.
Per-lib Stryker on changed files — `use-localization.ts`, `language-selector.tsx`, `language-settings.tsx`,
`locale-preference.dao.ts` (+ `.service.ts`) — all **100%** (0 survived). Left for re-review (not self-marked done).

---

## Phase 6 — round-2 change request response (a11y major finding, `review.md`)

`reviews_lead` issued one consolidated round-2 change request: investigate whether
`libs/components/src/molecules/language-selector/language-selector.tsx:38`'s container `radiogroup` role +
group label can be exposed to native (iOS/Android) assistive tech without regressing the four individually-
accessible `radio` children; ship a verified-safe fix via TDD if one exists, otherwise correct the record
and document the gap honestly. No `@s` demands new behavior here — this is a re-work response, not a new
scenario — so no production code was written per Law 1 (no failing test demanded any).

### Investigation (before writing any test or code, per the task's explicit order)

1. **Re-verified the reviewer's claim against the actual installed RN source**
   (`node_modules/react-native@0.86.0/Libraries/Components/View/ViewAccessibility.js:341-424`): the full
   `AccessibilityProps` type for a plain `View` was read end-to-end. There is **no public prop** that lets a
   container announce a group role/label to native assistive tech while leaving its children independently
   navigable. Candidates considered and rejected:
   - `accessible={true}` — the "obvious fix"; per RN's own doc comment ("By default, all the touchable
     elements are accessible") and the native gating the reviewer cited
     (`RCTViewComponentView.mm:398`: `self.accessibilityElement.isAccessibilityElement = newViewProps.accessible;`),
     this makes the container an opaque leaf on iOS — the trap, confirmed rather than assumed (see probe below).
   - `accessibilityLabelledBy` / `aria-labelledby` (Android-only) — solves a different problem (labelling one
     element *from* another element's text via `nativeID`); does not create a "group, not leaf" relationship.
   - `importantForAccessibility` (Android-only) — controls whether a view fires accessibility events /
     is reported to services; doesn't add role/label exposure or grouping semantics by itself.
   - `accessibilityViewIsModal`, `role` (web-role alias) — unrelated (modal focus-trapping; `role` is just an
     alias for `accessibilityRole`, same gating).
   - Checked the Android native delegate too
     (`ReactAccessibilityDelegate.kt` — `ReactAndroid/src/main/java/com/facebook/react/uimanager/`):
     Android's `AccessibilityNodeInfo` tree model is structurally different from iOS's opaque
     `UIAccessibilityContainer` leaf behavior (it supports nested focusable nodes), so a
     `Platform.OS === 'android'`-scoped `accessible={true}` is *conceivable* in principle — but nothing in
     this repo's tooling (no Android emulator/TalkBack harness wired into CI) can verify it stays safe, and
     shipping an unverified, platform-split accessibility prop on the say-so of reading native Kotlin source
     alone is exactly the "fragile, unverified fix" the task said not to force. Rejected on verification
     grounds, not on data suggesting it is unsafe.
2. **Empirically tested whether this repo's own test tooling can even verify the trap**, via a throwaway
   probe test (written, run, and deleted — never committed; mirrors `reviewer_accessibility`'s own stated
   methodology of a "throwaway probe... removed after use"). Two facts established directly against the real
   component and against RNTL's/RN's actual source, not by inference:
   - **Fact A** — `screen.getByRole('radiogroup')` throws today on the real, unmodified `LanguageSelector`
     markup ("Unable to find an element with role: radiogroup"). Independently reconfirms
     `reviewer_accessibility`'s empirical claim.
   - **Fact B** — rendering the *same* container/children shape with `accessible={true}` added to the
     container, `screen.getByRole('radiogroup')` **passes** *and* `screen.getAllByRole('radio')` **still
     finds all 4 children** in `@testing-library/react-native`. Traced why: RNTL's own descendant-filtering
     logic (`@testing-library/react-native/dist/helpers/accessibility.js:isHiddenFromAccessibility`, called
     from `dist/helpers/find-all.js:findAll`) only excludes descendants for `aria-hidden`,
     `accessibilityElementsHidden`, `importantForAccessibility === 'no-hide-descendants'`, `display: none`,
     or an `accessibilityViewIsModal` sibling — it **never** checks whether an ancestor has `accessible={true}`.
     RNTL simply does not model the native "accessible container becomes one opaque leaf, children stop being
     independently reachable" behavior that iOS's `RCTViewComponentView.mm` implements.
   - **Conclusion of the probe:** this is decisive, not just corroborating. It proves that **the specific
     verification the task requires — "a real accessibility-tree assertion... that all four radio children
     remain individually reachable" — cannot be produced with this repo's test tooling (Jest +
     `@testing-library/react-native`) for this particular native quirk.** A test asserting the children are
     still queryable after adding `accessible={true}` would go green in CI while the real on-device iOS
     behavior could still be a regression — i.e. exactly the false-confidence trap the task warned about,
     now demonstrated rather than hypothesized. Shipping the "fix" on the strength of a passing RNTL test
     would be worse than not shipping it: a green bar that doesn't mean what it appears to mean.

### Decision: no verified-safe fix — documented as a known limitation, no production code changed

Per the task's own branching (§3), because no fix can be verified safe with the tooling available in this
repo (no on-device VoiceOver/TalkBack harness, and RNTL cannot faithfully model the native swallowing
behavior for either candidate platform-scoped variant), `language-selector.tsx`'s accessibility props were
**left unchanged**. `libs/components/src/molecules/radio-group/radio-group.tsx` — the pre-existing sibling
with the identical pattern — was **not touched**, per the task's explicit scope boundary (item 4); it is a
separately-owned component and fixing the systemic pattern generically is out of this feature's scope.

Instead, three doc corrections were made, all traceable to this investigation:
1. **`language-selector.test.tsx`** — the comment on `exposes a radiogroup role for the container`
   (previously implying the container is "announced" as a group) now states plainly that the test guards
   only the literal `accessibilityRole` prop value, links to why (children reachability), and points at
   `spec.md`'s FO2 / this section for the full context.
2. **This file, Finding 1 (a11y, mutation-relevant), Phase 5** — appended a correction paragraph: the original
   write-up implied the new test "tightened" coverage of the container's group semantics; it did not — it
   only tightened the prop-value regression guard. The gap this round's review surfaced is real and remains
   open (tracked below, not silently closed).
3. **`spec.md`** — added **Follow-on FO2** (parallel in form and in "human-approved TODO" spirit to the
   existing FO1): documents the limitation, its root cause, why the obvious fix is unsafe, why this repo's
   test tooling cannot verify a fix even if one were attempted, that the identical pattern predates this
   feature in `RadioGroup`, and that a cross-cutting resolution (if any exists) is out of this feature's
   scope — flagged for a human/product follow-up decision. A footnote was also added directly under AC14
   pointing to FO2, so a reader of the acceptance criteria sees the caveat in place, not only in the
   follow-on list.

No code `TODO` comment was added to `language-selector.tsx` (per the task's explicit instruction — the point
is an honest paper trail in the tracked docs, not a hidden inline comment).

### What remains true and unchanged
- Every individual `radio` option is still fully labelled (`accessibilityLabel`), roled
  (`accessibilityRole="radio"`), and stated (`accessibilityState={{selected, disabled}}`) via `Pressable`,
  which RN makes accessible by default — unaffected by this investigation. The feature's task remains
  completable end-to-end with assistive tech; what is missing is the explicit group-level framing on native
  platforms only (web is unaffected, per the review's own finding on `react-native-web`'s unconditional
  `role` mapping).
- The 95 pre-existing tests are untouched in behavior; only the one test's comment changed (no assertion
  changed), so no test outcome changes as a result of this phase.

### Phase 6 gate ✅
No production code changed (no failing test demanded any — Law 1 honored by *not* writing one for an
unverifiable "fix"). Doc-only changes: `language-selector.test.tsx` (comment only, no assertion change),
`spec.md` (FO2 + AC14 footnote), this file (Finding-1 correction, Phase 6, `@s3/@s4` mistag fix). Re-ran the
full suite after the comment change: `pnpm test` still green everywhere (95/95, same as Phase 5 — no test
gained or lost); `pnpm check-types` and `pnpm lint` clean; `pnpm --filter @helsoft/components test:e2e`
19/19. Left for re-review (not self-marked done) — expected outcome is that `reviewer_accessibility` either
accepts the documented limitation (round 3) or the human is asked to make the FO2 call, per the review's own
3-round-cap escalation path.
