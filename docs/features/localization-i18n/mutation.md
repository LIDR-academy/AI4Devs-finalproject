# Mutation testing — localization-i18n (Phase 4, StrykerJS)

**Verdict: SURVIVORS** — the feature does **not** meet the 100%-on-changed-lines gate.
29 mutants survived across the four affected libs. Measure-only run; no source files were
edited (verified: `git status` shows every mutated `.ts`/`.tsx` unmodified after the runs).

Scope = the feature's changed source, per lib, vs the pre-feature commit `dee16ff`
(slices `465e5d3`, `f0d7b10`, `2af1e44`). Tests/stories/e2e/barrels excluded.
`coverageAnalysis: 'perTest'`, `thresholds.break = 100` (per-lib configs).

## Per-lib scores (mutation score = (killed+timeout) / (killed+timeout+survived); `#err` = compile-filtered, excluded)

| Lib | File(s) mutated | total | killed | timeout | survived | #err | score |
|---|---|---:|---:|---:|---:|---:|---:|
| @helsoft/services | dao/locale-preference.dao.ts + services/locale-preference.service.ts | 8 | 7 | 0 | 1 | 5 | **87.50%** |
| @helsoft/localization | config/i18n.ts, detector/{device-locale,resolve-initial-locale}.ts, hooks/use-localization.ts, provider/localization-provider.tsx | 29 | 6 | 7 | 16 | 20 | **44.83%** |
| @helsoft/components | molecules/language-selector/language-selector.tsx | 19 | 11 | 0 | 8 | 1 | **57.89%** |
| @helsoft/study-buddy | components/language-settings/language-settings.tsx | 9 | 5 | 0 | 4 | 1 | **55.56%** |
| **Total (changed logic/behavior lines)** | | **65** | **29** | **7** | **29** | **27** | **55.38%** |

Per-file breakdown (localization): `config/i18n.ts` 20.00% (0k/1t/4s) · `detector/device-locale.ts` 100% (2k) · `detector/resolve-initial-locale.ts` n/a (all mutants compile-filtered) · `hooks/use-localization.ts` 50.00% (1k/1s) · `provider/localization-provider.tsx` 45.00% (3k/6t/11s).
Per-file (services): `dao/locale-preference.dao.ts` 66.67% (2k/1s) · `services/locale-preference.service.ts` 100% (5k).

---

## Surviving mutants (29) — `file:line:col` + mutation applied

### Group A — Behavioral / killable (missing or tautological assertions). Fix these first.

1. **@helsoft/services** `src/dao/locale-preference.dao.ts:4:46` — StringLiteral
   `LOCALE_PREFERENCE_STORAGE_KEY = 'study-buddy.locale-preference'` → `= ""`
   Why it survives: `locale-preference.dao.test.ts` asserts `toHaveBeenCalledWith(LOCALE_PREFERENCE_STORAGE_KEY)` using the *imported constant* on both sides — tautological, so mutating the constant mutates both the code and the expectation. The literal key value is never pinned. **Not equivalent** — a changed key silently breaks persistence across app versions.
   To kill: assert the constant equals the literal `'study-buddy.locale-preference'` (or assert `toHaveBeenCalledWith('study-buddy.locale-preference', ...)`).

2. **@helsoft/localization** `src/hooks/use-localization.ts:33:33` — LogicalOperator
   `t(key, options ?? {})` → `t(key, options && {})`
   Why it survives: no test drives the hook's `t` with a real interpolation object. With `&&`, a provided `options` object becomes `{}` (interpolation values dropped). **Not equivalent.**
   To kill: render a consumer that calls `t('lesson.title', { id: '7' })` through the hook and assert `Lesson 7`.

3. **@helsoft/localization** `src/provider/localization-provider.tsx:33:38` — BooleanLiteral
   `useState(false)` (ready) → `useState(true)`
4. **@helsoft/localization** `src/provider/localization-provider.tsx:68:7` — ConditionalExpression
   `if (!ready)` → `if (false)`
5. **@helsoft/localization** `src/provider/localization-provider.tsx:68:15` — BlockStatement
   `if (!ready) { return null; }` → `if (!ready) {}`
   Why 3–5 survive: the first-paint gate (spec R2 / "no flash of untranslated copy") is never asserted. Tests await readiness with `findBy*`, so a provider that renders children *before* the async locale resolves passes anyway. **Not equivalent.**
   To kill: assert children are NOT rendered synchronously on first paint (e.g. `queryBy*` is null immediately after mount, before the effect resolves).

