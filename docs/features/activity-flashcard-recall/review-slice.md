# Slice 3 review — activity-flashcard-recall

**Verdict: APPROVED**

Commit reviewed: `80743ed` (feat(activity-flashcard-recall): i18n, a11y, stories, and e2e — Slice 3), tasks 6-9.

## Scope checked
- `libs/localization/src/resources/{en,es,pt,de}.ts` — `activity.flashcard.*` keys
- `libs/localization/src/coverage/migration-coverage.test.ts` — `flashcard` `KEY_EXISTENCE_DIRS` entry
- `libs/activities/src/organisms/flashcard/flashcard.test.tsx` — new `@s10` accessibility block
- `libs/activities/src/organisms/flashcard/flashcard.stories.tsx` (new)
- `libs/activities/tests/e2e/organisms/flashcard/flashcard.e2e.js` (new)
- Read-only verification (unchanged this slice, cross-checked against claims): `flashcard.tsx`, `use-flashcard.ts`, `flashcard.helpers.ts`, `flashcard.types.ts`

## Code lens
- **task-6 (i18n)**: `flashcard.tsx:27-34` consumes real `t('activity.flashcard.*')` keys — no placeholder/hardcoded chrome left. All 8 keys (`reveal`, `recalled`, `notRecalled`, `recalledConfirmed`, `notRecalledConfirmed`, `answerHeading`, `explanationHeading`, `unavailable`) present and key-aligned across `en.ts:102-111`, `es.ts`, `pt.ts`, `de.ts` (each `TranslationResource`-typed against `en`, so `check-types` catches missing/extra keys). `explanationHeading: 'Why'` and `unavailable: 'This activity is unavailable'` verified byte-identical to the `matching`/`fillInTheBlank` precedent (`en.ts:90,92,98,99`). `FLASHCARD_DIR` entry in `migration-coverage.test.ts:66-69,151` mirrors the shipped `multiple-choice`/`matching`/`fill-in-the-blank`/`lesson-results` entries exactly (same comment style, same `[name, dir]` tuple shape).
- **task-7 (a11y)**: Verified against source, not just the test's claim — `flashcard.tsx:78-80` has real `accessibilityRole="button"`, `accessibilityLabel`, `accessibilityState={{ disabled, selected }}` on both self-mark `Pressable`s (plus text+`Icon` confirmation, not color alone, `flashcard.tsx:84-85`); `flashcard.tsx:162` uses `theme.layout.touchTarget` (token, not a magic number) for `minHeight`; `use-flashcard.ts:26-29` has the announce effect guarded `Platform.OS !== 'android'`. All pre-existing from Slice 1, confirmed unchanged in this slice's diff. The new `@s10` block (`flashcard.test.tsx:224-258`) is genuinely non-vacuous: it asserts `accessibilityRole`, `accessibilityLabel`, and `toHaveStyle({ minHeight: layout.touchTarget })` against real rendered props/styles (not tautological), consistent with the implementator's stated red/revert verification.
- **task-8 (Storybook)**: All 8 required stories present and correctly seeded (`flashcard.stories.tsx:42-75`) — `Hidden` (default), `RevealedUnmarked` (`initialRevealed`), `RevealedRecalled`/`RevealedNotRecalled` (`initialAnswer`), `WithoutExplanation` (explanation stripped, revealed), `UnavailableMissingBack` (`back: ''`), `UnavailableMissingFront` (`content: ''`) — distinct and each correctly triggers `isFlashcardSlideValid` (`flashcard.helpers.ts:8-9`), `Interactive` (unseeded, live). Structure mirrors `matching.stories.tsx` exactly, including the two-separate-stories-for-two-unavailable-cases pattern.
- **task-9 (e2e)**: `flashcard.e2e.js` genuinely drives the Interactive story's reveal → self-mark → lock flow (`:86-124`) with real clicks and post-condition assertions (locked confirmation stays, re-tap of the other/same mark is a no-op, `{ force: true }` correctly used post-lock since the control becomes non-interactive). Both unavailable stories assert their notice text and absence of interactive controls (`:67-83`). Non-shallow — assertions check both presence of new state and absence of prior state (e.g. bare `'Recalled'` label disappearing once locked, `:44,55`). Structure mirrors `matching.e2e.js` (`frameLocator` on `storybook-preview-iframe`, `getByText` exact) faithfully, including the same `check_circle`/`cancel` icon-as-text-ligature assertion pattern already proven valid there.
- No debug leftovers, no TODOs, functional React + `Props`/labels types throughout, kebab-case filenames maintained.

## Design lens
- No hardcoded colors/dimensions introduced anywhere in this slice's diff (only string bundle entries + a test-registration array + stories/e2e which carry no styling).
- `explanationHeading`/`unavailable` wording reuses the shared precedent verbatim, not diverged text (confirmed above).
- `component-split.mdc` respected: a11y announce effect lives in `use-flashcard.ts` (hook), a11y attributes live in `flashcard.tsx` (component) — unchanged, correctly split from Slice 1.
- Atomic-design placement unchanged and correct (organism-level, reusing `Button`/`Card`/`Icon` atoms/molecules from `@helsoft/components`).

## Notes (non-blocking, out of this slice's scope)
- The announce effect (`use-flashcard.ts:28`) announces the static label `labels.answerHeading` ("Answer") rather than the revealed answer content itself. This line was not touched in this slice (present since Slice 1, already reviewed/approved) and is a depth-of-a11y question reserved for the full review's accessibility lens — flagging only for that later pass, not blocking here.

No findings block this slice.
