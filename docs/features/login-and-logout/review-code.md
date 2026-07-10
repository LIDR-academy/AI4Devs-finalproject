# reviewer_code — login-and-logout — Slice 2 (tasks 6-7) — Round 3 (FINAL)

APPROVED

Scope: fresh full pass against `git diff a99e2f3` for
`libs/components/src/organisms/login-form/login-form.{tsx,test.tsx}`,
`libs/study-buddy/src/components/sign-in-form/sign-in-form.{tsx,test.tsx}`,
`libs/localization/src/resources/{en,es,de,pt}.ts`,
`libs/localization/src/coverage/migration-coverage.test.ts` — verifying the 2 blockers from Round
2 are genuinely resolved, plus a fresh rubric pass for anything else that regressed.

Verified green (forced, non-cached): `pnpm --filter @helsoft/components test` (44/44),
`pnpm --filter @helsoft/study-buddy test` (23/23), `pnpm --filter @helsoft/localization test`
(54/54, up from 52/52 per `tdd.md`), `pnpm turbo run check-types --force` (8/8 packages),
`pnpm lint --force` (green).

## Round-2 blockers — verification

### Blocker 1 (was blocker) — permanent submit deadlock after a malformed-email attempt (@s9) — RESOLVED
Traced the full state machine, not just the diff:
- `login-form.tsx:64-72,114`: `isPristine` (blank-field gate) is computed independently of
  `emailError`/`passwordError`; `hasFieldError` gates submit separately. `handleEmailChange`
  (`:69-72`) updates local `email` state **and** forwards every keystroke via the new
  `onEmailChange` prop — this is what breaks the deadlock (previously nothing re-ran validation
  once the submit button that would have re-run it was itself disabled).
- `sign-in-form.tsx:53-56`: `handleEmailChange` only re-validates `if (!emailError)` is false
  (i.e., once an error already exists), keeping @s9's "attempt to submit" first-pass semantics
  intact (no premature validation while the user is still typing a first attempt) while making
  correction-then-clear reactive from that point on.
- Traced end-to-end: submit with `'not-an-email'` → `handleSubmit` sets `emailError`, returns
  early, `signIn` not called (`sign-in-form.test.tsx:84-104`) → user types
  `'user@example.com'` → `onEmailChange` fires → `isValidEmail` true → `emailError` cleared →
  submit re-enabled → press again → `signIn('user@example.com', 'secret1')` called
  (`sign-in-form.test.tsx:105-129`). Confirmed this is a real assertion chain, not a shallow one:
  it asserts the error text present, `signIn` not called, then error text gone + button enabled,
  then `signIn` called with the corrected value — the exact "bad → error → fix → clear →
  resubmit → called" path requested.
- Still-invalid edit case: typing a second, different invalid value while `emailError` is set
  re-runs `isValidEmail` (false) and re-sets the same message — verified this does not clear
  prematurely.
- Edge case checked (not itself a blocker, noting for the record): if the user clears the email
  back to **empty** after an error was shown, `handleEmailChange` still re-validates (`!emailError`
  is false) and `AuthService.isValidEmail('')` is `false`, so `emailError` is set again rather than
  cleared — the email field's inline message stays visible on an empty field, even though
  `isPristine` (computed independently in `login-form.tsx:65`) correctly keeps submit disabled
  either way. No scenario (`@s8`/`@s9`) actually specifies this exact path (`@s8`'s "pristine"
  wording is about a form that was never touched, not one that was touched then cleared), the
  submit-disabled invariant holds regardless, and the message itself remains literally accurate
  (an empty string is not a valid email) — so this is a cosmetic observation, not a defect, and
  does not block.
- `login-form.test.tsx:150-162` (`onEmailChange` called with new value) and
  `sign-in-form.test.tsx:84-129` are real, non-vacuous tests — confirmed by reading the assertions
  directly, not just `tdd.md`'s account.

