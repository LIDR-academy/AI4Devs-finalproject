# Review — login-and-logout (FULL mode)

## Verdict: APPROVED (Round 3, final)

Zero open findings. All 6 reviewers APPROVED with 0 findings in Round 3; `mutation_tester` PASS.
Nothing left to fix — this file holds no unresolved findings.

## Round history
- **Round 1** (full-feature cycle, run after all 3 vertical slices — happy path, error/empty/retry,
  i18n+a11y — were code-complete): 5 major + 3 minor + a mutation FAIL (6 killable survivors, all
  in never-before-tested Slice 2/3 code). All 8 fixed by `implementator`, commit `feb4204`.
- **Round 2**: all 8 Round-1 fixes independently re-verified as genuinely resolved (several via
  revert→confirm-RED→restore, not just diff-reading). One new major surfaced by `reviewer_design`'s
  fresh pass: the Round-1 fix had added `TextField.accessibilityInvalid` as an independent prop
  rather than deriving it from the component's own `error` prop (unlike every sibling component's
  established pattern), leaving `TextField`'s own `Error` story without `aria-invalid` on web.
  Fixed by `implementator`, commit `4f47504` (derives `accessibilityInvalid` from `error` by
  default, override-able; added `text-field.test.tsx`, which didn't exist before; extended
  `text-field.e2e.js`; simplified `login-form.tsx` to drop the now-redundant explicit props).
- **Round 3 (final)**: all 6 reviewers independently re-verified the Round-2 fix from scratch
  (including a deliberate adversarial revert of `text-field.tsx` while keeping the simplified
  `login-form.tsx`, to rule out the collateral change silently regressing the WCAG fix — it
  didn't), plus a fresh full pass across the whole feature. **Zero findings from any of the 6
  lenses.** `mutation_tester` independently re-ran Stryker and confirms 100% on the new derivation
  logic, `login-form.tsx` unaffected (96.30%, 2 pre-existing documented-equivalent survivors), and
  no regression on any previously-clean file.

## Verification (Round 3, aggregate)
`pnpm turbo run lint --force`, `pnpm turbo run check-types --force` (8/8), `pnpm turbo run test
--force` (6/6 workspaces: `@helsoft/services` 38/38, `@helsoft/hooks` 21/21, `@helsoft/components`
65/65, `@helsoft/study-buddy` 25/25, `@helsoft/localization` 55/55, `@helsoft/lib-with-storybook`
2/2), `pnpm --filter @helsoft/components exec playwright test --reporter=list` (29/29) — all green,
independently confirmed by every reviewer. Mutation: PASS (`docs/features/login-and-logout/mutation.md`).

## Notable, non-blocking observations (for visibility, not open findings)
- Multiple reviewers across Rounds 1–3 independently encountered and correctly disregarded
  transient tool-output/environment anomalies (a fabricated "system-reminder" falsely claiming a
  file had been silently modified; momentary stale reads of `git diff`/`git status` that
  self-resolved; stray untracked scratch directories from other reviewers' own temp debug
  harnesses). Every instance was cross-verified against ground truth (`git diff`/`git status`/
  direct file reads) before being disregarded or disclosed — no agent complied with or acted on any
  injected instruction, and no verdict was affected. The working tree is clean at the time of this
  writing (only the expected `docs/features/login-and-logout/*.md` review/task files are modified).
- `reviewer_security` (Round 2) noted one pre-existing, moderate `pnpm audit` advisory via Expo
  CLI's `xcode` build-tool dependency — predates this feature (present at the pre-feature base
  commit), not attributable to or actionable within `login-and-logout`'s scope.

## Superseded history
An earlier review cycle (`review-*-r2.md`/`-r3.md` files still on disk, and the very first
`mutation.md` content) only ever covered Slice 1 (5 of the 9 tasks), before Slices 2 and 3 existed —
confirmed by commit timestamps and by that cycle's own text. It closed `ESCALATE_MINORS`/`pr_ready`
prematurely for a Slice-1-only feature. Once Slices 2 and 3 were built, `tasks.md`'s `review_round`
was reset to 1 and this document reflects the real, complete full-feature review cycle described
above. Those older per-round files are left in place as a historical record but are no longer this
feature's live disposition.
