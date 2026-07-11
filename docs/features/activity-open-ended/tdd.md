# TDD log — activity-open-ended

## @s → test map (slice 1)

| @s | Test | File |
|---|---|---|
| @s6 | submitted-only shape; no isCorrect; R7 excluded | `libs/types/src/open-ended-answer.test.ts` |
| @s6 | emits OpenEndedAnswer once, no isCorrect, `isSystemCheckedActivity` false | `open-ended-activity.test.tsx` |
| @s7 | empty/whitespace prompt or modelAnswer → false | `is-open-ended-slide-valid.test.ts` |
| @s7 | invalid slide → unavailable, no onAnswered | `open-ended-activity.test.tsx` |
| @s1 | unanswered editable multiline; model hidden; no self-mark | `open-ended.test.tsx` |
| @s2 | submit → lock + reveal model; no grade/self-mark | `open-ended.test.tsx` + activity |
| @s3 | explanation with reveal | `open-ended.test.tsx` |
| @s4 | ignore edit/resubmit; onAnswered once | organism + activity |
| @s10 | submitEditing does not submit; newline in draft OK | `open-ended.test.tsx` |
| design | reuses TextField (not raw TextInput chrome) | `open-ended.test.tsx` |

## Cycles — slice 1

- @s6 RED type import fail → GREEN `OpenEndedSlide`/`OpenEndedAnswer` unions
- @s7 RED missing module → GREEN `isOpenEndedSlideValid`
- helpers RED → GREEN `isRehydratedSubmission` / `shouldShowExplanation`
- hook RED → GREEN `useOpenEnded` draft/lock/announce
- @s1–@s4,@s10 RED missing component → GREEN `OpenEnded` organism + barrel
- @s2/@s4/@s6 RED missing activity → GREEN `OpenEndedActivity` wiring (`maxLength=2000`, `t()` labels placeholders)

## Cycles — slice 1 review-slice fix

- design RED source asserts TextField / no TextInput → GREEN swap to `TextField` multiline outlined + drop hand-rolled input styles

## @s → test map (slice 2)

| @s | Test | File |
|---|---|---|
| @s5 | empty submit → reveal/lock; omit empty learner Text | `open-ended.test.tsx` |
| @s5 | empty submit → `submittedAnswer: ''` + reveal | `open-ended-activity.test.tsx` |
| @s7 | unavailable when prompt/modelAnswer empty/whitespace | `open-ended-activity.test.tsx` (outline) |
| @s7 | unavailable: no prompt/input/submit | `open-ended.test.tsx` |

## Cycles — slice 2

- @s5 RED empty learner Text after empty submit → GREEN `shouldShowLearnerAnswerBody` + omit empty body
- @s5/@s7 activity outline locks empty-submit + invalid modelAnswer/prompt paths
