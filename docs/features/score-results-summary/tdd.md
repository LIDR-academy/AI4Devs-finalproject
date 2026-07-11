# TDD log — score-results-summary

## @s → test map

| @s | Behavior | Test file |
|---|---|---|
| s1 | Score shown, correctly formatted, for a fully-correct scorable lesson | `score-lesson.test.ts`, `results-summary.test.tsx`, `lesson-results.test.tsx` |
| s2 | Only system-checked types (MC/fill-in-blank/matching) count | `activity-type.test.ts`, `score-lesson.test.ts` |
| s3 | Matching contributes one whole-slide point | `score-lesson.test.ts` |
| s4 | Unanswered system-checked slides count toward total, not correct | `score-lesson.test.ts` |
| s5 | Loading state (hook `saving`, organism spinner+disabled actions, wiring binding) | `use-lesson-attempt.test.ts`, `results-summary.test.tsx`, `lesson-results.test.tsx` |
| s6 | Attempt persisted, insert-only, exactly-once, integration path | `lesson-attempt.dao.test.ts`, `.service.test.ts`, `use-lesson-attempt.test.ts`, `lesson-results.test.tsx`, `lesson-results.integration.test.tsx` |
| s7 | Save-failure: score stays visible + non-blocking notice + retry | `results-summary.test.tsx`, `lesson-results.test.tsx` |
| s8 | Instructional-only lesson → completion, no attempt record | `lesson-results.test.tsx`, `score-lesson.test.ts` |
| s9 | Zero system-checked slides → completion, not 0/0 | `score-lesson.test.ts` |
| s10 | Completion variant exposes Retake + Back-to-lessons | `results-summary.test.tsx` |
| s11 | Retake navigates to player slide 1, `replace`, no regeneration | pre-existing route wiring (`results.tsx`, task-7); no app-route test harness |
| s12 | All labels sourced from `t()`, zero hardcoded copy | `lesson-results.test.tsx` |
| s13 | State changes announced (a11y), roles/labels on every action | `results-summary.test.tsx` |
| s1/s7/s8 (e2e) | Score/SaveFailed/Completion stories render + interact correctly | `results-summary.e2e.js` |

Type-level checks (task-1): `MultipleChoiceAnswer`→`GradedAnswer` and `MultipleChoiceSlide`→`ScorableSlide` assignability (`graded-answer.test.ts`, `scorable-slide.test.ts`).

## Cycles (one line each)

**Slice 1 (happy path + loading, tasks 1-7) — commit `ad1232c`:**
- task-1: RED/GREEN `isSystemCheckedActivity` guard + `ScorableSlide`/`GradedAnswer`/`ScoreSummary`/`LessonAttempt` types; stood up Jest for `@helsoft/types`.
- task-2: RED/GREEN `scoreLesson` — all-correct → naive count → filtered-by-system-checked-type → matching/unanswered/defensive cases (algorithm generalized immediately).
- task-3: `lesson_attempts` migration (RLS, insert-only) + RED/GREEN `LessonAttemptDao.insertAttempt` (row mapping).
- task-4: RED/GREEN `LessonAttemptService.saveAttempt` (delegates) + 5 validation-rejection cases.
- task-5: RED/GREEN `useLessonAttempt` — saving/saved/error/retry/no-double-fire/unmount-safety (`isMounted` ref).
- task-6: RED/GREEN `ResultsSummary` — score labels, action wiring, loading+disabled. Scoped `variant` to `'score'` only this slice (widened task-8).
- task-7: RED/GREEN `LessonResults` — projects slides, calls `scoreLesson`, formats via `t()`, save-once guard; added `results.score`/`scorePercent` i18n keys; one real hook→service→DAO integration test; wired app route via a new `lesson-results-stub.ts` fixture.
- Gate: lint/check-types/test green across 7 workspaces. No e2e yet.

**Slice 1 review fix-forward → commit `dad20d0`:** added `lesson-results.stories.tsx` (missing sibling-parity story), dropped orphaned `results.summary` i18n key.

**Slice 2 (completion + error/retry, tasks 8-9) — commit `5525f74`:**
- task-8: RED/GREEN completion variant (widened `ResultsSummaryVariant`), save-failure notice (mirrors `LoginForm`'s `errorBanner`), retry wiring; updated stories to 4 states.
- task-9: RED/GREEN `LessonResults` completion branch (skips save when unscorable), `saveFailed`/`onRetrySave` bound to hook, retake/back-to-lessons threading pinned; added completion/save-failure i18n keys early (ahead of task-10) to satisfy the no-hardcoded-copy gate.
- Caught/fixed one Law-1 sequencing slip (production code briefly outran its RED test) via revert→confirm-RED→reinstate.

**Slice 2 review fix-forward (6 findings) → commit `0a65cb1`:** iOS `AccessibilityInfo.announceForAccessibility` on save-failure (+ variant guard), `lesson-results.stories.tsx` Completion/SaveFailed stories, removed untested `percent` ternary, `saveFailed`-notice variant guard, renamed `score`/`percent` styles to `headline`/`body`, graceful-degrade `onRetrySave` when omitted.

**Slice 3 (a11y + i18n + e2e, tasks 10-12) — commit `0b7801d`:**
- task-10: i18n keys already present from slice 2; added 2 regression-pin tests proving labels come from `t()`.
- task-11: RED/GREEN `AccessibilityInfo` announcement on `loading:true→false` (score and completion variants); confirmed roles/labels/touch-targets/no-color-only already satisfied.
- task-12: added `results-summary.e2e.js` (`storybook-e2e-tests` skill) — 6 tests over Score/SaveFailed/Completion stories; fixed label mismatches against story fixture text.
- Gate: 305 unit tests + 37 e2e (6 new) green across 8 workspaces.

**Slice 3 review fix-forward (3 findings) → commit `3b86c17`:** added `labels.scoreAnnouncement` (moved string composition out of the organism into `t()`-sourced i18n), guarded the combined loading→save-failure transition to announce only the failure (not both), rewrote e2e Retry locator to plain `text=Retry`.

**Pre-review mutation (40 survivors → 165/181 killed, 16 documented equivalent) → commit `a9a8ea8`:** killed real gaps — service `.trim()`/`score===0` boundaries, organism `variant==='score'` guard + 9 `StyleSheet` mutations (4 new `toHaveStyle` tests), wiring's activity-slide filter (exported `toScorableSlides` for direct testing) + exact variant-string pinning, fixture referential-integrity (`slideId`/`options`/`correctOptionId`). Documented as genuinely equivalent (independently re-verified): `isMounted`/`hasSaved` unmount guards (React 18 no-ops post-unmount setState in this harness), 4 arbitrary unconsumed fixture literals, 1 empty-testID mutant.

**Full review round 1 (1 major, 1 minor) → commit `9954137`:** consolidated `retry()`'s overlapping-save guard into the same `isSaving` ref `saveAttempt` uses (was previously unguarded); extracted `showSaveFailure` to dedupe a 3x-repeated predicate.

**Post-review mutation (17 survivors, all documented equivalent, same root causes) → commit `138debd`:** confirmed the review's new `isSaving` guard and `showSaveFailure` dedupe are both fully killed by tests — no new real gaps.

## Final gate

`pnpm lint` / `pnpm check-types` / `pnpm test` (305 tests, 8 workspaces) / `pnpm --filter @helsoft/components exec playwright test --reporter=list` (37/37) all green at HEAD. Mutation PASS both passes (91.16% / 90.23%, only empirically-verified equivalents surviving). Full review APPROVED, zero open findings. DoD PASS.
