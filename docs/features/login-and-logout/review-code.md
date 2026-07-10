# reviewer_code — login-and-logout — FULL feature review, Round 3 (final)

**Verdict: APPROVED**

Scope: independent, from-scratch re-review of the **complete, current** codebase (HEAD `4f47504`,
"fix(login-and-logout): derive TextField accessibilityInvalid from error"), across all three
vertical slices, against `.agents/rules/review-standards.md` §1, `gherkin-scenarios.md`
(@s1–@s13), `spec.md`, and `tdd.md`. This is Round 3, the last round under the 3-round cap — any
open blocker/major here is a hard escalation; only-minors would be a documented, human-accepted
risk. Not a diff-only rubber stamp: re-verified traceability, TDD discipline, and craftsmanship
across the whole feature, plus a targeted regression check on the Round-2 fix.

## Gates run myself
- `pnpm turbo run check-types --force` — **green**, 8/8 packages.
- `pnpm turbo run lint --force` — **green**.
- `pnpm turbo run test --force` — **green**, 6/6 workspaces: `@helsoft/services` 38/38,
  `@helsoft/hooks` 21/21, `@helsoft/components` **65/65** (up from 62 pre-Round-2, +3 for the new
  `text-field.test.tsx`), `@helsoft/study-buddy` 25/25, `@helsoft/localization` 55/55,
  `@helsoft/lib-with-storybook` 2/2.
- `pnpm --filter @helsoft/components exec playwright test --reporter=list` — **green**, **27/27**
  (up from 25, +2 for the new `text-field.e2e.js` `aria-invalid` cases).

## Round-2 fix — independently re-verified (revert→RED→restore, not a diff read)

**Derivation logic (`text-field.tsx:52,63`) is correct and the new test file is genuinely
non-vacuous.** I reverted the destructuring default myself (`accessibilityInvalid = error,` →
`accessibilityInvalid,`) and re-ran `text-field.test.tsx`:
- `'derives accessibilityInvalid from error when no explicit accessibilityInvalid is passed'` —
  genuinely failed (`Expected: true, Received: undefined`).
- `'defaults accessibilityInvalid to false when error is false and none is passed explicitly'` —
  genuinely failed (`Expected: false, Received: undefined`).
- `'lets an explicit accessibilityInvalid override the value derived from error'` — passed
  trivially both before and after, exactly as `tdd.md` itself discloses (an explicit value was
  always forwarded unchanged even pre-fix) — correctly *not* claimed as derivation evidence.

Restored the file, confirmed `git diff` empty, re-ran green (3/3). This is real RED→GREEN, not an
assumed one.

**The `inputProps` merge (`text-field.tsx:63,87`) is justified production code, not gold-plating.**
I independently tried the more "obvious" alternative — a standalone
`accessibilityInvalid={accessibilityInvalid}` JSX attribute alongside `{...rest}` — and confirmed
it genuinely fails `tsc --noEmit` with `TS2769` (`Property 'accessibilityInvalid' does not exist on
type '... Readonly<TextInputProps>'`), because this RN version's typings don't declare the prop and
a named JSX attribute is subject to the excess-property check that a `...rest` spread is not. The
merge-into-`rest` approach is the minimum change that satisfies both the derivation requirement and
`check-types` — no unjustified refactor.

**`login-form.tsx`'s simplification is behavior-preserving, not just claimed to be.**
`login-form.tsx:108,120` still pass `error={!!emailError}` / `error={!!passwordError}` unchanged;
only the redundant `accessibilityInvalid={!!emailError}` / `accessibilityInvalid={!!passwordError}`
lines were dropped (confirmed via `git show 4f47504 -- .../login-form.tsx` — a pure 2-line
deletion, no other change). Since `TextField` now defaults `accessibilityInvalid` to the `error`
value it receives, and `error` receives the exact same `!!emailError`/`!!passwordError` expression
the dropped prop used to receive directly, the two are provably identical by substitution — not
just "probably the same." `login-form.test.tsx`'s 4 pre-existing `accessibilityInvalid` assertions
(`:263,269,312,318`) required zero changes and pass unmodified, which is itself an external,
black-box confirmation of the equivalence (not just a source-reading argument).

