# Design review — login-and-logout (Slice 2, Round 3, FINAL — slice-mode cap)

**Verdict: APPROVED**

Scope: re-verification after `implementator` fixed `reviewer_code`'s 2 Round-2 blockers (`review.md`
findings 1-2): the submit-deadlock bug (`login-form.tsx`/`sign-in-form.tsx`) and the missing
`auth.error.*` locale keys (`libs/localization/src/resources/{en,es,de,pt}.ts`).

## Confirmed: only an additive callback prop touched the design-relevant surface

`git diff a99e2f3 -- libs/components/src/organisms/login-form/login-form.tsx
libs/components/src/organisms/login-form/login-form.test.tsx
libs/components/src/organisms/login-form/login-form.stories.tsx
libs/study-buddy/src/components/sign-in-form/sign-in-form.tsx` (shows the full uncommitted Slice-2
diff since the last commit, not just this round's delta) plus file mtimes:

- `login-form.stories.tsx` — mtime `13:48:19`, unchanged since before Round 2's `review-design.md`
  was written (`14:16:20`). Byte-identical to what Round 1/2 approved. `Empty`, `Content`, `Loading`,
  `Error`, `ErrorInlineValidation` still the full set, matching `spec.md`'s UI-states table.
- `login-form.tsx` — mtime `14:29:09` (touched after Round 2). The only change vs. the Round-2-reviewed
  state is: (1) a new optional `onEmailChange?: (email: string) => void` prop (`:39`, doc'd `:33-38`),
  (2) a local `handleEmailChange` that calls `setEmail` then `onEmailChange?.(value)` (`:69-72`), and
  (3) `TextField`'s `onChangeText={handleEmailChange}` replacing the bare `setEmail` (`:93`). No new
  JSX, no new `StyleSheet.create` rule, no changed prop on `Button`/`ProgressIndicator`/the error
  banner — `styles.form/submitRow/errorBanner/errorBannerText/visuallyHidden` (`:137-162`) are
  untouched. A callback prop carries no visual surface; nothing here changes the organism's rendered
  output for any existing story or consumer.
- `sign-in-form.tsx` — mtime `14:29:09` (touched after Round 2). Adds `handleEmailChange` (re-validates
  `emailError` via `AuthService.isValidEmail` once an error is already showing) and wires it to
  `LoginForm`'s new `onEmailChange`. Also swaps `t('auth.error.emailInvalid')`-shaped keys onto the
  newly-added `auth.error.{email,invalidCredentials,network}` locale keys. Wiring-layer logic only —
  no styling, no new component, no prop that reaches `LoginForm`'s render tree beyond the existing
  `errorMessage`/`emailError` (unchanged) plus the new callback.
- `login-form.test.tsx` — new tests cover the `onEmailChange` wiring and the deadlock-fix path
  (calls `onEmailChange` with the new value; submit re-enables once corrected). Test-only, no design
  impact; 25/25 green (see Checks run).

## Rubric re-check

- **Tokens only:** no new styles introduced by this round's fix; the pre-existing error-banner tokens
  (`theme.colors.errorContainer`/`onErrorContainer`, `theme.shape.card`, `theme.spacing.s3`,
  `theme.typography.bodyMedium`) are unchanged.
- **Reuse of existing components:** `TextField`'s pre-existing `error`/`supportingText` props
  (`molecules/text-field/text-field.tsx:12-13`) are still the only mechanism used — no bespoke
  validation UI added for the fix.
- **Atomic-design placement:** `LoginForm` stays a controlled, presentational organism — a new
  optional callback prop (mirroring the existing `onSubmit`/`onNavigateToSignUp` callback-prop
  pattern already on this same component) doesn't change its classification or its
  Component→Hook→Service→DAO-adjacent boundary; it's still `SignInForm` (the wiring layer) that owns
  `AuthService.isValidEmail` and locale lookups, not `LoginForm`.
- **4 UI states in Storybook:** unchanged file, all 5 stories (`Empty`/`Content`/`Loading`/`Error`/
  `ErrorInlineValidation`) still present and unaffected — confirmed this fix doesn't touch story-level
  behavior since `onEmailChange` is never passed in `login-form.stories.tsx`.
- **Visual/interaction consistency:** confirmed the premise in the brief — this is purely additive
  (a callback, no new visual surface). The submit-button disabled logic
  (`isSubmitting || isPristine || hasFieldError`, `:114`) is unchanged by this fix; only what clears
  `emailError` changed (now reactive on keystroke via the parent), which is behavior, not appearance.

## Checks run
- `git diff a99e2f3 -- login-form.tsx login-form.test.tsx login-form.stories.tsx sign-in-form.tsx`
  (full read) + `stat` mtimes to isolate this round's delta from earlier already-approved diff.
- Full read of current `login-form.tsx` — confirmed `styles` block byte-identical to Round 2.
- `grep -n "error\|supportingText" text-field.tsx` — confirmed `error`/`supportingText` are
  pre-existing `TextField` props, not new.
- `pnpm --filter @helsoft/components exec jest login-form.test.tsx` — 25/25 passed.

## Findings
None.

**Verdict: APPROVED** — the Round-2-to-Round-3 delta on the design-relevant surface is exactly the
additive `onEmailChange` callback prop (plus its locale-key sibling fix, out of this lens's scope,
also design-inert). No tokens, no new visual surface, no atomic-design reclassification, no
Storybook/story-coverage regression. Everything previously approved remains byte-identical.
