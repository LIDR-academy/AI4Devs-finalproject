# review-code — activity-fill-in-the-blank — SLICE 2

**Reviewer:** reviewer_code  
**Scope:** Slice 2 only — task-5 (Empty + Error unavailable + empty-submit). `@s6`, `@s11`, `@s12`.  
**Deferred (not flagged):** stories/e2e/i18n/a11y (Slice 3).  
**Rubric:** `.agents/rules/review-standards.md` §1 + `.agents/rules/tdd.md`

## Verdict: APPROVED

## Findings

_None._

## Scenario coverage (`@s6` / `@s11` / `@s12`)

| Scenario | Concrete test(s) |
|---|---|
| @s6 | organism: empty value → Submit enabled + `onSubmit` (`fill-in-the-blank.test.tsx:159`); activity e2e: empty press → incorrect + `cancel` + reveal `Paris` + lock + `onAnswered` (`fill-in-the-blank-activity.test.tsx:182`); grader empty → incorrect+`[0]` (Slice 1, still green) |
| @s11 | activity: empty `acceptedAnswers` **and** `['Paris','']` → unavailable UI, no blank, `onAnswered` never, `unavailable: true` (`fill-in-the-blank-activity.test.tsx:205` / `:220`); organism `unavailable` prop; grader `isFillInTheBlankSlideValid` empty list/entry |
| @s12 | organism: multi-`____` → unavailable, no input/button (`fill-in-the-blank.test.tsx:190`); activity: missing **and** multi blank → unavailable, no grading (`fill-in-the-blank-activity.test.tsx:238` / `:253`); grader valid=false for both |

All three Slice 2 scenarios map to ≥ 1 concrete, currently-passing test. Content path for valid slides unchanged (Slice 1 cases still green).

## TDD / craftsmanship

- `tdd.md` Cycles 8–10: tests deepened; GREEN on existing Slice 1 impl — **no production change** (OK; no code without a test demand).
- New tests demand the contract: empty-submit resolve+lock; both invalid `acceptedAnswers` shapes; missing + multi blank.
- Functional React; `FillInTheBlankProps` / `FillInTheBlankActivityProps`; kebab-case; no `console.log` / TODO / `.only`/`.skip`.
- Wrapper still guards `!valid` before `gradeFillInTheBlank`; organism early-returns on `unavailable \|\| !parts`.

## Gates (re-run from worktree)

- `pnpm --filter @helsoft/activities exec jest … fill-in-the-blank.test.tsx` — **14 pass**
- `pnpm --filter @helsoft/study-buddy exec jest … fill-in-the-blank-activity.test.tsx|grade-fill-in-the-blank` — **29 pass**
- `pnpm turbo run check-types --filter=@helsoft/activities --filter=@helsoft/study-buddy` — green
- lint: no package lint scripts (turbo no-op)