**No regression to `TextField`'s other behavior.** `login-form.tsx` is the component's only
production consumer (`grep -rn "TextField" libs apps` outside tests/stories/e2e — one hit). Full
`@helsoft/components` suite (65/65) and Playwright suite (27/27) both green, covering every other
story/variant (`Filled`, `Outlined`, `WithIcons`, `Multiline`, `Disabled`) unaffected by this
change.

## No new code-quality issues in this round's changes
- No magic numbers, no duplication, no naming issues in `text-field.tsx`'s or
  `text-field.test.tsx`'s diff — the change is a one-line default-parameter derivation plus a
  named `inputProps` object for a documented compile-time reason.
- TDD discipline held: `tdd.md`'s "Full-review Round 2 fix" log matches what I independently
  reproduced — RED confirmed genuine, GREEN minimal, REFACTOR (the `inputProps` extraction) done
  only after green and only to replace an uglier double-spread, not new scope.
- No `console.*`/debugger/`TODO`/`FIXME`/`XXX` in any of the 5 touched files
  (`text-field.tsx`, `text-field.test.tsx`, `text-field.e2e.js`, `login-form.tsx`, `tdd.md`).
- Functional React, `TextFieldProps`/`LoginFormProps` types present, kebab-case filenames — all
  hold.
- Scope discipline: `git show --stat 4f47504` touches exactly `text-field.tsx`,
  `text-field.test.tsx` (new), `text-field.e2e.js`, `login-form.tsx` (2-line deletion), and
  `tdd.md` — no drive-by refactors, no untouched-scope files.

## @s → test traceability — re-verified across the whole feature, all 3 slices
All 9 tasks in `tasks.md` are `done`, `@s1`–`@s13` each map to ≥ 1 concrete test, cross-checked
against the actual current test files (not just doc claims):
- `@s1`/`@s7` — `auth.integration.test.ts`.
- `@s2` — `auth.dao.test.ts`, `auth.service.test.ts`, `use-auth.test.ts`,
  `login-form.test.tsx`, `auth.integration.test.ts`.
- `@s3` — `login-form.test.tsx`, `use-auth.test.ts`, `sign-in-form.test.tsx`.
- `@s4`/`@s10`/`@s11` — `sign-out.test.tsx`, `auth.dao.test.ts`, `auth.service.test.ts`,
  `use-auth.test.ts`, `auth.integration.test.ts`.
- `@s5`/`@s6` — `auth.service.test.ts`, `login-form.test.tsx`, `use-auth.test.ts`,
  `sign-in-form.test.tsx`, `auth.integration.test.ts`.
- `@s8` — `login-form.test.tsx`, `sign-in-form.test.tsx`.
- `@s9` — `auth.service.test.ts`, `login-form.test.tsx`, `sign-in-form.test.tsx`.
- `@s12` — `login-form.test.tsx` (roles/labels/error announcement) + Playwright e2e
  (`login-form.e2e.js`).
- `@s13` — `migration-coverage.test.ts`'s `describe.each(AUTH_COMPONENT_DIRS)` t()-key-existence
  block (covers both `sign-in-form` and `sign-out` directories; `task-8` closed the last gap —
  `sign-out.tsx`'s `auth.logOut*` keys — with the RED→GREEN log in `tdd.md:737-762`) plus the
  hardcoded-literal audit in the same file.

No gap, no scenario coverage weakened or removed by any round's fixes.

## Verdict
**APPROVED — zero findings.** The Round-2 fix is correct, minimally scoped, genuinely
TDD-driven (independently reproduced RED, not just read), and behavior-preserving where it
simplified `login-form.tsx`. A fresh full-feature pass across all 3 slices finds nothing new:
`@s1`–`@s13` traceability holds, no scope creep, no debug leftovers, all gates (lint, check-types,
test, Playwright e2e) green under my own independent run.
