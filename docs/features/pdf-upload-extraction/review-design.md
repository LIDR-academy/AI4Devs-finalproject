APPROVED

## Scope
FULL-mode design-system review, round 2 (the hard cap — no round 3), of `pdf-upload-extraction`,
base `0dfc914` through `HEAD` (`904d06e`). Round 1 (`00cbca3`) returned zero design findings; this
pass re-reads everything touched since, with special focus on the shared `Button` atom's new
keyboard-focus state layer (commit `2073e65`) and the `pdf-upload-panel.tsx` N5 accessible-grouping
fix in the same commit. Full diff inspected: `git diff 00cbca3..HEAD --stat` (29 files) plus the
full current contents of every touched component/test/story file. Locked decisions from the task
brief (Deno-mirror boundary, local-only RLS exclusion, no `db push`/`functions deploy`, AGPL mupdf,
AC7/@s7 wording tension, retry-suppression design, analytics as first-of-its-kind) are not
re-litigated.

## 1. `Button` atom's new focus state layer — tokens and MD3 precedent
`button.tsx:76-88` adds `focus` to the existing `stateOpacity` `useMemo`, reading
`theme.stateLayerOpacity.focus` — a **pre-existing** token (`libs/components/src/theme/
colors.ts:213-218`, value `0.12`, defined since the initial MD3 theme commit `913e38b`, never
touched by this feature) that was simply unread until now. No new color/opacity/spacing literal
introduced anywhere in `button.tsx`, `state-layer.tsx`, or `use-interaction-state.ts`.

Precedence (`button.tsx:80-86`: `press > focus > hover`) is a direct, consistent extension of the
single-highest-priority-wins model this codebase already established for `press`/`hover` before
this feature touched the file — not a deviation into MD3's "additive" state-layer stacking model,
which this codebase never implemented for hover/press either. Extending the same local convention
rather than inventing a new blending model is the right call for consistency.

`state-layer.tsx`'s only change is an additive, optional `testID` prop (`:6-9,16`) forwarded to the
underlying `View` — no visual/style change, test-only surface.

`use-interaction-state.ts`'s `focus`/`onFocus`/`onBlur` addition (`:6-8,14-15,24,29,38-39`) is
additive to the existing `hover`/`press` shape; wiring is correct — `Button` spreads
`{...handlers}` (`button.tsx:104`) onto its `Pressable`, so `onFocus`/`onBlur` reach the native
element the same way `onHoverIn`/`onPressIn` already do. Independently re-ran
`pnpm --filter @helsoft/components exec jest src/atoms/button` — 3/3 tests green, including the two
new focus-wash assertions.

## 2. `button.stories.tsx` — checked for staleness, not a finding
`button.stories.tsx` was **not** touched by this feature (absent from `git diff 00cbca3..HEAD
--stat`) and has no story demonstrating `hover`/`press`/`focus` interaction washes — only static
variant/size/disabled permutations. Checked whether this is a regression in Storybook coverage
against the atom's actual states: it is not. Every other atom that consumes the same
`useInteractionState` + `StateLayer` pair — `fab.stories.tsx`, `chip.stories.tsx`,
`icon-button.stories.tsx`, `card.stories.tsx` — has the identical characteristic: none demonstrate
their hover/press wash in Storybook either (verified by reading all four). This is the established,
codebase-wide convention for this class of ephemeral pointer/focus visual, not something this
feature's fix made newly stale. Flagging `Button` alone for it would be inconsistent with every
sibling atom of the same shape, so this is not raised as a finding.

## 3. `pdf-upload-panel.tsx` N5 fix — no ad-hoc styling, correct a11y technique
`pdf-upload-panel.tsx:113,117,121-125` adds `accessible` + a composed `accessibilityLabel` to the
three existing `summaryRow` `View`s — zero changes to the `StyleSheet.create` block
(`:146-188` is identical to round 1: `theme.spacing.s3`/`s4`, `theme.typography.bodyMedium`,
`theme.colors.onSurface`/`onSurfaceVariant`, `theme.shape.card`, all pre-existing tokens, still the
only styling in the file). `accessible`/`accessibilityLabel` are accessibility props, not layout/
visual props — this fix introduces no new dimension, color, or typography value anywhere. The
label/value row shape itself (`summaryRow`, `justifyContent: 'space-between'`) is unchanged from
round 1, still matching `language-selector.tsx`'s pre-existing label/value-row pattern (re-verified
present). Grouping child `Text` nodes under one `accessible` parent with a composed label is a
correct, standard RN accessibility technique — no prior sibling in this codebase does exactly this
(the closest precedent, `language-selector.tsx`, groups a radiogroup, not a label/value pair), but
it is not a novel *design* element (no new atom/molecule, no new token), so it doesn't need a
sibling precedent to pass this rubric.

