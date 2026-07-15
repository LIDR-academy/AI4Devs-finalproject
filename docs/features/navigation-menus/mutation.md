# Mutation — navigation-menus (Phase 3a pre-review)

**Verdict: PASS** — threshold 100% killed on changed lines met (1 equivalent excluded).

Base: `20e41d9` (docs-approve). Scope: `run-mutation.sh 20e41d9`. Implementator re-runs hardened components + study-buddy; scores below reflect post-harden state.


## Per-lib scores

| Library | Total | Killed | Survived | Score |
|---------|------:|-------:|---------:|------:|
| @helsoft/hooks | 8 | 8 | 0 | 100% |
| @helsoft/logging-in-out | 25 | 25 | 0 | 100% |
| @helsoft/components | 125 | 125 | 0 | 100% |
| @helsoft/study-buddy | 71 | 71 | 0 | 100% |

study-buddy row excludes 1 equivalent mutant (see below). Raw Stryker count was 72 with that one survivor; after exclusion score is 100%.


## Equivalent exclusions

1. `libs/study-buddy/src/helpers/session-identity.helpers.ts:15` — **MethodExpression** removing `.filter(Boolean)` from the initials chain (`split → filter → map → join → slice`).

   **Justification:** Equivalent. Empty tokens from repeated spaces yield `undefined` on `word[0]`; `Array#join('')` coerces those to `''`, so initials match the filtered path. Suite asserts `" Ada   Byron  King Doe "` → `"AB"`; mutant survives because output is identical, not for lack of coverage.


## Survivors

None (killable). Threshold met.

