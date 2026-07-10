# Review — login-and-logout (slice 2)

Mode: **slice** (tasks 6-7, "Empty + Error + Retry" — `@s5`, `@s6`, `@s8`, `@s9`). Reviewers: `reviewer_code`, `reviewer_design` only. No mutation this pass (slice mode).

## Verdict: APPROVED

Both reviewers approved with zero open findings (`review-code.md`, `review-design.md`), Round 3 of this slice's review loop.

## History (for traceability — nothing below is open)

- **Round 1** — 4 findings (1 major, 3 minor): `normalizeAuthError` over-classifying any `AuthApiError` as `invalid_credentials`; undocumented `passwordError` scope cut; `AuthApiError` leaking through the `@helsoft/services` production barrel; unchecked type assertion in `use-auth.ts`. All fixed by `implementator`, re-verified resolved in Round 2.
- **Round 2** — 2 new blockers surfaced by a fresh full pass: a permanent submit deadlock after one malformed-email attempt (`sign-in-form.tsx`/`login-form.tsx` — the field's error could never clear once set, since only the now-disabled submit button could re-run validation), and missing `auth.error.{email,invalidCredentials,network}` locale keys in all 4 bundles (real users would see raw key strings). Both fixed by `implementator`: an `onEmailChange` callback prop added to `LoginForm`, reactively re-validated in `SignInForm` once an error is showing; the 3 keys added with real, distinct, correctly-translated copy (English strings verified byte-identical to `gherkin-scenarios.md` @s5/@s6) across `en/es/de/pt`, backed by a new scoped regression guard in `migration-coverage.test.ts`.
- A **major** raised in Round 2 (`sign-in-form.tsx` calling `AuthService.isValidEmail` directly, Component→Service, skipping the Hook layer) was reviewed by `reviews_lead` and judged sanctioned by `.agents/rules/hooks-service-dao.mdc`'s documented "Direct Service Usage" exception (a synchronous, stateless pure validator has no React-specific need a hook would add) — not carried forward as a blocking slice-mode finding. `reviewer_code` independently sanity-checked this in Round 3 and agreed. Flagged for `reviewer_architecture`'s definitive call in the `full`-mode review at the end of the feature.
- **Round 3 (final)** — both reviewers ran a fresh full pass (not just a diff-of-the-fix check), confirmed both Round-2 blockers genuinely resolved end-to-end (traced state machine, edge cases: still-invalid re-edit, clearing back to empty), confirmed the exact required English copy, confirmed the new locale-coverage test is non-vacuous, confirmed the design surface change (`onEmailChange`) is purely an additive callback prop with zero visual/token/atomic-design impact. **Zero findings.**

## Flagged forward (not this slice's scope — for the end-of-feature full-mode review)
- `libs/study-buddy/src/components/sign-out/sign-out.tsx` references `auth.logOut`/`auth.logOutConfirm*` locale keys that also don't exist in any bundle — same class of bug as this slice's Round-2 Blocker 2, but this file predates Slice 2 and was never touched by task-6/task-7. Not required to fix here; `reviewer_architecture`/`reviewer_accessibility`/full-mode `reviewer_code` should pick this up.

## Verification (this slice)
`pnpm --filter @helsoft/services test` (37/37), `pnpm --filter @helsoft/hooks test` (20/20), `pnpm --filter @helsoft/components test` (44/44), `pnpm --filter @helsoft/study-buddy test` (23/23), `pnpm --filter @helsoft/localization test` (54/54), `pnpm turbo run check-types` (8/8), `pnpm lint`, `pnpm --filter @helsoft/components exec playwright test --reporter=list` (19/19) — all green.