## 4. Atomic-design placement, 4 states + 2 error sub-cases, sibling consistency — re-confirmed fresh
- `PdfUploadPanel` (`libs/components/src/organisms/pdf-upload-panel/pdf-upload-panel.tsx`) is still
  presentational (props-driven, no hooks/services), composing only `Card`/`Button`/
  `ProgressIndicator` (`:5-7,94,96,104,129,138`) — organism placement holds.
  `PdfUpload` (feature wiring, `libs/study-buddy/src/components/pdf-upload/pdf-upload.tsx`) and the
  `upload.tsx` screen are unchanged in shape from round 1 (only new `imageCountAnnouncement`/typed
  `stageToPanelState` additions, both logic not placement).
- `pdf-upload-panel.stories.tsx` still has all 4 states (`Empty`/`Loading`/`Content`) plus both
  Error sub-cases (`ErrorRetryable`/`ErrorNonRetryable`) plus `InteractiveRetry` — file content
  unchanged since round 1 (confirmed by reading it in full; not present in the `00cbca3..HEAD` diff
  stat). `pdf-upload-panel.test.tsx` gained 5 new tests this round (N5's 3 label-grouping tests +
  2 mutation-kill `it.each` absence-guards, `:105-297,297-332`) — additive, no state removed or
  weakened.
- `login-form.tsx` itself has an **empty diff** since round 1 (`git diff 00cbca3..HEAD --
  libs/components/src/organisms/login-form` produced no output) — the only path by which it could
  be affected is transitively, through the shared `Button` atom. Re-ran
  `pnpm --filter @helsoft/components exec jest src/organisms/login-form src/organisms/pdf-upload-panel
  src/atoms/button` directly: **74/74 tests green** across all three suites, confirming the
  additive `focus` change doesn't regress `login-form.tsx`'s rendering or behavior. `tdd.md`'s
  documented fix-cycle log independently corroborates this at the e2e layer (34/34 Playwright specs
  green post-fix, explicitly including `login-form.e2e.js` as a stated regression check).

## 5. e2e — not re-run live this round
`lsof -i :6007` showed the port already bound to another process (a concurrent worktree's
Storybook dev server, the same class of collision documented in `tdd.md`'s Slice-3 and round-1
fix-cycle sections). `libs/components/playwright.config.js` hardcodes `baseURL`/`webServer.url` to
port 6007 with no environment-variable override — pointing it elsewhere would require editing the
config file, which a reviewer must not do. Relied instead on (a) `tdd.md`'s documented run log for
this exact fix cycle (34/34 Playwright specs green, non-interactive `--reporter=list`, throwaway
port 6017, config confirmed reverted byte-for-byte afterward) and (b) my own fresh, independent
`jest` re-run of the three directly-relevant suites (§4 above, 74/74 green) as a second, live
confirmation this round.

## Verdict
APPROVED — zero findings. The `Button` atom's new focus state layer reads only a pre-existing
token (`theme.stateLayerOpacity.focus`) and extends the codebase's already-established
single-priority state-layer model consistently; `button.stories.tsx`'s lack of an interactive-state
story is checked and found to match every sibling atom of the same shape, not a regression this fix
introduced. The `pdf-upload-panel.tsx` N5 fix adds accessibility grouping with zero new styling
values. Atomic-design placement, all 4 UI states + both Error sub-cases in Storybook, and
consistency with `login-form.tsx`/`sign-in-form.tsx`/`login.tsx` all re-confirmed fresh, with
`login-form.tsx` independently verified unregressed by the shared `Button` change (74/74 tests
green, plus the fix cycle's own e2e log).
