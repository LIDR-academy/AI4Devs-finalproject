# TDD — lesson-player

## @s → test map

| @s | test | file |
|---|---|---|
| s17 | isLoading true; Loading until resolve | use-lesson.test.ts |
| s1 | starts on first content slide | lesson-player.test.tsx |
| s2 | Next advances content slide | lesson-player.test.tsx |
| s3 | Back returns to previous | lesson-player.test.tsx |
| s4 | Back hidden on first; a11y chrome | lesson-player.test.tsx |
| s5 | instructional title+content | slide-view.test.tsx |
| s6 | each activity type wrapper | slide-view.test.tsx |
| s7 | image renders scaled | slide-image.test.tsx |
| s8 | no image → nothing | slide-image.test.tsx |
| s9 | unresolvable image → nothing | slide-image.test.tsx |
| s10 | progress X of N + live region | lesson-player + lesson-progress-indicator |
| s11 | Next skips unanswered | lesson-player.test.tsx |
| s12 | restore prior answer on Back | lesson-player + slide-view + wrappers |
| s13 | results inline + save once | lesson-player.test.tsx |
| s14 | unanswered → isCorrect false | lesson-player.helpers.test.ts |
| s15 | 0 slides → Empty + Back | lesson-player.test.tsx + e2e |
| s16 | load error + Retry → first slide | lesson-player.test.tsx + e2e |
| s18 | Retake → first slide, answers wiped | lesson-player.test.tsx |
| s19 | usable web + mobile viewports | lesson-player.e2e.js |
| s20 | Back from results + answer intact | lesson-player.test.tsx |
| s21 | re-enter results no 2nd save | lesson-player.test.tsx |
| s22 | retake then results persists again | lesson-player + use-lesson-player |

## Cycles

### Slice 1
- RED/GREEN load/display/nav/results; review rework (persistOnMount in reducer)

### Slice 2 (task-6 + task-7)
- RED @s12 lesson-player restore → GREEN pass `answers[slideId]` as `initialAnswer`
- RED @s12 SlideView forwards → GREEN ActivityBody threads typed restore props
- RED/GREEN wrappers forward `initialAnswer` / OE `initialSubmittedAnswer`
- RED @s18/@s22 Retake UI + hook → GREEN existing `reset` + `onRetake` wiring
- GREEN stories AnswerRestore/Retake + e2e
- RED/GREEN review: FITB/matching/flashcard organism-forward tests (@s12)

### Slice 3 (task-8 … task-12)
- RED @s15 empty → GREEN Empty short-circuit + `player.empty.*` (no deck/results)
- RED @s16 error+retry → GREEN Error UI + screen wires `error`/`refetch`; rerender → first slide
- RED @s9 image fail → GREEN assert SlideImage null URL; UnresolvableImage story
- GREEN @s19 ScrollView body + Mobile/Web e2e viewports
- RED @s10/@s20 progress live region → GREEN `accessibilityLiveRegion` + label
- GREEN @s4/@s15/@s16 a11y names + `player.*` keys en/es/pt/de + locale-parity
