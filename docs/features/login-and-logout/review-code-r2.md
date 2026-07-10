# review-code — login-and-logout — Round 2

Scope: verification of Round-1 findings owned by `reviewer_code` (1, 5, 6) against commit
`7751666` ("fix(login-and-logout): resolve Round 1 review findings"), plus a fresh code-quality
pass over every file that commit touched.

**Verdict: APPROVED**

`pnpm turbo run check-types --filter=@helsoft/services --filter=@helsoft/hooks
--filter=@helsoft/components --filter=@helsoft/study-buddy --filter=app-study-buddy --force` — 7/7
green. `pnpm lint --force` — green (only `app-study-buddy` defines a `lint` script; the four
touched libs have none, consistent with pre-existing repo config, not something this commit
changed). `pnpm turbo run test --filter=@helsoft/services --filter=@helsoft/hooks
--filter=@helsoft/components --filter=@helsoft/study-buddy --force` — 4/4 packages, 86/86 tests
green, zero console noise in the run output.

---

## Round-1 findings — verified resolved

### Finding 1 (major) — `TextField.disabled` + accessibility state — RESOLVED
`libs/components/src/organisms/login-form/login-form.tsx:47-48` (email) and `:57-58` (password)
now pass `disabled={isSubmitting}` (routes through `TextField`'s own prop, which derives
`editable` **and** `opacity: theme.disabledOpacity` at
`libs/components/src/molecules/text-field/text-field.tsx:59,101`) plus an explicit
`accessibilityState={{ disabled: isSubmitting }}`, forwarded onto the underlying `TextInput` via
`TextField`'s `...rest` spread (`text-field.tsx:73`). Confirmed by reading the current file, not
just the diff.
Test strengthened as required:
`libs/components/src/organisms/login-form/login-form.test.tsx:51-61` now asserts
`editable === false` **and** `parent` style `opacity === disabledOpacity` (imported from
`theme/colors.ts:221`), and a new test at `login-form.test.tsx:65-70` asserts
`accessibilityState` equals `{ disabled: true }` on both fields. Both fail against the old
`editable={!isSubmitting}` prop (verified by reasoning through `TextField`'s implementation: the
old prop bypassed the `field` wrapper's `opacity` derivation and never touched
`accessibilityState`). All 9 `login-form.test.tsx` tests pass.

### Finding 5 (minor) — noisy `console.warn` in `auth.integration.test.ts` — RESOLVED
`libs/hooks/src/hooks/auth.integration.test.ts:20-44` now builds one `sharedClient` via a single
`beforeAll(() => initSupabase(...))` for the whole file instead of one per test — root-caused, not
papered over. `buildMockedClient()` (`:22-32`) only re-attaches the `onAuthStateChange` spy against
the shared client. A regression guard was added (`:117-121`) spying on `console.warn` and asserting
no captured message contains "Multiple GoTrueClient instances". Ran the suite directly
(`npx jest` in `libs/hooks`) and confirmed no warning noise printed and all 5 tests in this file
pass (14/14 in the package).

### Finding 6 (minor) — duplicated test-data factories — RESOLVED
New shared module `libs/study-buddy/src/test-utils/auth-test-factories.ts:10-23` exports
`authValue`/`localizationValue`. `libs/study-buddy/src/components/sign-in-form/sign-in-form.test.tsx:17`
and `libs/study-buddy/src/components/sign-out/sign-out.test.tsx:13` both import from it and no
longer declare their own copies (confirmed via `git show 7751666` diff — both local factory
declarations were deleted, only the import line added). `language-settings.test.tsx`'s
differently-shaped copy is untouched, matching the review's explicit scope note. 14/14
`@helsoft/study-buddy` tests pass.

---

## Fresh pass over commit `7751666` — no new blocker/major findings

Also re-verified (not this reviewer's Round-1 findings, but touched by the same commit, and design
peers were assigned #2/#3/#4): the `hitSlop`/`minHeight` changes in
`libs/components/src/atoms/button/button.tsx:26-39,92,94,109,123` are each covered by a new,
specific test in `libs/components/src/atoms/button/button.test.tsx:10-31` (one assertion per
behavior, no compound/vague assertions), TDD-shaped (a new file, each test pinned to the exact
regression it guards), no duplication, no magic numbers (`layout.touchTarget`, `HEIGHTS` reused,
not re-declared), and the `signingIn` live-region text
(`login-form.tsx:68-70`, `styles.visuallyHidden` at `:92-98`) flows through `labels`/`t()` like its
siblings — no hardcoded copy.

### Minor — stale doc comment left over from the Major-2 fix
`libs/components/src/organisms/login-form/login-form.tsx:28` —
```
/** testID for the Loading-state affordance (@s3) — a11y label lands with the Slice 3 a11y pass. */
export const LOADING_INDICATOR_TEST_ID = 'login-form-loading-indicator';
```
This comment predates this commit and says the a11y label is deferred to "the Slice 3 a11y pass."
That's no longer true: this same commit's Major-2 fix already added the accessibility signal (the
`accessibilityLiveRegion="polite"` `<Text>` at `login-form.tsx:68-70`, rendered inside this exact
`LOADING_INDICATOR_TEST_ID` wrapper) in Slice 1/Round-1, not Slice 3. Left as-is, the comment
misleads a future reader into thinking the Loading indicator still has an open a11y gap when it
doesn't. Low risk (doc-only, no behavior/test impact) — does not block approval, but should be
updated (e.g. drop the "a11y label lands with the Slice 3 a11y pass" clause, or replace with a note
pointing at the live-region `<Text>` a few lines below) the next time this file is touched.

No other new issues found: no `console.log`/debug leftovers, no orphan TODOs, all touched
components stay functional with `Props` types (`LoginFormProps`, `ButtonProps` unchanged in shape),
all touched filenames stay kebab-case (`auth-test-factories.ts`, `button.test.tsx`), and
`libs/hooks/package.json`'s new `@types/node` dep + `tsconfig.json` `"types": ["jest", "node"]`
mirror the identical, pre-existing pattern in `libs/localization/package.json:28` and
`libs/localization/tsconfig.json` — not a new/unjustified addition.

## Scenario coverage — no regression
Re-checked the full `@s → test` map against `gherkin-scenarios.md` and the current test files:
`@s1, @s2, @s3, @s4, @s7, @s9, @s10, @s11` (Slice-1 scope) each still map to ≥1 passing concrete
test; `@s3` gained two additional concrete tests this round (opacity/`accessibilityState`,
live-region announcement) rather than losing coverage. `@s5, @s6, @s8, @s12, @s13` remain correctly
out of scope (Slice 2/3, untouched by this commit).

## What's already solid (carried over, not re-litigated)
Everything noted "already solid" in `review.md` Round 1 stands; this commit did not touch layering,
security, or design-token usage in a way that changes those verdicts.
