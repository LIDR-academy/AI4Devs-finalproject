# review-accessibility.md — localization-i18n (reviewer_accessibility)

## Verdict: APPROVED (via human risk-acceptance of FO2, 2026-07-10)

WCAG 2.2 AA. Rounds 1–2 escalated one **major** as CHANGES_REQUESTED; per this reviewer's own stated
condition, the human sign-off on FO2 (`spec.md` Open decisions, 2026-07-10) flipped the verdict to APPROVED
with no code change. Durable record is `review.md`.

## Findings
- Blocker — none.
- **Major — carried, RESOLVED by human risk-acceptance (documented gap, not fixed in code):**
  `libs/components/src/molecules/language-selector/language-selector.tsx:38` — the container `View`'s
  `accessibilityRole="radiogroup"` + group `accessibilityLabel` are very likely inert for native
  VoiceOver/TalkBack (WCAG 1.3.1 / 4.1.2, Level A), because `accessible={true}` is never set. Independently
  verified across rounds (source-read of RN `RCTViewComponentView.mm:398` + RNTL `isSubtreeInaccessible`,
  plus a throwaway probe): the naive `accessible={true}` fix is a proven regression (makes the container an
  opaque leaf, hides the 4 `radio` children) and **no Jest/RNTL test can distinguish a safe fix from a
  harmful one** — so no verified-safe fix exists with this repo's tooling. Mitigated: each `radio` option is
  fully labelled/roled/stated, task stays completable; heading above gives contextual framing; web is
  unaffected. Pre-existing and systemic (identical in `radio-group.tsx:29`). Tracked as **spec FO2**;
  closing it is deferred to a design-system follow-up covering both components.
- **Minor — carried, settled since round 1 (not re-flagged):** X3 resting/unselected option border contrast
  ~1.66:1 (`language-selector.tsx:75`) — decorative boundary, state conveyed by other cues.

Test comment, FO2 write-up, and AC14 footnote verified accurate/calibrated (no over- or under-claiming).