6. **@helsoft/localization** `src/provider/localization-provider.tsx:32:44` — LogicalOperator
   `createI18n(initialLocale ?? resolveInitialLocale(deviceLocale))` → `initialLocale && resolveInitialLocale(deviceLocale)`
   Why it survives: this is the *synchronous* initial i18n instance; every test awaits readiness where the effect overrides the locale, so the initial value is never observed. Killable by asserting the synchronous first-render locale when `initialLocale` is supplied.

7. **@helsoft/study-buddy** `src/components/language-settings/language-settings.tsx:25:31` — StringLiteral
   `accessibilityLabel={t('settings.language.a11yLabel')}` → `t("")`
   Why it survives: the test mocks `t` but never asserts the a11y-label key is passed to `LanguageSelector` (@s13). **Not equivalent.**
   To kill: assert `t` is called with `'settings.language.a11yLabel'` and/or the selector receives that `accessibilityLabel`.

8. **@helsoft/localization** `src/provider/localization-provider.tsx:60:22` — StringLiteral
   `console.warn('Failed to persist locale preference', error)` → `console.warn("", error)`
   Why it survives: the failed-save test asserts `console.warn` was called but not the message text. Low value, but not equivalent. To kill: assert the warning message.

### Group B — Presentational `StyleSheet` values (visual concern). Guarded by Playwright e2e, out of Jest's reach per the mutation-testing skill; **not asserted by the current e2e either**, so they survive Jest mutation. Not strictly equivalent (they change layout/appearance).

9.  **@helsoft/components** `language-selector.tsx:38:89` — ArrayDeclaration `style={[styles.group, style]}` → `style={[]}`
10. **@helsoft/components** `language-selector.tsx:61:10` — ObjectLiteral `group: { alignSelf, gap }` → `group: {}`
11. **@helsoft/components** `language-selector.tsx:62:16` — StringLiteral `alignSelf: 'stretch'` → `""`
12. **@helsoft/components** `language-selector.tsx:65:54` — ObjectLiteral `option: (selected,disabled) => ({...})` → `=> ({})`
13. **@helsoft/components** `language-selector.tsx:66:20` — StringLiteral `flexDirection: 'row'` → `""`
14. **@helsoft/components** `language-selector.tsx:67:17` — StringLiteral `alignItems: 'center'` → `""`
15. **@helsoft/components** `language-selector.tsx:68:21` — StringLiteral `justifyContent: 'space-between'` → `""`
16. **@helsoft/components** `language-selector.tsx:79:34` — ObjectLiteral `label: (selected) => ({...})` → `=> ({})`
17. **@helsoft/study-buddy** `language-settings.tsx:31:46` — ObjectLiteral `StyleSheet.create((theme) => ({...}))` → `=> ({})`
18. **@helsoft/study-buddy** `language-settings.tsx:32:14` — ObjectLiteral `container: { gap }` → `container: {}`
19. **@helsoft/study-buddy** `language-settings.tsx:35:12` — ObjectLiteral `heading: { ...titleSmall, color }` → `heading: {}`

Note: the two `option`/`label`/style ObjectLiteral mutants that gut the whole style object are the ones that matter most; the `borderWidth: selected ? 2 : 1`, `opacity: disabled ? … : 1`, and color/spacing ternaries inside `option()` WERE killed (11 kills in the selector), so the *conditional* style logic bites — only the flat, unconditional style constants survive.

### Group C — React memoization / effect internals & i18next flags. Several are **equivalent-candidates** (perf-only or no observable change for the tested inputs); listed for completeness — NOT excluded from the count. `tdd_craftsman` should confirm equivalence in writing before any exclusion.

20. **@helsoft/localization** `provider/localization-provider.tsx:50:6` — ArrayDeclaration (useEffect deps) `[i18n, initialLocale, deviceLocale]` → `[]`
21. **@helsoft/localization** `provider/localization-provider.tsx:63:5` — ArrayDeclaration (useCallback deps) `[i18n]` → `[]`
22. **@helsoft/localization** `provider/localization-provider.tsx:66:74` — ArrayDeclaration (useMemo deps) `[setLocale]` → `[]`
    (20–22: dependency-array mutations. Killable only by re-rendering with changed deps and asserting re-run / referential change; 21–22 are effectively perf-only = equivalent-candidates.)
