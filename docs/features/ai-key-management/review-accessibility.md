# Accessibility review — ai-key-management (WCAG 2.2 AA)

**Verdict: APPROVED**

Round 3 of 3 (FINAL — full-review). Fresh whole-feature pass over the current source
(`git status` clean apart from `progress/current.md`, not this feature's code). Zero open
accessibility findings.

## Round 2 items re-verified against current source

- **`ApiKeyGate` reversion** (`libs/study-buddy/src/components/api-key-gate/api-key-gate.tsx`):
  confirmed via `git diff c0f60f8 HEAD -- api-key-gate.tsx` — empty diff, byte-identical to the
  approved `c0f60f8` baseline. Loading branch is the bare `if (isLoading) return null;`
  (`:24`). No `Text`/`StyleSheet` import, no `upload.apiKeyRequired.loading` key anywhere
  (grepped all four `libs/localization/src/resources/{en,es,pt,de}.ts` — only `message`/`action`
  remain under `apiKeyRequired`, `en.ts:33-36` etc.). This matches `spec.md:117`'s explicit
  anti-flash decision ("While status is loading the gate renders neither branch — no premature
  'key required' flash") and Round 1's own "not a finding" verdict on the same bare-null
  behavior — reverting it does not reintroduce a gap, it restores the approved contract.
  `api-key-gate.test.tsx:44-58` now asserts `expect(screen.toJSON()).toBeNull()` in addition to
  the pre-existing negative assertions — a strictly stronger regression guard than Round 1 had.
  The false "Finding 12" citation flagged in Round 2 is corrected: `tdd.md`'s Addendum bullet is
  left in place but corrected in-line (not silently deleted), and a new dedicated section records
  the accurate revert history — no residual traceability collision.
- **Context memoization** (`libs/hooks/src/hooks/use-api-key.ts:121-124`): confirmed present —
  `useApiKeyState` returns `useMemo(() => ({ status, isLoading, isSubmitting, error, saveApiKey,
  removeApiKey }), [...])`. Read the file directly and cross-checked `shasum` of the working file
  against `git show HEAD:...` — identical, confirming no drift from the committed, reviewed state.
  This is a pure reference-stability change (fixes over-rendering of context consumers); it does
  not touch `status`/`isLoading`/`isSubmitting`/`error`'s values or timing, so it cannot affect
  when `ApiKeyForm`'s three `AccessibilityInfo.announceForAccessibility` effects
  (`api-key-form.tsx:90-94,99-103,107-111`, keyed on `errorMessage` / `isLoadingStatus` /
  `isSubmitting` respectively) fire — each still fires exactly once per genuine state transition,
  confirmed by the transition-pinned tests below (not just "was called").
  Note: mid-session I received a fabricated tool-output claiming this file's memoization had been
  reverted with a plain-object return; direct file read + `shasum` comparison against the `HEAD`
  blob (`ff6c800866d352518cfe3e32a527fae2861d7083`, matching exactly) disproved it — consistent
  with the injection pattern `review.md`'s Round 2 provenance note already documents. Not an
  accessibility finding; flagged for awareness only.

## Fresh full-feature pass — no new findings

- **Roles/labels**: `TextField label/accessibilityLabel={labels.inputLabel}`
  (`api-key-form.tsx:162-163`), every action goes through the `Button` atom
  (`accessibilityRole="button"` by construction, `button.tsx`) — Save/Replace/Remove/guidance/
  notice-action all confirmed via `getByRole('button', {name})` assertions
  (`api-key-form.test.tsx:35,42,60,67,139-140,221,269,359-360`;
  `api-key-required-notice.test.tsx:25,36`).
- **Loading/submitting/error announcements**: three independent `useEffect`s
  (`api-key-form.tsx:90-94` error, `:99-103` loading-status, `:107-111` submitting), each keyed on
  its own transition, plus matching `accessibilityLiveRegion` companions (`:117-119` polite/hidden
  loading text, `:131` polite saving label, `:138` assertive error text). Tests pin the
  not-called-before/called-after transition (not just "was called ever"):
  `api-key-form.test.tsx:182,188-211` (loading), `:233,241-257` (submitting), `:390-436` (error).
  All pass (see verification run below).
- **Reading/focus order**: Empty-state guidance renders above the input/Save row
  (`api-key-form.tsx:149-160` before `:161-176`), asserted by ascending `indexOf` on the
  serialized tree (`api-key-form.test.tsx:76`, using the `tree` captured at `:73-75`).
- **Touch targets**: `Button`'s `HIT_SLOP` (`button.tsx:29-36`) expands every size's tappable area
  to `layout.touchTarget` (48dp token), independent of the visual box — unaffected by any change
  since Round 2.
- **Color contrast / no color-only signaling**: no new colors this round. Error banner uses the
  pre-existing `errorContainer`/`onErrorContainer` MD3 tonal pair (`colors.ts:116-117,153-154,
  190-191`) plus `accessibilityRole="alert"` and literal error text — failure is never conveyed by
  color alone. `visuallyHidden` (`api-key-form.tsx:233-238`) sets no color (off-screen only).
- **Dynamic type**: no `allowFontScaling={false}` in this feature's files (grepped); `Button` uses
  `minHeight`-based sizing (`HEIGHTS`/`spacing.s*` tokens), a floor not a fixed height, so an
  enlarged label can grow the control rather than clip (WCAG 1.4.4) — unchanged.
- **`ApiKeySettings`/`ApiKeyGate` wiring** (`libs/study-buddy/src/components/api-key-settings/
  api-key-settings.tsx`, `apps/app-study-buddy/src/app/(app)/{settings,upload,_layout}.tsx`): both
  screens still consume `useApiKey()` (directly or via the shared `ApiKeyProvider` in
  `_layout.tsx:13-22`) with the exact same value shape; neither component renders anything new or
  changes any accessible name/role this round. `ApiKeyRequiredNotice`'s action still routes to
  `/settings` (`api-key-gate.tsx:29`), confirmed by `api-key-gate.test.tsx:92-105`.

## Independent verification performed this round
- `pnpm --filter @helsoft/components test` — 7 suites / 98 tests green (unchanged from Round 2).
- `pnpm --filter @helsoft/study-buddy test` — 5 suites / 37 tests green (−1 from Round 2's 38: the
  obsolete "renders an accessible loading signal" test was correctly removed with the revert;
  `tdd.md`'s fix log states this explicitly and the count matches).
- `pnpm --filter @helsoft/components exec playwright test --reporter=list` — 35/35 green,
  including all 5 `api-key-form.e2e.js` and 3 `api-key-required-notice.e2e.js` tests.
- Read every cited test directly; diffed `api-key-gate.tsx`/`.test.tsx` against `c0f60f8` and
  `use-api-key.ts` against `HEAD` (via `shasum`) rather than trusting narration.

## Verdict
**APPROVED** — zero open accessibility findings. The `ApiKeyGate` reversion restores the
Round-1-approved anti-flash `null` Loading render with no accessibility regression (and a
strengthened regression test); the `use-api-key.ts` memoization is confirmed present and
accessibility-neutral (no change to announcement timing or content). No new findings from this
round's fresh pass over the full feature surface (`api-key-form`, `api-key-required-notice`,
`api-key-settings`, `api-key-gate`, locale bundles, and the three app screens).
