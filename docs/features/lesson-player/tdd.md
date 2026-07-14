# TDD — lesson-player

## @s → test map

| @s | test | file |
|---|---|---|
| s17 | isLoading; PlayerLoading single progressbar | use-lesson + player-loading |
| s1–s4 | deck nav + remount same-type | lesson-player.test |
| s5–s9 | slides + decorative image | slide-view / slide-image |
| s10 | named progressbar | lesson-progress-indicator |
| s11–s22 | restore / results / retake / empty / error | lesson-player* |

## Cycles

### Post-review mutation r1
- path / player-loading / use-lesson-player ref handlers
- progress-indicator helpers + effect deps

### Post-review mutation r2 (13 survivors)
- arcStyle `left` right/left windows (−size/2 vs 0)
- rightArcRotate / leftArcRotate extracted + unit + arc transform tests
- color/trackColor `??` overrides + theme fallback
- circular accessibilityValue `{min,max,now}`
- linear indeterminate style keeps `left` interpolate
