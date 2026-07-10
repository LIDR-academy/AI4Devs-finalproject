# review-code.md — localization-i18n (reviewer_code)

## Verdict: APPROVED — Round 3 (final, per 3-round cap)

Round 2 (superseded, see `docs/features/localization-i18n/review.md` "Findings — Round 2" for full
detail) was `code: APPROVED` with one documentation-only minor; the consolidated blocker for the whole
feature that round was `reviewer_accessibility`'s major finding on the `radiogroup` container role.
`reviews_lead` issued one consolidated change request to `implementator`. This report judges that
response strictly from the code-quality / TDD-discipline lens (per `.agents/rules/tdd.md` and
`.agents/rules/review-standards.md` §1). Full technical background on the a11y finding itself belongs to
`reviewer_accessibility`; this report only judges whether the *response* was TDD-disciplined and clean.

## Scope of this round
`git diff HEAD` on the three files named in the task:
- `docs/features/localization-i18n/spec.md` — 2 lines changed (AC14 footnote + new **FO2** entry).
- `docs/features/localization-i18n/tdd.md` — one correction paragraph under Finding 1, one corrected
  `@s`-map row, and a new "Phase 6" section (~90 lines).
- `libs/components/src/molecules/language-selector/language-selector.test.tsx` — comment-only change on
  one test (9 insertions / 4 deletions, all in the `//` comment block above `it('exposes a radiogroup
  role for the container', ...)`).
- `libs/components/src/molecules/language-selector/language-selector.tsx` — confirmed **untouched**
  (`git diff` on it is empty; also confirmed no other file under `language-selector/` changed).
- `libs/components/src/molecules/radio-group/radio-group.tsx` — confirmed **untouched** (clean, per
  `git status --porcelain`), consistent with the change request's explicit scope boundary.

## 1. Was withholding production code the TDD-disciplined choice, or a dodge?

**Disciplined, not a dodge.** I independently re-derived the implementator's two technical claims against
the actual installed dependency source rather than taking `tdd.md`'s Phase 6 write-up on faith:

- **Claim A** (`getByRole('radiogroup')` throws today) — traced to
  `node_modules/.pnpm/@testing-library+react-native@14.0.1.../dist/queries/role.js:29`: `queryAllByRoleFn`
  gates every candidate on `isAccessibilityElement(item)` (the *item's own* `accessible` prop, or a
  built-in default for `Text`/`TextInput`/`Switch`) before matching role/name. The container `View` in
  `language-selector.tsx:38` sets no `accessible` prop, isn't one of those host types → `isAccessibilityElement`
  returns `false` → the container is never a byRole-matchable node today. Confirmed exactly as claimed.
- **Claim B** (adding `accessible={true}` to the container would pass RNTL's `getByRole('radiogroup')`
  *and* RNTL's `getAllByRole('radio')` would still find all 4 children, i.e. RNTL cannot detect the native
  iOS "container becomes an opaque leaf" trap) — traced to
  `.../dist/helpers/find-all.js:findAll` → `isHiddenFromAccessibility` → `isSubtreeInaccessible`
  (`.../dist/helpers/accessibility.js:53-82`), which only checks `aria-hidden`, `accessibilityElementsHidden`,
  `importantForAccessibility === 'no-hide-descendants'`, `display:none`, and an `accessibilityViewIsModal`
  sibling — **no branch inspects an ancestor's `accessible` prop**, confirming `tdd.md`'s central claim
  verbatim. This means a test asserting "children stay queryable after `accessible={true}`" would pass
  in Jest/RNTL regardless of whether iOS actually swallows them — exactly the false-confidence trap the
  round-2 request warned against, now empirically demonstrated rather than assumed.
- The two RN native-source citations (`ViewAccessibility.js` doc comment "By default, all the touchable
  elements are accessible", and `RCTViewComponentView.mm:398`:
  `self.accessibilityElement.isAccessibilityElement = newViewProps.accessible;`) were re-verified against
  the actual installed `react-native@0.86.0` package tree — both citations are accurate at the stated
  location, not fabricated or rounded up.

Given this, no test exists (and per the above, none can be *safely relied on* — a green RNTL assertion here
would not prove the real iOS behavior is unregressed) that legitimately demands the `accessible={true}`
change. Law 1 ("no production code except to make a failing test pass") therefore correctly forbids writing
it. This is the harder, more honest path — writing the "fix" and a passing RNTL test for it would have been
*less* work and would have looked like progress while shipping an unverified, plausibly-regressive change.
Declining to do that, and instead investigating three rejected alternatives
(`accessibilityLabelledBy`/`aria-labelledby`, `importantForAccessibility`, a Android-only
`Platform.OS`-scoped `accessible={true}` variant — rejected specifically for lack of a verification harness,
not on a hunch) before concluding, reads as genuine engineering, not corner-cutting.

## 2. Doc-only change quality

