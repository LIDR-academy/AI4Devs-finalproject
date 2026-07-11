---
id: task-6
title: i18n — activity.flashcard.* keys across all bundles
slice: 3
scenarios: [s9]
status: done
paths: [libs/localization/src/resources/en.ts, libs/localization/src/resources/es.ts, libs/localization/src/resources/pt.ts, libs/localization/src/resources/de.ts, libs/activities/src/organisms/flashcard/flashcard.tsx, libs/localization/src/coverage/migration-coverage.test.ts]
---

## Goal
Add the `activity.flashcard.*` chrome keys, key-aligned across all four bundles (`en` is the authoritative `TranslationResource`; `es`/`pt`/`de` must stay aligned or `check-types` fails). Wire the organism (task-3) to real keys in `flashcard.tsx`, replacing any placeholders. Register the new organism directory in the i18n coverage guard so a typo'd/renamed `activity.flashcard.*` key can't silently render the raw key.

Keys: `reveal`, `recalled`, `notRecalled`, `recalledConfirmed`, `notRecalledConfirmed`, `answerHeading`, `explanationHeading`, `unavailable`.

## Done criteria
- [x] @s9: reveal label, self-mark actions, locked confirmations, answer + explanation headings, and unavailable notice all render from the active locale bundle
- [x] All four bundles carry the full `activity.flashcard.*` key set (no missing/extra keys; bundles stay key-aligned with `en`)
- [x] `explanationHeading` reuses the shared "Why" wording precedent (matching/fill-in-the-blank); `unavailable` reuses the shared activity wording
- [x] `flashcard.tsx` consumes the real `t('activity.flashcard.*')` keys (no placeholder/hardcoded chrome string left in the organism)
- [x] `libs/activities/src/organisms/flashcard` is added to `KEY_EXISTENCE_DIRS` in `libs/localization/src/coverage/migration-coverage.test.ts` (its own `[name, dir]` entry, mirroring the shipped `multiple-choice`/`matching`/`fill-in-the-blank` activity entries), so every dotted key literal in the organism is asserted to resolve in the `en` bundle
- [x] `pnpm lint` + `pnpm check-types` + `pnpm --filter @helsoft/localization test` + `pnpm --filter @helsoft/activities test` green

## Notes
Only UI chrome is localized; front/back/explanation text is AI-generated slide content, not translated. Mirrors the shipped `activity.matching` / `activity.fillInTheBlank` namespaces — including the coverage-guard registration each shipped activity organism added when it landed.
