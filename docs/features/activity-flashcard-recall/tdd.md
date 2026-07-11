# TDD log — activity-flashcard-recall (Slice 1)

Slice 1: types → pure helpers → `Flashcard` organism → thin `FlashcardActivity` wiring.
Tasks 1–4, all `status: done`.

## @s → test map

| @s | Test | File |
|---|---|---|
| s1 | renders only the front with a Reveal action and no self-mark actions | `libs/activities/.../flashcard/flashcard.test.tsx` |
| s2 | shows the back alongside the front once revealed | `flashcard.test.tsx` |
| s3 | shows both self-mark actions once revealed | `flashcard.test.tsx` |
| s4 | locks in and confirms "Recalled"/"Not recalled", reporting once + text/icon confirmation | `flashcard.test.tsx` (`it.each`) |
| s5 | ignores tapping the other mark / the same locked mark again | `flashcard.test.tsx` (`it.each`) |
| s6 | `FlashcardAnswer` satisfies `GradedAnswer` | `libs/types/src/graded-answer.test.ts` |
| s6 | `buildFlashcardAnswer` shape, both `recalled` values | `libs/activities/.../flashcard/flashcard.helpers.test.ts` |
| s6 | `onAnswered` called once with correct shape (organism) | `flashcard.test.tsx` |
| s6 | wiring forwards + reports the self-mark once | `libs/study-buddy/.../flashcard-activity/flashcard-activity.test.tsx` (integration) |
| s7 | explanation shown alongside revealed answer / absent when none / absent before reveal | `flashcard.test.tsx` |
| s8 (base; task-5 hardens) | `isFlashcardSlideValid` true/false (empty/whitespace front or back) | `flashcard.helpers.test.ts` |
| s8 (base; task-5 hardens) | unavailable notice + nothing interactive for an invalid slide | `flashcard.test.tsx` |

## Cycles

**task-1 — types**
- RED: added `FlashcardAnswer`/`GradedAnswer` type-level assignment to `graded-answer.test.ts` → failed (no `FlashcardAnswer` export).
- GREEN: added `FlashcardSlide` to `lesson.ts` (grew `ActivitySlide`); added `FlashcardAnswer` to `activity-answer.ts` (grew `ActivityAnswer`). Barrel (`export *`) picks both up automatically.
- Verified: `activity-type.ts` and `score-lesson.ts` untouched (git status clean on both).

**task-2 — pure helpers**
- RED→GREEN: `isFlashcardSlideValid` true for a well-formed slide → trim-based implementation.
- RED→GREEN (already covered by the general impl): empty/whitespace front, empty/whitespace back → false.
- RED→GREEN: `buildFlashcardAnswer` for `recalled=true`/`false`, mirrors into `isCorrect`.

**task-3 — `Flashcard` organism**
- `flashcard.types.ts` written directly (no runtime logic, mirrors `matching.types.ts` precedent — no dedicated test file).
- RED→GREEN (`use-flashcard.test.ts`): initial hidden/unlocked/available state → `useState` seeds.
- RED→GREEN: seeds from `initialAnswer` (revealed+locked) and `initialRevealed` (revealed only); `isUnavailable` derives from `isFlashcardSlideValid`.
- RED→GREEN: a11y announce effect fires `labels.answerHeading` on reveal, guarded `Platform.OS !== 'android'`.
- RED→GREEN (`flashcard.test.tsx`) scenario-by-scenario: @s1 hidden → Reveal button + `handleReveal`; @s2 reveal → back becomes visible; @s3 self-mark actions appear once revealed; @s4 self-mark locks + confirms (text+icon+`accessibilityState`), `it.each` both marks; @s5 locked mark ignores re-tap/switch, `it.each`; @s7 explanation shown on reveal (present/absent/before-reveal); base unavailable-notice render (empty/error hardening deferred to task-5); Storybook-demo seeding (`initialAnswer`/`initialRevealed`) render checks.
- Exported `Flashcard`/`FlashcardProps`(types) via `organisms/index.ts`.
- Refactor: none needed — component-split respected (handlers in `.tsx`, state/derived/effect in hook, pure transforms in helpers); no duplication found on review.

**task-4 — `FlashcardActivity` wiring**
- RED→GREEN (`flashcard-activity.test.tsx`, doubles as the slice's integration test): thin wrapper forwards `slide`/`onAnswered` to `Flashcard`; reveal → self-mark → `onAnswered` called once with the right `FlashcardAnswer` — drives the whole types→helpers→organism→wiring chain.
- Added `flashcard-activity.stories.tsx` (`Features/FlashcardActivity`, `Default` with explanation + `WithoutExplanation`), mirroring `matching-activity.stories.tsx`.
- Exported via `libs/study-buddy/src/index.ts`.

## Gate

- `pnpm --filter @helsoft/types test`: 4 suites, 11 tests green.
- `pnpm --filter @helsoft/activities test`: 17 suites, 256 tests green.
- `pnpm --filter @helsoft/study-buddy test`: 5 suites, 24 tests green.
- `pnpm turbo run check-types --filter=@helsoft/types --filter=@helsoft/activities --filter=@helsoft/study-buddy`: clean.
- `pnpm turbo run lint` for these three libs: no lint task defined for any lib workspace yet (pre-existing repo state — only `apps/app-study-buddy` has a `lint` script); nothing to run/fix here.
- No hardcoded colors/dimensions in new files (grepped for hex/rgb — none); all user-facing chrome via `t('activity.flashcard.*')` placeholder keys (real bundle entries land in task-6).
- No UI in this slice touches Playwright e2e (organism has no `.stories.tsx` yet — that's task-8, Slice 3), so no e2e run required for this gate.