### Blocker 2 (was blocker) — missing `auth.error.*` locale keys (@s5, @s6, @s9) — RESOLVED
- All 4 bundles (`en.ts:53-57`, `es.ts`, `de.ts`, `pt.ts`) now define `auth.error.{email,
  invalidCredentials, network}` with real, distinct, non-English-echoing translations in
  `es`/`de`/`pt` (spot-checked: `de` "E-Mail oder Passwort ungültig"/"Netzwerkfehler", `es`
  "Correo electrónico o contraseña incorrectos"/"Error de red", `pt` "E-mail ou senha
  inválidos"/"Erro de rede").
- Exact required strings confirmed: `en.ts` `invalidCredentials` = **"Invalid email or
  password"** and `network` = **"Network error"** — byte-identical to `gherkin-scenarios.md`
  @s5/@s6 and `spec.md`'s error-contract table.
- `es`/`de`/`pt` are typed as `TranslationResource = typeof en` (`en.ts:69`), so a missing key in
  any bundle would fail `check-types`, not just a test — confirmed 8/8 packages green.
- New guard (`migration-coverage.test.ts:100-119`) is sound: scans `sign-in-form.tsx` for any
  quoted dotted literal (catches both direct `t('auth.error.email')` calls and the
  `AUTH_ERROR_KEYS` lookup-map's literal values later passed to `t(variable)`), flattens the real
  `en.translation` object, and asserts every referenced key resolves. It's not trivially-passing:
  it asserts `referencedKeys.length > 0` (fails loudly instead of vacuously passing if the scan
  finds nothing) and a second test pins the regex/flatten helpers against a known-missing key.
  `tdd.md` records reverting just the locale addition and getting a real RED (2/4 tests failing,
  reporting the exact 3 missing keys) before restoring — a genuine regression guard, not a
  rubber-stamp.
- Scope is appropriately narrow: limited to `sign-in-form.tsx`'s own directory, not a lib-wide
  sweep — correctly justified (a wider sweep would need to separately resolve `sign-out.tsx`'s own
  pre-existing gap, see below), not "narrow to the point of useless" since it exactly covers every
  place this exact regression could recur.

## Pre-existing, explicitly out-of-scope for this slice (flagging forward, not blocking)
`libs/study-buddy/src/components/sign-out/sign-out.tsx` references `auth.logOut` /
`auth.logOutConfirm*` keys that also don't exist in any locale bundle — same class of bug as
Blocker 2, but this file was never touched by Slice-2 work (predates it, per `tdd.md`'s own note)
and is outside task-6/task-7's scope. Not required to fix in this slice-mode round; recommend the
full-mode review (all 6 reviewers, end of feature) treat it as its own finding.

## Sanity-checked, not re-raised (per explicit brief)
`sign-in-form.tsx:5,44,55` calling `AuthService.isValidEmail` directly (Component → Service,
skipping the hook layer) — confirmed this fits `.agents/rules/hooks-service-dao.mdc`'s documented
"Direct Service Usage" exception ("Components can also use services directly... when
React-specific features aren't needed"): `isValidEmail` is a pure, synchronous, stateless
predicate with no async/loading/error state to manage, so there is no React-specific need a hook
would add. Not carried forward as a finding, per `reviews_lead`'s Round-2 disposition.

## Rest of rubric — no regressions
- TDD discipline: `tdd.md`'s "Slice 2, Round 2 review fixes" section documents genuine RED (fix
  reverted, exact failure reproduced) → GREEN → refactor-not-needed for both blockers; matches
  what's actually in the diff.
- No scope creep: both fixes are exactly sized to their findings (one prop + one handler per
  side for Blocker 1; 3 locale keys × 4 bundles + one scoped coverage test for Blocker 2). No
  drive-by changes to Slice 1/3 files.
- No `console.log`/`debugger`/orphan `TODO`/`FIXME` in any touched file (grepped, zero hits).
- Functional React throughout, `Props` types present and updated (`LoginFormProps` gained 4
  documented optional props), kebab-case filenames unchanged, no magic numbers introduced.
- `@s5, @s6, @s8, @s9` traceability: each maps to ≥1 concrete, non-vacuous test in
  `login-form.test.tsx` and/or `sign-in-form.test.tsx`; no coverage lost from Round 2.

No blocker, major, or minor findings remain open for `reviewer_code`.
