---
id: task-9
title: LanguageSettings feature component + Settings screen wiring
slice: 2
scenarios: [s5, s6, s9]
status: todo
paths:
  - libs/study-buddy/src/components/language-settings/language-settings.tsx
  - libs/study-buddy/src/components/language-settings/language-settings.test.tsx
  - libs/study-buddy/src/index.ts
  - libs/study-buddy/package.json
  - apps/app-study-buddy/src/app/(app)/settings.tsx
---

## Goal
Compose the presentational `LanguageSelector` with the localization hook in a feature component `LanguageSettings` (in `@helsoft/study-buddy`), and render it from the Settings screen. `LanguageSettings` builds the option list (endonym labels from localization config), reads the active locale from `useLocalization()`, and wires selection to `setLocale`. The app screen stays a thin shell that just renders `<LanguageSettings />`.

## Done criteria
- [ ] Scenario(s) @s5, @s6, @s9 covered: selector lists the four languages with the active indicated (@s5); selecting one switches the UI immediately (@s6); a screen label sourced from a key still renders when missing from a locale, via English fallback (@s9)
- [ ] `LanguageSettings` reads `{ locale, setLocale, supportedLocales }` from `useLocalization` and passes options/value/onChange to `LanguageSelector`
- [ ] Endonym labels sourced from `@helsoft/localization` config (not translation keys); its own visible labels (e.g. section heading) come from translation keys
- [ ] Settings screen (`apps/*`) only renders `<LanguageSettings />` — no business logic in the app
- [ ] Component test mocks the localization hook; asserts wiring + immediate switch
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm test` green
- [ ] No hardcoded strings/colors/dimensions

## Notes
- Keeps the app a thin shell (global.mdc): composition/business logic lives in the feature lib `@helsoft/study-buddy`.
- Depends on task-7 (persisted `setLocale`) and task-8 (`LanguageSelector`).
