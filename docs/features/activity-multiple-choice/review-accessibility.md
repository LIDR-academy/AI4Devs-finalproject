# review-accessibility.md — activity-multiple-choice — FULL review, Round 3 (final, 3-round cap)

**Verdict: CHANGES_REQUESTED — 1 minor open (m4-b), a documented human-accepted risk candidate per
`.agents/rules/review-standards.md` §5, not a request for a 4th round.**

Scope: full feature diff `git diff 0dfc914..HEAD`.

## Open finding

- **m4-b (minor) — Android relies solely on an unverified live-region trigger.**
  `multiple-choice.tsx:90` (`Platform.OS !== 'android'` guard) composed with `:123-131` (result banner mounted fresh
  via `answered ? <View>… : null`, carrying `accessibilityLiveRegion`). The R2 fix removed the duplicate imperative
  `announceForAccessibility` on Android, but Android's live region is driven by content-change diffing on an
  already-present node; a node that appears already populated in one render pass may not fire at all. Worst case:
  Android gets **zero** announcement (silence) rather than a duplicate — the exact case WCAG 2.2 SC 4.1.3 prevents.
  **Unverified either direction** — no on-device/emulator TalkBack run performed in any round.
  **Minor because:** (a) code satisfies the letter of 4.1.3 (role/live-region properties present; SC doesn't mandate a
  delivery mechanism succeed per-platform); (b) symmetric unverified-either-way platform claim, same posture that kept
  m4 minor; (c) no regression in tested behavior — iOS/web (verified channels) unaffected.
  **Close-out options (not required to ship):** (i) on-device/emulator TalkBack check, or (ii) on Android omit the
  banner's `accessibilityLiveRegion` and use the imperative call alone (invert which single mechanism Android uses).
  Recorded as human-accepted risk in `spec.md` (Human-accepted risks) and `dod.md`.

## Resolved / re-confirmed (no action)

- **m4** (duplicate Android TalkBack) — RESOLVED by construction + test: RN source confirms `accessibilityLiveRegion`
  is Android-only and `announceForAccessibility` fired on Android pre-fix; the guard removes exactly the second
  trigger. Tests load-bearing (reverting the guard fails exactly `does not call announceForAccessibility on Android`).
- **B1** (icon ligature in accessible name) resolved in prior rounds; correctness conveyed via wording + icon +
  border/background, never color alone.
- Roles/labels (`accessibilityRole="button"` per option), contrast (theme-token pairs ≥4.5:1), touch targets
  (~60dp), focus/reading order, dynamic type — all re-verified clean over the full diff, unaffected by `38c450b`.
- Marker-circle clipping under large Dynamic Type (`answer-option.tsx:99-104,114-118`) — pre-existing, out of scope.
- Gate: `multiple-choice.test.tsx` 19/19 green.
