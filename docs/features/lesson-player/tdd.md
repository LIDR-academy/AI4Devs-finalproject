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

### Slice 1–3
- RED/GREEN load/nav/results/restore/empty/error/retake; a11y + locale chrome

### Mutation rework r1 (97 survivors)
- hooks: stale reject + id reload; drop isMounted; `nextRequestId` + unit
- components: progress % + styles + TEST_ID
- activities: hasSaved via answer-change; real effect deps
- study-buddy: drop dead OE branch; aspectRatio; mismatch restore; styles; t('') throws; gradedAnswers; drop empty useCallbacks

### Mutation rework r2 (5 survivors)
- hooks: refetch after id change (kills `[load]`→`[]` on refetch)
- activities: persistOnMount false→true saves (kills effect deps→`[]`)
- study-buddy: progress bar now=20 on first slide (kills `currentIndex-1`); MC/OE mocks assert activityType so `true?answer` fails mismatch
