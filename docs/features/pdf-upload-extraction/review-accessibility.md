---
feature: pdf-upload-extraction
reviewer: reviewer_accessibility
round: 2 (of 2-round hard cap, full-feature pass)
scope: 0dfc914..904d06e (all 3 slices + round-1 fix cycle 2073e65 + docs commit 904d06e)
---

# review-accessibility.md — pdf-upload-extraction (full-feature, round 2 — FINAL)

## Verdict: APPROVED

Zero findings. Both round-1 items independently re-verified as genuinely resolved from source
(not taken on `tdd.md`'s word), including a real cross-worktree regression check of the
already-shipped `login-form.tsx` consumer of the touched shared atom. Everything else in the
rubric re-confirmed from the current diff, not carried forward on trust.

---

## N5 — RESOLVED

`libs/components/src/organisms/pdf-upload-panel/pdf-upload-panel.tsx:113-128` — each of the three
Content-state summary rows is now a single `View` with `accessible` + a composed
`accessibilityLabel`, wrapping the same two visual `<Text>` children as before:

```tsx
<View style={styles.summaryRow} accessible accessibilityLabel={`${labels.filenameLabel}: ${filename}`}>
  <Text style={styles.summaryLabel}>{labels.filenameLabel}</Text>
  <Text style={styles.summaryValue}>{filename}</Text>
</View>
```
(`:117` pageCount row, same shape; `:121-125` imageCount row uses
`imageCountAnnouncement ?? `${labels.imageCountLabel}: ${imageCount}``.)

This is the correct fix, not a superficial one:
- `accessible` on the parent `View` collapses its `Text` children into one accessibility-tree node
  (RN's documented behavior) — a screen reader now announces one "File: notes.pdf" stop, one
  "Pages: 12" stop, one image-count stop = **3 coherent announcements**, not the round-1-flagged 6
  disconnected fragments. WCAG 1.3.1 (Info and Relationships) satisfied: the label→value
  relationship is now programmatic, not just visual/DOM adjacency.
- The visual `<Text>` nodes are untouched (same styles, same rendered text) — `accessible` only
  changes what the accessibility tree exposes, so nothing is hidden from sighted users. Confirmed
  by direct read, not assumed.
- The image-count row wires a real, locale-complete pluralized announcement
  (`libs/study-buddy/src/components/pdf-upload/pdf-upload.tsx:96`:
  `imageCountAnnouncement={result ? t('upload.imageCount', { count: result.imageCount }) : undefined}`)
  — the `upload.imageCount_one`/`_other` i18n keys `tdd.md` had built ahead of time and left
  unwired are now actually consumed, in all 4 locales (`libs/localization/src/resources/{en,es,pt,de}.ts:35-36/41-42`,
  each with a distinct singular/plural string), and `i18n.test.ts:70-71` asserts the correct plural
  form is selected per locale/count. `imageCountAnnouncement` is optional and falls back to the
  same composed `"{label}: {value}"` form when omitted — no silent regression to a blank label.

**Test verification (real assertions, not presence-only)** —
`libs/components/src/organisms/pdf-upload-panel/pdf-upload-panel.test.tsx:108-115`:
`getByLabelText('File: notes.pdf')`, `getByLabelText('Pages: 12')`; `:119-133`:
`getByLabelText('3 images extracted')` for the explicit-announcement case; `:137-143`:
`getByLabelText('Images: 3')` for the fallback case. These assert the exact composed label
content via RN Testing Library's `getByLabelText` (which queries `accessibilityLabel`), not just
`toBeTruthy()` on an unrelated query — a mutant that reverted to two bare `<Text>` siblings would
fail every one of these. Also independently confirmed the wiring-layer test
(`libs/study-buddy/src/components/pdf-upload/pdf-upload.test.tsx:147-161`) asserts
`t` was called with `('upload.imageCount', { count: 2 })` and the rendered label reflects it.

## N6 — RESOLVED, login-form confirmed NOT regressed

`libs/hooks/src/hooks/use-interaction-state.ts:6-16,24,38-39` adds a genuine third `focus` boolean
state, toggled by new `onFocus`/`onBlur` handlers, additive to the existing `hover`/`press` shape
(no consumer's destructuring breaks — verified every consumer: `button.tsx`, `card.tsx`,
`fab.tsx`, `chip.tsx`, `icon-button.tsx` all still destructure only the fields they used before;
none of them break by the hook returning two new fields).

`libs/components/src/atoms/button/button.tsx:59,75-88` reads `focus` and computes
`stateOpacity` with precedence `press > focus > hover`, reading the previously-defined-but-unread
`theme.stateLayerOpacity.focus` (`0.12`, `libs/components/src/theme/colors.ts:215` — file itself
untouched by this diff, `git diff 0dfc914..HEAD -- .../theme/colors.ts` empty, so no contrast
values changed). The wash renders via `StateLayer` (`:107`), which is JSX-ordered *before* the
icon/label (`:108-114`) — meaning it paints underneath the label text, exactly as it already did
for hover/press — so the round-1-verified text contrast ratios (8.35:1–15.83:1 for summary text,
10.57:1/8.38:1 for button labels) are unaffected by this change; re-confirmed no diff touched any
color token.

**Cross-platform reality-check (not just "it compiles"):** I read the installed React Native
0.86 source directly rather than assume. `Pressable.js` forwards `onFocus`/`onBlur` straight into
`Pressability`'s `config` (`Pressable.js:201-202,274-275`), and `Pressability.js:433-443` calls
those callbacks directly off the native `View`'s own `onFocus`/`onBlur` — the same native-view-level
focus event RN uses for hardware-keyboard Tab navigation, D-pad/TV-remote navigation, and (on the
web target, via `react-native-web`) real DOM `focus`/`blur`. This is not a web-only shim riding on
`:focus-visible` CSS — it is one native RN event, listened to identically on all three platforms.
`libs/hooks/src/hooks/use-interaction-state.test.ts:61-71` and
`libs/components/src/atoms/button/button.test.tsx:42-68` both drive this through `fireEvent(el,
'focus'/'blur')`, and both pass.

**Judgment call — mouse-click-acquired focus is not a WCAG violation.** On the web target,
clicking a `Button` with a mouse *will* set real DOM focus on the underlying focusable element,
which means the new focus wash can remain visible after a mouse click until the element blurs
(unlike a `:focus-visible`-gated implementation, which suppresses this for pointer-acquired focus).
This is a genuine, real behavior difference worth naming explicitly, but it is **not** a WCAG 2.4.7
failure: 2.4.7 requires that *keyboard* focus produce a visible indicator; it does not forbid also
showing that indicator when focus is acquired by other means. It is also consistent with this
project's own MD3 state-layer convention already shipped for `hover`/`press` — those washes,
too, activate identically regardless of *why* the interaction state became true. On native
iOS/Android, a plain touch tap does not move platform view-focus at all (only hardware
keyboard/D-pad/TV-remote navigation and Full Keyboard Access do), so the "stuck highlight after a
tap" concern does not even arise there. Conclusion: real UX nuance on web, not a regression, not a
WCAG violation — not filed as a finding.

**Touch targets unaffected** — `HIT_SLOP` (`button.tsx:36-41`, `Math.max(0, (layout.touchTarget -
height) / 2)`) is untouched by this diff (confirmed via `git diff`, no lines in that range
changed); every button in this panel still gets an effective ≥48dp target.

**login-form regression check — run for real, twice, against the correct code.**
`git diff 0dfc914..HEAD -- libs/components/src/organisms/login-form libs/components/tests/e2e/organisms/login-form`
is empty (files genuinely untouched). I do not take "still green" on faith:
- `pnpm --filter @helsoft/components exec jest login-form.test.tsx` → **43/43 pass**. Also ran the
  full `@helsoft/components` suite → **94/94 pass** (6 suites, including `button.test.tsx` and
  `pdf-upload-panel.test.tsx`).
- `login-form.e2e.js` (Playwright, 6 specs) — first attempt against the repo's own
  `playwright.config.js` (`reuseExistingServer: true`, port 6007) produced misleading results: a
  **stray Storybook dev server from an unrelated, concurrently-running worktree**
  (`.worktrees/activity-multiple-choice`, verified via `lsof -p <pid>` → `cwd` in that other
  worktree) was already bound to port 6007 and got reused instead of building this worktree's own
  code — `pdf-upload-panel`'s stories weren't even found in that server's index for that reason
  (unrelated worktree, different story set), while `login-form`'s stories happened to load from
  there since that component is also present there. That is not a valid regression check. I built
  a throwaway Playwright config pointed at a fresh Storybook instance on an isolated port,
  `cwd`-rooted in **this** worktree, and re-ran: **all 34 e2e specs across the whole component
  library pass, including all 6 `login-form.e2e.js` specs and all 6 `pdf-upload-panel.e2e.js`
  specs.** This matches `tdd.md`'s own documented reconciliation of the identical port collision
  (`docs/features/pdf-upload-extraction/tdd.md:1059-1064`) — independently reproduced, not just
  trusted.
- **Conclusion: `login-form.tsx` is NOT regressed** — same roles/names, same rendering, same
  interaction behavior; it now additionally gains a visible focus indicator as a side effect of
  the shared-atom fix, which is a strict accessibility improvement, not a behavior change any test
  contradicts.

---

## Re-confirmed clean (rubric re-verified from current source, not carried forward on trust)

- **Interactive-element roles/names** — `pdf-upload-panel.tsx:96` (choose-file), `:129` (continue),
  `:138` (retry) still all `Button` (`accessibilityRole="button"`, `button.tsx:100`); accessible
  name still derives from visible `Text` children. `pdf-upload-panel.test.tsx:24,57,160,188,258,298`
  assert role+name (incl. `disabled` state) for every state — re-read directly, still real
  assertions, not render-without-crashing checks.
- **Color contrast** — no color token or opacity value changed in this diff
  (`theme/colors.ts` diff empty); round-1's computed ratios (8.35:1–15.83:1 body text, 10.57:1/8.38:1
  button labels, 12.65:1/10.09:1 error banner) still hold unchanged.
- **Touch targets** — `HIT_SLOP` computation untouched; still ≥48dp effective target for every
  button size used in this panel.
- **Announcement `useEffect` dependency arrays** — `pdf-upload-panel.tsx:85-91`, re-read directly:
  still `[isLoading, labels.loading]` and `[errorMessage]`, unchanged by this diff. Same
  `"X" → undefined → "X"` re-announce guarantee on retry (via `use-pdf-extraction.ts`'s synchronous
  `setError(null)`) still holds; `pdf-upload-panel.test.tsx:219-243`'s re-announce-on-change test
  still passes (verified in the 94/94 run above).
- **No color-only signaling** — error banner still `accessibilityRole="alert"` (`:134`) plus
  distinct message text; loading state still `ProgressIndicator` + text. Unchanged.
- **Dynamic type** — no `allowFontScaling={false}` anywhere in this feature's files (re-grepped,
  zero hits). `Button`'s pre-existing `numberOfLines={1}` label (`button.tsx:110`) is unchanged by
  this diff and remains an out-of-scope, shared-atom characteristic (same disposition as round 1 —
  not re-filed as a fresh finding since nothing about this diff touches it).
- **Reading/focus order** — the three summary rows keep their original JSX order
  (filename → pageCount → imageCount → continue); wrapping each in `accessible` does not reorder
  anything, visually or in the accessibility tree.

## Carried-forward, non-blocking (not re-litigated per the brief)
- AC7/@s7 "upload control disabled" vs. choose-file staying enabled in the Empty state — twice
  triaged already, unchanged in this diff (`pdf-upload-panel.tsx:96`, `disabled={isLoading}`).

## Verdict

**APPROVED.** N5 resolved (verified via source + real `getByLabelText` assertions). N6 resolved
(verified via source, RN's actual `Pressability` wiring, and a from-scratch, correctly-isolated
re-run of both `login-form.test.tsx` and `login-form.e2e.js` against this worktree's real code —
no regression). No new findings. Zero open accessibility items.
