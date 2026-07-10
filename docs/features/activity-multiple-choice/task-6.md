---
id: task-6
title: i18n activity.mcq.* keys (en/es/pt/de) + wire t() in the wrapper
slice: 3
scenarios: [s10]
status: todo
paths:
  - libs/localization/src/resources/en.ts
  - libs/localization/src/resources/es.ts
  - libs/localization/src/resources/pt.ts
  - libs/localization/src/resources/de.ts
  - libs/study-buddy/src/components/multiple-choice-activity/multiple-choice-activity.tsx
---

## Goal
Localize the MCQ UI chrome. Add an `activity.mcq.*` namespace to all four locale bundles and replace the placeholder literals in the `MultipleChoiceActivity` wrapper with `t()` calls, injecting them as `labels` into the presentational organism (the established `LoginForm`/`SignInForm` pattern). Only chrome is localized; the question, option labels, and explanation text come from the (AI-generated) slide data.

## Keys (from spec — i18n)
```
activity: {
  mcq: {
    correct: 'Correct',
    incorrect: 'Incorrect',
    explanation: 'Explanation',   // explanationHeading
    unavailable: 'This question is unavailable',
  },
},
```
(en shown; provide the translated values for es/pt/de.)

## Done criteria
- [ ] @s10 — the result label and explanation heading render from the active locale bundle; no hardcoded chrome string remains in the wrapper/organism
- [ ] All four bundles (`en`/`es`/`pt`/`de`) are key-aligned for the new `activity.mcq.*` keys (compiler enforces via `TranslationResource`)
- [ ] Wrapper builds `labels` via `useLocalization().t('activity.mcq.*')`
- [ ] Localization coverage test confirms the new keys exist in every bundle
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm test` green
- [ ] No hardcoded strings/colors/dimensions

## Notes
- Follows the existing `en.ts` `TranslationResource` key-alignment convention (every non-`en` bundle typed against `en`).
- No analytics and no feature flags in this feature — slice 3 is a11y + i18n only.
- Depends on tasks 3–5.
