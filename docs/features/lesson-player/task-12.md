---
id: task-12
title: i18n keys + accessibility for the player chrome
slice: 3
scenarios: [s4, s10, s15, s16, s20]
status: todo
paths:
  - libs/localization/src/resources/en.ts
  - libs/localization/src/resources/es.ts
  - libs/localization/src/resources/pt.ts
  - libs/localization/src/resources/de.ts
  - libs/study-buddy/src/components/lesson-player/lesson-player.tsx
  - libs/components/src/molecules/progress-indicator/progress-indicator.tsx
---

## Goal
Land the `player.*` translation keys across all four bundles (replace the placeholder `player.intro` / `player.finish`) — Next, Back, progress ("slide {{current}} of {{total}}"), empty-state, error-state + retry copy — and make the player chrome accessible: progress exposed to assistive tech (label / live region), Next/Back have clear accessible names, Back's disabled state (first slide) and Next's absence (results slide) are conveyed, and slide images use their `alt`.

## Done criteria
- [ ] Scenarios {s4, s10, s15, s16, s20} label/announcement text resolved via `t()` (no hardcoded UI strings)
- [ ] All four locale bundles stay key-aligned (`TranslationResource = typeof en` parity — new `player.*` keys in `en` force `es`/`pt`/`de`); locale-parity tests updated if present
- [ ] Nav buttons + progress carry accessible names/roles; progress updates announced (WCAG 4.1.3)
- [ ] `pnpm lint` + `check-types` + `test` green

## Notes
- Follow `i18n.mdc`: inline `t('player.…')` at the usage site; a domain→key dictionary is fine for activity-type selection if needed.
- Reuses existing `activity.*` keys for the R3 organisms (unchanged); `results.*` keys already exist for the inline `LessonResults`.
