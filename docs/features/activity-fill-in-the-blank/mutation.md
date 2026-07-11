# Mutation report — activity-fill-in-the-blank — PRE-REVIEW (re-run)

**Verdict: PASS** — 100% of feature-changed **logic** mutants killed. Remaining survivors are justified equivalents (grader early-exit + StyleSheet styling).

Pass: PRE-REVIEW re-run after implementator killed `:88` / `:99` / `:129` organism survivors.

## Scope

| Lib | File | Mutate |
|---|---|---|
| `@helsoft/study-buddy` | `src/grading/grade-fill-in-the-blank.ts` | yes |
| `@helsoft/study-buddy` | `src/components/fill-in-the-blank-activity/fill-in-the-blank-activity.tsx` | yes |
| `@helsoft/activities` | `src/organisms/fill-in-the-blank/fill-in-the-blank.tsx` | yes |

Excluded: `*.test.*`, `*.stories.tsx`, `*.e2e.js`, types-only.

## Per-lib scores

| Lib | File | Total | Killed | Timeout | Survived | Errors | Score | Status |
|---|---|---|---|---|---|---|---|---|
| `@helsoft/study-buddy` | `fill-in-the-blank-activity.tsx` | 18 | 18 | 0 | 0 | 0 | **100%** | PASS |
| `@helsoft/study-buddy` | `grade-fill-in-the-blank.ts` | 57 | 54 | 1 | 1 | 1 | **98.21%** | 1 equiv |
| `@helsoft/activities` | `fill-in-the-blank.tsx` | 78 | 58 | 0 | 19 | 1 | **75.32%** | styling equiv |
| **Feature logic** | — | — | — | — | **0 killable** | — | **100%** | **PASS** |

Timeout counts as killed. RuntimeError excluded from score (mutant crashes runner).

## Prior killable survivors — resolved

| file:line | Was | Now |
|---|---|---|
| `fill-in-the-blank.tsx:88` ConditionalExpression / EqualityOperator | Survived | **Killed** (blank-at-start omit-before test) |
| `fill-in-the-blank.tsx:99` ConditionalExpression / EqualityOperator | Survived | **Killed** (blank-at-end omit-after test) |
| `fill-in-the-blank.tsx:129` ConditionalExpression / LogicalOperator | Survived | **Killed** (correct result does not reveal acceptedAnswerShown) |

## Surviving mutants — equivalent (justified)

### `@helsoft/study-buddy` — `grade-fill-in-the-blank.ts:20`

- **ConditionalExpression** `if (count > 1) return false` → `if (false) return false`
- **EQUIVALENT:** early-exit only. Loop still increments `count`; final `return count === 1` yields `false` for multi-blank. Observable validity unchanged.

### `@helsoft/activities` — styling (19 survivors)

Jest + unistyles mock: style objects/props not behaviorally asserted (Playwright e2e covers visual). Same disposition as `activity-multiple-choice` / `login-and-logout`.

| file:line | Mutator | Mutation |
|---|---|---|
| `:110` | ArrayDeclaration | banner `style={[…]}` → `[]` |
| `:130` | BooleanLiteral | `bannerText(false)` → `bannerText(true)` (color only) |
| `:145` | ObjectLiteral | `root: {…}` → `{}` |
| `:148` | ObjectLiteral | `promptRow: {…}` → `{}` |
| `:149` | StringLiteral | `flexDirection: 'row'` → `""` |
| `:150` | StringLiteral | `flexWrap: 'wrap'` → `""` |
| `:151` | StringLiteral | `alignItems: 'center'` → `""` |
| `:154` | ObjectLiteral | `prompt: {…}` → `{}` |
| `:158` | ObjectLiteral | `blank: {…}` → `{}` |
| `:167` | ObjectLiteral | `banner: {…}` → `{}` |
| `:172` | ObjectLiteral | `bannerCorrect: {…}` → `{}` |
| `:175` | ObjectLiteral | `bannerIncorrect: {…}` → `{}` |
| `:178` | ObjectLiteral | `bannerRow: {…}` → `{}` |
| `:179` | StringLiteral | `flexDirection: 'row'` → `""` |
| `:180` | StringLiteral | `alignItems: 'center'` → `""` |
| `:183` | ObjectLiteral | `bannerText: (…) => ({…})` → `{}` |
| `:187` | ObjectLiteral | `explanation: {…}` → `{}` |
| `:190` | ObjectLiteral | `explanationHeading: {…}` → `{}` |
| `:194` | ObjectLiteral | `explanationBody: {…}` → `{}` |

## Other statuses (not survivors)

| Lib | file:line | Status | Note |
|---|---|---|---|
| study-buddy | `grade-fill-in-the-blank.ts:16` | Timeout | `while` body → `{}` — hit limit; counted killed |
| study-buddy | `grade-fill-in-the-blank.ts:35` | RuntimeError | `.normalize('NFD')` → `"Stryker was here!"` — crashes; excluded |
| activities | `fill-in-the-blank.tsx:144` | RuntimeError | `StyleSheet.create` arrow → `undefined` — crashes; excluded |

## Reports

- `libs/study-buddy/reports/mutation/mutation.html`
- `libs/activities/reports/mutation/mutation.html`
