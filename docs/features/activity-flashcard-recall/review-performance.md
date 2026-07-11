# review-performance.md — activity-flashcard-recall (round 1)

**Verdict:** PASS — no findings.

## Scope reviewed
- `libs/activities/src/organisms/flashcard/flashcard.tsx`
- `libs/activities/src/organisms/flashcard/use-flashcard.ts`
- `libs/activities/src/organisms/flashcard/flashcard.helpers.ts`
- `libs/study-buddy/src/components/flashcard-activity/flashcard-activity.tsx`
- `libs/localization/src/coverage/migration-coverage.test.ts` (diff only)
- `libs/localization/src/resources/{de,en,es,pt}.ts` (diff only)

## Points checked (no issues found)

1. **`renderMarkButton` redefined per render** — `flashcard.tsx:67-90`. Fixed-arity helper (called exactly twice, `flashcard.tsx:112-113`), not a `.map` over unbounded data. Cost is two throwaway closures per render of a single, user-interaction-driven organism (not inside a virtualized/scrolled list, not re-rendered by a parent list). Same shape as the already-accepted `slide.options.map(...)` inline closure in `multiple-choice.tsx:57-73`. No memoization warranted.

2. **`labels` object recreated per render** — `flashcard.tsx:26-35`, 8 `t()` calls. Flows into `useFlashcard`'s effect at `use-flashcard.ts:26-29`, but the dependency array is `[isRevealed, labels.answerHeading]` (destructured primitive), not `labels` itself — object identity churn on every render does **not** re-fire the `AccessibilityInfo.announceForAccessibility` effect. Confirmed correct. Same per-render `labels` object pattern as `multiple-choice.tsx:23-28` (existing, accepted convention) — not a regression.

3. **No heavy synchronous work in render** — `buildFlashcardAnswer` (`flashcard.helpers.ts:15-20`) is O(1) object construction; `isFlashcardSlideValid` (`flashcard.helpers.ts:8-9`) is two `.trim()` calls on slide-sized strings. Negligible.

4. **No lists/virtualization concern** — component renders a fixed, small set of nodes (prompt, one button or answer+explanation+2 mark buttons). No `.map` over unbounded arrays. `FlashcardActivity` (`flashcard-activity.tsx:10-12`) is a thin, un-memoized pass-through wrapper — fine, matches sibling `*-activity.tsx` wrappers; not yet wired into any list/pager, so no fan-out re-render risk today.

5. **No network I/O** — no DAO/service/Supabase calls anywhere in the diff; purely local `useState` + one `AccessibilityInfo` effect gated by `isRevealed` (fires once per reveal, once per platform check, no polling).

6. **`migration-coverage.test.ts` diff** (`libs/localization/src/coverage/migration-coverage.test.ts:66-73,155`) — adds one directory (`FLASHCARD_DIR`) to an existing, already-bounded `KEY_EXISTENCE_DIRS` table. Same file-walk/regex machinery used for 4 prior activity dirs; scope addition is one more narrow, single-organism directory — no new unbounded glob or repo-wide scan introduced.

7. **Localization resource diffs** (`libs/localization/src/resources/{de,en,es,pt}.ts`, +10 lines each) — static string literal additions to existing translation objects; no computed/regex-driven key generation, no bundle-weight concern beyond a handful of short strings x4 locales.

No re-render storms, no N+1/round-trips, no unvirtualized lists, no heavy main-thread work, no asset weight concerns identified in this diff.