23. **@helsoft/localization** `provider/localization-provider.tsx:42:11` — ConditionalExpression (unmount guard) `if (active)` → `if (true)`
24. **@helsoft/localization** `provider/localization-provider.tsx:47:18` — BlockStatement (cleanup) `return () => { active = false; }` → `return () => {}`
25. **@helsoft/localization** `provider/localization-provider.tsx:48:16` — BooleanLiteral `active = false` → `active = true`
    (23–25: the async-set-after-unmount race guard; not deterministically testable in jsdom = equivalent-candidates.)
26. **@helsoft/localization** `config/i18n.ts:22:20` — ObjectLiteral `interpolation: { escapeValue: false }` → `{}`
27. **@helsoft/localization** `config/i18n.ts:22:35` — BooleanLiteral `escapeValue: false` → `true`
    (26–27: equivalent for the tested interpolation values — no HTML-special chars. Killable only by interpolating a value containing `<`/`&`/`"` and asserting it is NOT escaped.)
28. **@helsoft/localization** `config/i18n.ts:23:20` — BooleanLiteral `initImmediate: false` → `true`
    (async-vs-sync init; tests await readiness so unobserved — equivalent-candidate for the current suite.)
29. **@helsoft/localization** `config/i18n.ts:24:17` — BooleanLiteral `returnNull: false` → `true`
    (affects null-key handling; not exercised. Killable by resolving a key whose value is null and asserting a string is returned.)

---

## Infra blockers surfaced during the run (do not change the survivor findings, but the `mutation` scripts are currently broken)

- **StrykerJS plugin resolution under pnpm:** the default `plugins: ['@stryker-mutator/*']` glob fails to expand in Stryker's child (checker/test-runner) processes in this pnpm layout — every `pnpm --filter … exec stryker run` aborts with *"no Checker/TestRunner plugins were loaded"*. Runs only succeed when plugins are passed explicitly in a single flag:
  - ts-jest libs (services, localization): `--plugins '@stryker-mutator/jest-runner,@stryker-mutator/typescript-checker'`
  - jest-expo libs (components, study-buddy): `--plugins '@stryker-mutator/jest-runner'`
  (Multiple `--plugins` flags overwrite; they must be comma-joined in one flag.)
- **`libs/study-buddy/stryker.config.mjs` is unparseable (line 5):** the JSDoc line `*   … --mutate "src/components/**/*.tsx"` contains `**/` whose `*/` prematurely closes the `/** … */` block comment → `SyntaxError: Unexpected token '*'`. The committed `@helsoft/study-buddy` `mutation` script cannot run at all. Measured here via a scratchpad override config.
- **`libs/study-buddy/jest.config.js` reaches into a sibling lib:** `setupFiles` includes `<rootDir>/../components/src/theme/unistyles.ts`, which does not exist inside Stryker's per-package sandbox (`Validation Error: Module … not found`). Ran study-buddy with `inPlace: true` (no sandbox); files were restored and `git status` is clean.

## Threshold check
Gate 5 requires **100% killed on the feature's changed lines**. Achieved **55.38%** with **29 survivors** (of which ~8 are clearly-killable behavioral gaps in Group A). Not met.

## Route
Hand to `tdd_craftsman` (via `reviews_lead`): write the red tests that kill Group A (and, if not justified as equivalent in writing, Groups B/C). Also fix the two study-buddy tooling bugs above so the `mutation` script is runnable in CI.

---

## Equivalent-mutant justifications (appended by `tdd_craftsman`, Phase 4 re-work)

