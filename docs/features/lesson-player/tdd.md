# TDD — lesson-player

## @s → test map (slice 1)

| @s | test | file |
|---|---|---|
| s17 | isLoading true; Loading until resolve | use-lesson.test.ts |
| s17 | player screen loading (wired via useLesson) | player.tsx + use-lesson |
| s1 | starts on first content slide | lesson-player.test.tsx |
| s2 | Next advances content slide | lesson-player.test.tsx |
| s3 | Back returns to previous | lesson-player.test.tsx |
| s4 | Back hidden on first | lesson-player.test.tsx |
| s5 | instructional title+content | slide-view.test.tsx |
| s6 | each activity type wrapper | slide-view.test.tsx |
| s7 | image renders scaled | slide-image.test.tsx |
| s8 | no image → nothing | slide-image.test.tsx |
| s10 | progress X of N incl. results | lesson-progress-indicator + lesson-player |
| s11 | Next skips unanswered | lesson-player.test.tsx |
| s13 | results inline + save once | lesson-player.test.tsx |
| s14 | unanswered → isCorrect false | lesson-player.helpers.test.ts |
| s20 | Back from results → last content | lesson-player.test.tsx |
| s21 | re-enter results no 2nd save | lesson-player.test.tsx + lesson-results |

## Cycles

### Task 1–5 (slice 1)
- RED/GREEN load/display/nav/results as logged previously

### Slice-1 review rework
- RED/GREEN persistOnMount in reducer (atomic enterResults on next); unexport State/Action
- GREEN MidDeck/ResultsSlide play stories; SlideImage WithImage mock
- GREEN rename progress-indicator → lesson-progress-indicator
- GREEN ActivityBodyProps; drop unused initialAnswer
