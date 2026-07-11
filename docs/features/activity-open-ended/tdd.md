# TDD log — activity-open-ended

## @s → test map (slice 1)

| @s | Test | File |
|---|---|---|
| @s6 | submitted-only shape; no isCorrect; R7 excluded | `open-ended-answer.test.ts` |
| @s6 | emits OpenEndedAnswer once, no isCorrect | `open-ended-activity.test.tsx` |
| @s7 | empty/whitespace prompt or modelAnswer → false | `is-open-ended-slide-valid.test.ts` |
| @s1–@s4,@s10 | organism Content path | `open-ended.test.tsx` |
| design | reuses TextField | `open-ended.test.tsx` |

## Cycles — slice 1

- @s6 RED → GREEN types; @s7 RED → GREEN validity; helpers/hook/organism/activity wiring
- design RED TextField assert → GREEN TextField multiline outlined

## @s → test map (slice 2)

| @s | Test | File |
|---|---|---|
| @s5 | empty submit reveal; omit empty learner Text | `open-ended.test.tsx` |
| @s5 | `submittedAnswer: ''` | `open-ended-activity.test.tsx` |
| @s7 | unavailable outline (prompt/modelAnswer) | `open-ended-activity.test.tsx` |

## Cycles — slice 2

- @s5 RED empty Text → GREEN `shouldShowLearnerAnswerBody`; @s7 activity outline

## @s → test map (slice 3)

| @s | Test | File |
|---|---|---|
| @s8 | `activity.openEnded.*` key existence | `migration-coverage.test.ts` |
| @s9 | input name, Submit hitSlop, locked AT, announce once, Android guard | `open-ended.test.tsx` |
| @s1,@s2,@s7 | Unanswered / SubmittedWithModelAnswer / Unavailable stories | `open-ended.stories.tsx` |
| @s1,@s2,@s4,@s5,@s10 | Playwright Interactive + static stories | `open-ended.e2e.js` |

## Cycles — slice 3

- @s8 RED missing keys in coverage → GREEN en/es/pt/de `openEnded` + KEY_EXISTENCE opt-in
- @s9 RED `accessibilityState.disabled` → GREEN forward onto TextField; announce/hitSlop tests
- stories: Unanswered / SubmittedWithModelAnswer / Unavailable / Interactive
- e2e: unanswered, submitted, unavailable, interactive submit/empty/@s4/@s10