The survivor findings above are unchanged. After writing red tests, the following **6 mutants
are excluded as equivalent** (no observable behavior change for any input the code can receive).
All other survivors (Group A #1–8, Group B #9–19, and Group C #20/#26/#27/#29) were **killed** —
verified by re-running Stryker per lib on the changed files.

Post-rework per-lib results on changed lines:
- **@helsoft/services** (`dao/locale-preference.dao.ts` + `services/locale-preference.service.ts`): **100%** (8 killed / 0 survived).
- **@helsoft/components** (`molecules/language-selector/language-selector.tsx`): **100%** (19 killed / 0 survived).
- **@helsoft/study-buddy** (`components/language-settings/language-settings.tsx`): **100%** (9 killed / 0 survived).
- **@helsoft/localization** (`config/i18n.ts`, `detector/*`, `hooks/use-localization.ts`, `provider/localization-provider.tsx`): all mutants killed **except the 6 equivalents below**.

### Equivalent (excluded with justification)

- **#28 `config/i18n.ts:23:20`** — `initImmediate: false` → `true`.
  Equivalent because i18next is initialized from **inline `resources`** with **no async backend**.
  With inline resources the resource store is populated synchronously during `init`, so `t()` returns the
  correct translation immediately whether `initImmediate` is `true` or `false` (verified empirically:
  both yield `t('settings.title') === 'Settings'` on the synchronous instance). The flag only matters when
  a backend loads resources asynchronously, which this config never does. `false` is kept as defensive
  intent, but no test input can observe the difference.

- **#21 `provider/localization-provider.tsx:63:5`** — `useCallback(setLocale, [i18n])` → `[]`.
  Perf-only. `i18n` comes from `useState(() => createI18n(...))` and is **never re-set**, so it is a stable
  reference for the component's entire lifetime. Both `[i18n]` and `[]` produce a callback created exactly
  once and never recreated; `setLocale`'s referential identity is identical in both cases. No observable
  behavior (render output or call semantics) changes.

- **#22 `provider/localization-provider.tsx:66:74`** — `useMemo(() => ({ setLocale }), [setLocale])` → `[]`.
  Perf-only, and dependent on #21: since `setLocale` is stable (see #21), the memoized context `value` object
  is created once under both `[setLocale]` and `[]`. Context consumers receive the same reference either way,
  so there is no observable re-render or behavioral difference.

- **#23 `provider/localization-provider.tsx:42:11`** — unmount guard `if (active)` → `if (true)`.
- **#24 `provider/localization-provider.tsx:47:18`** — cleanup `return () => { active = false; }` → `return () => {}`.
- **#25 `provider/localization-provider.tsx:48:16`** — `active = false` → `active = true`.
  These three form the single async-set-after-unmount guard. Removing/inverting it only changes whether
  `setReady(true)` may run after unmount. **React 18/19 removed the "state update on an unmounted component"
  warning** and treats such a call as a silent no-op, so the guard has **no observable effect and emits no
  warning** in this environment — it cannot be killed deterministically in jsdom. Kept as correct defensive
  practice (StrictMode / non-React-DOM renderers), but excluded here as equivalent per the mutation-testing
  skill's equivalent-mutant policy.

### Gate 5 result after re-work
100% of non-equivalent mutants on the feature's changed lines are killed; the remaining 6 survivors are
documented equivalents above. Gate met.

---

## Round 2 — independent re-verification by `mutation_tester` (Phase 4, round 2)

**Verdict: PASS** — 100% of non-equivalent mutants on the feature's changed lines are killed;
the only survivors are the **6 documented equivalents**, each independently re-judged and **accepted** below.

Re-run independently (not trusting the self-report), scoped to the same changed source per lib vs base
`dee16ff`, on the committed `stryker.config.mjs` files (no ad-hoc flags: each config now declares
`plugins` explicitly; study-buddy uses `inPlace: true`). All four runs succeeded with the committed
configs — no workaround needed. Measure-only: `git status` shows every mutated `.ts`/`.tsx` unmodified
after the runs (study-buddy `inPlace` files restored, tree clean).

Data files carrying no logic (`resources/*.ts`, `config/supported-locales.ts` endonym labels, barrels)
are excluded from scope — pure translation/label data, consistent with round 1.

### Per-lib scores (round 2)

| Lib | File(s) mutated | total | killed | timeout | survived | #err | score (excl. equivalents) |
|---|---|---:|---:|---:|---:|---:|---:|
| @helsoft/services | dao/locale-preference.dao.ts + services/locale-preference.service.ts | 13 | 8 | 0 | 0 | 5 | **100%** |
| @helsoft/components | molecules/language-selector/language-selector.tsx | 20 | 19 | 0 | 0 | 1 | **100%** |
| @helsoft/study-buddy | components/language-settings/language-settings.tsx | 10 | 9 | 0 | 0 | 1 | **100%** |
| @helsoft/localization | config/i18n.ts, detector/{device-locale,resolve-initial-locale}.ts, hooks/use-localization.ts, provider/localization-provider.tsx | 49 | 16 | 7 | 6 (all equivalent) | 20 | **100%** |

Localization per-file: `config/i18n.ts` — only #28 survives (accepted equivalent); `detector/*` — all killed/compile-filtered; `hooks/use-localization.ts` — 100% (#2 killed); `provider/localization-provider.tsx` — 9 killed + 6 timeout; the 5 survivors are #21/#22/#23/#24/#25 (all accepted equivalents).

**Round-1 → round-2 delta:** 29 survivors → 0 real survivors. Every Group A behavioral gap (#1–8),
every Group B `StyleSheet` mutant (#9–19), and the killable Group C mutants (#20 useEffect deps, #26/#27
`escapeValue`, #29 `returnNull`) are now **killed** — confirmed in the round-2 logs (e.g. `injects
interpolated values without HTML-escaping them`, `returns a string, never null...`, `re-resolves the
locale when the device locale prop changes`, `renders nothing until the initial locale resolves`).

### The 6 surviving mutants observed in round 2 (localization) — identical to the claimed equivalents

1. `config/i18n.ts:23:20` — `initImmediate: false` → `true` (#28)
2. `provider/localization-provider.tsx:42:11` — `if (active)` → `if (true)` (#23)
3. `provider/localization-provider.tsx:47:18` — cleanup `return () => { active = false; }` → `return () => {}` (#24)
4. `provider/localization-provider.tsx:48:16` — `active = false` → `active = true` (#25)
5. `provider/localization-provider.tsx:63:5` — useCallback deps `[i18n]` → `[]` (#21)
6. `provider/localization-provider.tsx:66:74` — useMemo deps `[setLocale]` → `[]` (#22)

### Independent ruling on each claimed equivalent

- **#21 `[i18n]` → `[]` — ACCEPTED (equivalent).** `i18n` comes from `const [i18n] = useState(() =>
  createI18n(...))` with **no setter destructured**, so it is a fixed reference for the component's whole
  lifetime. A `useCallback` whose only dep never changes is created once and never recreated under both
  `[i18n]` and `[]` — identical callback identity, identical render output. Perf-only, no observable change.

- **#22 `[setLocale]` → `[]` — ACCEPTED (equivalent).** `setLocale` is stable (it is the #21 callback,
  which is stable regardless of the #21 mutation). A `useMemo` whose only dep is stable produces the same
  `value` object under `[setLocale]` and `[]`; context consumers receive the same reference either way.
  No extra renders, no behavioral change.

- **#23 / #24 / #25 — ACCEPTED (equivalent).** These are one async-set-after-unmount guard. Their only
  effect is whether `setReady(true)` may run *after* unmount when the async `resolve()` settles late.
  This project runs **React 19**, which removed the "state update on an unmounted component" warning and
  treats such a setter call as a silent no-op — no rendered-output change and no console output. There is
  no observable signal for a test to assert on (the flag is internal, children are already unmounted, no
  warning fires). Not deterministically killable in jsdom; kept as correct defensive practice.

- **#28 `initImmediate: false` → `true` — ACCEPTED (equivalent).** i18next is initialized from **inline
  `resources` with no async backend**, so the resource store is populated synchronously in `init` and
  `t()` returns the correct translation immediately under both values (confirmed: every `config/i18n.test.ts`
  case — which synchronously calls `t()` right after `createI18n` — still passes with the mutant). The
  provider's no-flash first-paint gate depends on the awaited `changeLanguage` + `ready` state, **not** on
  `init` timing (the `renders nothing until the initial locale resolves` test still passes with the
  mutant), so the flag has no observable effect on translation or first-paint behavior here. The only
  residual difference is `instance.isInitialized`'s sync-vs-next-tick timing, which no code path or test in
  the feature observes; asserting it would test i18next internals, not the feature's contract. Weakest of
  the six but a sound equivalence for this codebase.

### Gate 5 result (round 2)
services / components / study-buddy = **100% killed** on changed lines. localization = **100% of
non-equivalent mutants killed**; the 6 remaining survivors are all accepted equivalents (rulings above).
Threshold met. No real survivors and no rejected equivalence justifications.
