# Design-system review (round 1) — activity-flashcard-recall

**Verdict: APPROVED**

## Scope reviewed
- `libs/activities/src/organisms/flashcard/{flashcard.tsx,flashcard.types.ts,use-flashcard.ts,flashcard.helpers.ts,flashcard.stories.tsx}`
- `libs/study-buddy/src/components/flashcard-activity/{flashcard-activity.tsx,flashcard-activity.stories.tsx}`
- `libs/localization/src/resources/{en,es,pt,de}.ts`, `libs/localization/src/coverage/migration-coverage.test.ts`
- Diffed against sibling `libs/activities/src/organisms/matching/matching.tsx` for pattern parity.

## Findings
None.

## Rubric checks (evidence)

**Tokens-only** — `flashcard.tsx:121-176` styles built via `StyleSheet.create((theme) => ...)`, every value sourced from theme: `theme.spacing.s1/s3/s4`, `theme.shape.md`, `theme.layout.touchTarget` (`flashcard.tsx:164`), `theme.typography.titleLarge/titleSmall/bodyLarge/bodyMedium/labelLarge`, `theme.colors.onSurface/onSurfaceVariant/secondaryContainer/secondary/onSecondaryContainer/outline`. No hex/px literals found (`grep` for `#[0-9a-f]{3,6}|rgb(|Npx` on `flashcard.tsx` and `flashcard-activity.tsx` returns nothing). `theme.layout.touchTarget` (spacing.ts:35 = 48) and `theme.colors.secondaryContainer`/`onSecondaryContainer` (colors.ts:108-109,145-146,182-183) confirmed to exist as real tokens.

**Neutral mark-button color** (`flashcard.tsx:76`, `markButtonChosen`/`markButtonLabel` at `flashcard.tsx:168-175`) — both Recalled and Not-recalled share one `secondaryContainer`/`onSecondaryContainer`/`secondary` pairing, distinct from the graded `tertiary`(correct)/`error`(incorrect) pairing `matching.tsx:229-239` uses for its graded item states. Matches the spec's documented rationale (spec.md "mark-button color-neutrality"); not flagged.

**Atomic-design placement** — `Flashcard` organism in `@helsoft/activities/src/organisms/flashcard/`, thin `FlashcardActivity` wrapper in `@helsoft/study-buddy`, mirrors the shipped `Matching`/`MatchingActivity` split exactly (spec.md Open decisions). Reuses `Card`, `Button`, `Icon` from `@helsoft/components` (`flashcard.tsx:4`) — no ad-hoc reimplementation of those atoms. The self-mark action is a raw `Pressable` (`flashcard.tsx:79-89`) rather than the `AnswerOption` molecule (`libs/components/src/molecules/answer-option/answer-option.tsx`) — checked and rejected as a fit: `AnswerOption` requires a lettered `marker` prop (not applicable to Recalled/Not-recalled) and its `state` variants are hardwired to `correct`/`tertiary` and `incorrect`/`error` semantics, which conflicts with the spec's deliberate neutral-color, non-graded requirement. This mirrors the same raw-`Pressable` precedent already used by the shipped `matching.tsx:131-146` item renderer, so it's consistent with, not a deviation from, the established sibling pattern. No finding.

**4 UI states** — Content substates (hidden / revealed-unmarked / marked-recalled / marked-not-recalled) all implemented in `flashcard.tsx:92-118` and driven by `use-flashcard.ts`'s `isRevealed`/`locked`/`answer` derived state. Loading is N/A per a documented Open Decision (spec.md line 171, synchronous slide, matches shipped organisms — not an omission). Error (missing `back`) and Empty (missing `content`) deliberately collapse to one `isUnavailable` → `labels.unavailable` path via `isFlashcardSlideValid` (`flashcard.helpers.ts:8-9`, spec.md line 132/170) — documented decision, not a gap, and both collapse conditions are exercised by distinct stories (`UnavailableMissingBack`, `UnavailableMissingFront`, `flashcard.stories.tsx:63-73`) even though the spec's minimum story list didn't strictly require two separate stories.

**Storybook coverage** — `flashcard.stories.tsx` covers all 6 spec-required states: `Hidden` (:42), `RevealedUnmarked` (:44-46), `RevealedRecalled` (:48-50), `RevealedNotRecalled` (:52-54), `WithoutExplanation` (:56-61), `Interactive` (:75) — plus the two unavailable stories as a bonus. `Interactive` has no `play` function, matching the identical pattern in `matching.stories.tsx:100`, `fill-in-the-blank.stories.tsx:64`, `multiple-choice.stories.tsx:63` — consistent with sibling precedent, not a gap. `flashcard-activity.stories.tsx` ships `Default` (with explanation, :30-34) and `WithoutExplanation` (:38-42) exactly as the spec's Open Decision specifies.

**i18n / token-for-copy consistency** — `en/es/pt/de.ts` all add a key-aligned `flashcard` block (8 keys each); `migration-coverage.test.ts:66-69,151` registers the `flashcard` organism directory in the `KEY_EXISTENCE_DIRS` guard, mirroring the shipped organisms' entries — confirms no hardcoded chrome strings slipped through undetected.

**Sibling consistency** — file split (`.types.ts` / `use-*.ts` hook / `.tsx` component / `.helpers.ts`), `Card`/`Button`/`Icon` usage, `StyleSheet.create((theme) => ...)` pattern, and unavailable-notice rendering (`flashcard.tsx:44-50`) all structurally match `matching.tsx`'s established shape line-for-line.

## Non-blocking observation (not a finding)
- `flashcard.tsx:172-175`: the non-chosen self-mark button keeps its idle visual treatment once locked (only `accessibilityState.disabled` communicates non-interactivity for it — the *chosen* mark is the one required by spec to be visually+accessibly confirmed, and it is). This is a design nuance worth a glance in a future iteration but is not a rubric violation: the spec's AC only mandates visual confirmation of the *chosen* mark, not a dimmed/disabled treatment of the unchosen one, and this mirrors how `matching.tsx` doesn't grey out non-interactive-but-unselected controls either.
