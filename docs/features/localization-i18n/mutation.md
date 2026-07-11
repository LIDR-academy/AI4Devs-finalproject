# Mutation testing — localization-i18n (StrykerJS)

**Final verdict (round 2): PASS.** 100% of non-equivalent mutants on the feature's changed lines killed;
the only survivors are 6 documented, independently-accepted equivalents (localization). Scope = changed
source per lib vs base `dee16ff`; tests/stories/e2e/barrels + pure data (`resources/*`, endonym labels)
excluded. `coverageAnalysis: 'perTest'`, `thresholds.break = 100`.

## Per-lib scores (final, round 2 — score excludes accepted equivalents)
| Lib | Files mutated | total | killed | timeout | survived | score |
|---|---|---:|---:|---:|---:|---:|
| @helsoft/services | dao/locale-preference.dao.ts + services/locale-preference.service.ts | 13 | 8 | 0 | 0 | **100%** |
| @helsoft/components | molecules/language-selector/language-selector.tsx | 20 | 19 | 0 | 0 | **100%** |
| @helsoft/study-buddy | components/language-settings/language-settings.tsx | 10 | 9 | 0 | 0 | **100%** |
| @helsoft/localization | config/i18n.ts, detector/*, hooks/use-localization.ts, provider/localization-provider.tsx | 49 | 16 | 7 | 6 (all equivalent) | **100%** |

Round 1 → round 2 delta: 29 survivors → 0 real survivors. All Group A behavioral gaps (#1–8), Group B
StyleSheet mutants (#9–19), and killable Group C (#20 useEffect deps, #26/#27 `escapeValue`, #29
`returnNull`) are killed.

## Surviving mutants — the 6 accepted equivalents (localization)
| # | file:line | mutation | why equivalent / accepted |
|---|---|---|---|
| #28 | `config/i18n.ts:23:20` | `initImmediate: false → true` | inline `resources`, no async backend → store populated synchronously in `init`; `t()` returns correct value either way; first-paint gate depends on awaited `changeLanguage`+`ready`, not `init` timing. |
| #21 | `provider/localization-provider.tsx:63:5` | useCallback deps `[i18n] → []` | `i18n` from `useState` with no setter → stable for lifetime; callback created once under both; perf-only. |
| #22 | `provider/localization-provider.tsx:66:74` | useMemo deps `[setLocale] → []` | `setLocale` stable (see #21) → same `value` object either way; perf-only. |
| #23 | `provider/localization-provider.tsx:42:11` | unmount guard `if (active) → if (true)` | one async-set-after-unmount guard (with #24/#25); React 19 removed the unmounted-setState warning + treats it as silent no-op → no observable signal to assert; not deterministically killable in jsdom. |
| #24 | `provider/localization-provider.tsx:47:18` | cleanup `() => { active=false } → () => {}` | same guard as #23. |
| #25 | `provider/localization-provider.tsx:48:16` | `active = false → true` | same guard as #23. |

## Infra fixes made during the runs (now committed)
- StrykerJS plugin resolution under pnpm: default `@stryker-mutator/*` glob fails in child processes → each `stryker.config.mjs` now declares `plugins` explicitly (ts-jest libs: jest-runner + typescript-checker; jest-expo libs: jest-runner).
- `libs/study-buddy/stryker.config.mjs` JSDoc `**/` prematurely closed the block comment → reworded; added `inPlace: true` (jest `setupFiles` reaches sibling `@helsoft/components` theme, absent from Stryker's sandbox).
- `.gitignore` ignores `reports/mutation/` + `.stryker-tmp/`.

## Round-2 re-verification (independent)
Re-run on committed configs (no ad-hoc flags), measure-only (`git status` clean after). Rulings on each of
the 6 equivalents independently re-judged and ACCEPTED (same reasoning as table above). Gate 5 met: no real
survivors, no rejected equivalence justifications.
