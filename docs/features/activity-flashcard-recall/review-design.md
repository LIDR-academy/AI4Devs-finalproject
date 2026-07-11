# Design-system review (round 1) — activity-flashcard-recall

**Verdict: APPROVED** — no findings.

Scope: `flashcard.{tsx,types.ts,helpers.ts,stories.tsx}`, `use-flashcard.ts` (activities); `flashcard-activity.{tsx,stories.tsx}` (study-buddy); `en/es/pt/de.ts`, `migration-coverage.test.ts`. Diffed against `matching.tsx` for parity.

Checked (all pass):
- Tokens-only: `flashcard.tsx:121-176` — `theme.spacing/shape/layout.touchTarget/typography/colors` throughout; no hex/px literals (grep clean).
- Neutral mark-button color: `flashcard.tsx:76,168-175` — shared `secondaryContainer`/`onSecondaryContainer`/`secondary` for both marks, distinct from `matching.tsx:229-239`'s graded `tertiary`/`error` pairing (per spec rationale).
- Atomic placement: organism in `@helsoft/activities`, thin wrapper in `@helsoft/study-buddy`, mirrors `Matching`/`MatchingActivity`. Raw `Pressable` for self-mark (not `AnswerOption` — its `marker`/graded-color variants don't fit); matches `matching.tsx:131-146` precedent.
- 4 UI states: hidden/revealed-unmarked/marked-recalled/marked-not-recalled in `flashcard.tsx:92-118`; Loading N/A (documented decision); Error/Empty collapse to one unavailable path (`flashcard.helpers.ts:8-9`).
- Storybook: 8 stories cover all required states + 2 bonus unavailable stories (`flashcard.stories.tsx:42-75`); wrapper ships `Default`/`WithoutExplanation`.
- i18n: en/es/pt/de key-aligned (8 keys each); `migration-coverage.test.ts:66-69,151` registers the flashcard dir.
- Sibling consistency: file split, atom usage, `StyleSheet.create((theme) => ...)` pattern match `matching.tsx`.

## Non-blocking observation
`flashcard.tsx:172-175` — the non-chosen self-mark button keeps its idle visual treatment once locked (only `accessibilityState.disabled` conveys non-interactivity for it). Not a rubric violation — spec only mandates confirming the *chosen* mark, and `matching.tsx` doesn't dim non-selected controls either. Worth a glance in a future iteration.
