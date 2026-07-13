---
id: task-14
title: i18n generation.* keys (en/es/pt/de) + coverage test
slice: 3
scenarios: [s18]
status: done
paths:
  - libs/localization/src/resources/en.ts
  - libs/localization/src/resources/es.ts
  - libs/localization/src/resources/pt.ts
  - libs/localization/src/resources/de.ts
---

## Goal
Add the `generation.*` key group to all four locale bundles (en is authoritative; es/pt/de typed against `TranslationResource` so they must stay key-aligned). Covers the composition picker labels, the three progress step labels, the ready-state summary, and every `GenerationErrorCode` message.

## Keys (en, translate for es/pt/de)
- `generation.composition.{instructionalOnly,activityOnly,both}` + a heading/label for the picker.
- `generation.progress.{reading,generating,attaching}` — the step labels.
- `generation.ready.*` — deck-ready summary + open-in-player CTA (interpolate slide count like `lessons.count_*`).
- `generation.error.{missingKey,invalidKey,rateLimited,timeout,generationFailed,documentNotReady,network,unauthenticated}`.

## Done criteria
- [ ] Scenario @s18 covered (all generation copy renders from the active bundle; no hardcoded strings)
- [ ] All four bundles key-aligned (compiles against `TranslationResource`); the localization key-existence/coverage guard extended for the generation components
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm test` green

## Notes
- The `settings.apiKey.guidance` OpenAI→Groq value change already landed in task-1 (values only, keys unchanged) — this task does not re-touch it.