- **`spec.md:41`** (AC14 footnote) and **`spec.md:70`** (new **FO2**) — no fabricated claims found; every
  factual assertion in FO2 (root cause, why the naive fix is unsafe, why this repo's tooling can't verify a
  fix, that the pattern predates this feature in `radio-group.tsx:29`) matches what I independently
  re-verified above. FO2 is written with the same rigor and shape as the existing, human-approved **FO1**
  (`spec.md:69`) — both are single-paragraph, root-cause-explained, explicitly scoped as out of this
  feature, and both point at a concrete tracked location. Unlike FO1, FO2 carries no inline code `TODO`
  — correctly so per the round-2 request's own wording ("parallel *in spirit*" to FO1's tracked-follow-on
  *pattern*, not a literal requirement to plant a `// TODO(FO2)` comment); `tdd.md`'s Phase 6 explicitly
  says why one wasn't added, and I confirmed via `grep -rn "TODO(FO2)"` that none exists anywhere in the
  tree — no orphan TODO, no hidden one either.
- **`tdd.md`** — the "Correction" paragraph under Finding 1 (~line 278) is factually accurate (the original
  write-up did overclaim; the correction says so plainly without hedging) and the new Phase 6 section
  reads as an honest lab notebook: investigation → probe → decision → what remains true, each backed by a
  file:line citation I could re-check (and did).
- No `console.log`/`console.warn`/debug leftovers in any of the three changed files (`grep -n
  "console\.\(log\|debug\|warn\)"` across all three: zero matches).
- No leftover throwaway probe file: `find libs/components/src/molecules/language-selector -type f` lists
  only the pre-existing `language-selector.tsx`, `.stories.tsx`, `.test.tsx` — the "written, run, and
  deleted" probe test Phase 6 describes is genuinely gone, not accidentally committed.

## 3. Test-file diff is comment-only — confirmed

`git diff --stat` on `language-selector.test.tsx` reports `1 file changed, 9 insertions(+), 4 deletions(-)`,
and every changed line is inside the `//` comment block directly above
`it('exposes a radiogroup role for the container', ...)`
(`libs/components/src/molecules/language-selector/language-selector.test.tsx:75-85`). The test body itself
— `render(...)` and `expect(screen.getByLabelText('Choose a language').props.accessibilityRole).toBe('radiogroup')`
— is byte-identical before/after. No assertion was loosened, strengthened, or removed; no test was deleted
to dodge a red result. `pnpm test` for `@helsoft/components` (forced, no cache) still reports the exact same
17/17 passing as before this change — no test gained, none lost.

## 4. `@s3/@s4` mistag (round-2 minor) — correctly resolved

`docs/features/localization-i18n/tdd.md:342` (in the `@s → test` map) now reads
`| supplementary hardening (not tied to a single @s) | use-localization.test.tsx: 'falls back to the
fallback locale when i18n reports an unsupported language' — ... the real @s3/@s4 coverage is
detector/resolve-initial-locale.test.ts + provider/localization-provider.test.tsx as already listed in the
@s → test map above. |`, replacing the round-2 row that mis-tagged it as `@s3/@s4`. I checked the test body
(`libs/localization/src/hooks/use-localization.test.tsx:39-47`): it renders `LocalizationProvider` with
`initialLocale={'fr' as Locale}` (an out-of-set value forced directly at the hook boundary) and asserts the
consumer sees `en` — this is indeed a defense-in-depth guard on the hook's exposure, not an exercise of
device-locale auto-detection (`@s3`/`@s4`), so the re-tag is accurate, not just relabeled to look better.
The primary `@s3`/`@s4` map entries (`tdd.md:21-22`) were already correctly pointing at
`detector/resolve-initial-locale.test.ts` and `provider/localization-provider.test.tsx` and are untouched —
no real coverage gap was ever hidden by the original mistag, and none is hidden now.

## 5. Gates — re-run independently this round (forced where the changed files are involved)

| Check | Result |
|---|---|
| `pnpm check-types` | green, 8/8 packages |
| `pnpm lint` | green (only `app-study-buddy` defines a `lint` script; pre-existing, not a regression) |
| `pnpm turbo run test --filter=@helsoft/components --force` | green, no cache — 2 suites, **17/17** |
| `pnpm test` (all workspaces) | green — localization 52, components 17, study-buddy 7, services 13, hooks 4, lib-with-storybook 2 = **95/95**, matching Phase 6's own claimed count exactly, no regression from Phase 5's 95 |

## Findings

### Blocker — none
### Major — none
### Minor — none new this round

No new code-quality/TDD-discipline finding. The one open item from this lens's perspective — that AC14's
group-role gap for native assistive tech remains unresolved in the *product* sense — is an accessibility
finding, not a code-quality/TDD one, and is honestly tracked (FO2) rather than silently dropped, which is
exactly what this lens requires. Round 2's single doc-only minor (`@s3/@s4` mistag) is resolved (§4 above)
and not re-raised.

## Verdict

**APPROVED.**

From the code-quality/TDD-discipline lens: the implementator's response to the round-2 change request was
the TDD-correct move — no test can safely demand the `accessible={true}` change (verified independently,
not taken on faith), so no production code was written, per Law 1. The documentation trail (FO2, the AC14
footnote, the test comment correction, the Phase 6 investigation log) is accurate, non-fabricated, and
traceable to file:line citations that I independently re-checked against the actual installed
`react-native@0.86.0` and `@testing-library/react-native@14.0.1` source. The test-file change is
comment-only — no assertion touched, no test weakened or deleted. The round-2 `@s3/@s4` doc-nit is
correctly resolved. All gates are green with no regression (95/95 tests). Whether this constitutes full
closure of the underlying accessibility gap is `reviewer_accessibility`'s call for this round, not this
lens's.
