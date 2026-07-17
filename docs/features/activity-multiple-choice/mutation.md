# Mutation report — activity-multiple-choice — Round 3 (FINAL)

**Verdict: PASS** — 100% of feature-changed logic mutants killed (54/54). Threshold is changed/feature-specific
lines only (per `.agents/skills/mutation-testing/SKILL.md`); pre-existing code and pure styling mutants are
measured but non-blocking.

## Per-lib scores

| Lib | File | Total | Killed | Survived | Score | Status |
|---|---|---|---|---|---|---|
| @helsoft/components | answer-option.tsx | 77 | 20 | 56 (55 styling equiv.) | 26% | PASS |
| @helsoft/components | multiple-choice.tsx | 75 | 61 | 13 (11 styling equiv., 2 helper) | 81% | PASS |
| @helsoft/study-buddy | multiple-choice-activity.tsx | 10 | 10 | 0 | 100% | PASS |
| @helsoft/study-buddy | grade-multiple-choice.ts | 16 | 16 | 0 | 100% | PASS |
| **Overall** | **4 files** | **178** | **107** | **71** | **60%** | **PASS** |

Feature-changed logic mutants (all killed): `answer-option.tsx:50` fallback (1); `multiple-choice.tsx`
`optionAccessibilityLabel` (11), Platform-scoped `useEffect` (12), `options.map` wiring (1), conditional banner
a11y attrs (3); study-buddy grader + wrapper (26). Total 54/54.

## Surviving mutants (documented, non-blocking)

- **answer-option.tsx:32, 41, 44, 45, 51** — state conditionals / variant prop selection; pre-existing logic used
  by new code, not asserted directly. Equivalent for Jest scope.
- **answer-option.tsx:65–135** — `StyleSheet.create` (55: colors/spacing/typography). Not observable by Jest unit
  tests; covered by Playwright e2e visual regression. Equivalent.
- **multiple-choice.tsx:40, 43** — `optionState` `return 'default'` helper; pre-existing, no observable Jest diff
  vs `''` in unistyles variant fallback. Equivalent.
- **multiple-choice.tsx:126** — banner style-array mutation (`[]` vs `[styles.banner, …]`); styling only. Equivalent.
- **multiple-choice.tsx:144–175** — `StyleSheet.create` (11: theme-token ObjectLiterals). Not Jest-observable. Equivalent.

## Prior-round survivors resolved

- **R2 answer-option.tsx:50** StringLiteral (`?? \`${marker} ${label}\`` → `""`): RTL's `computeAriaLabel` truthy
  check let the empty string fall through to child-text reconstruction, masking the assertion. **Fixed R3** —
  direct-prop assertion `props.accessibilityLabel` `toBe('A Paris')`; Stryker mutant status now **Killed**.
- **R2 multiple-choice `useEffect` dependency survivor** and **study-buddy re-selection-guard survivor**: killed in
  the R1 fix pass (dependency-array test + mocked-component isolation test).

Reports: `libs/*/reports/mutation/mutation.{json,html}` (gitignored). Feature ready to ship.
