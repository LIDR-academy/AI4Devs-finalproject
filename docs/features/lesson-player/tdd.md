# TDD — lesson-player

## @s → test map

| @s | test | file |
|---|---|---|
| s17 | isLoading; PlayerLoading single progressbar | use-lesson + player-loading.test |
| s1 | starts on first content slide | lesson-player.test.tsx |
| s2 | Next + remount same-type activities | lesson-player.test.tsx |
| s3 | Back returns to previous | lesson-player.test.tsx |
| s4 | Back hidden on first; a11y chrome | lesson-player.test.tsx |
| s5–s6 | instructional + activity wrappers | slide-view.test.tsx |
| s7–s9 | image scaled / absent / fail; decorative no-alt | slide-image.test.tsx |
| s10 | progress X of N + named progressbar | lesson-progress-indicator |
| s11–s14 | skip unanswered; restore; results; grade false | lesson-player* |
| s15–s16 | empty + error/retry | lesson-player.test + e2e |
| s18–s22 | retake / persist / back from results | lesson-player* |
| s19 | viewports | lesson-player.e2e.js |

## Cycles

### Slice 1–3 + mutation r1–r2
- load/nav/results/restore; survivor killers (see prior)

### Review r1 CI
- biome; TS2352 via unknown; ResultsSummary stub for Animated

### Review r2 (9 findings)
- key={slide.id} + remount test (adjacent MC)
- progressbar accessibilityLabel; PlayerLoading (no nested role)
- SlideImage decorative when no alt
- results route → Redirect to player
- useCallback + maxIndexRef; storage path shape guard
