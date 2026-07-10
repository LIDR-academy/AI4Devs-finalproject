---
id: task-1
title: Scaffold @helsoft/localization with i18next config + resource bundles
slice: 1
scenarios: [s2]
status: done
paths:
  - libs/types/src/locale.ts
  - libs/types/src/index.ts
  - libs/localization/package.json
  - libs/localization/tsconfig.json
  - libs/localization/jest.config.js
  - libs/localization/src/config/supported-locales.ts
  - libs/localization/src/config/i18n.ts
  - libs/localization/src/resources/en.ts
  - libs/localization/src/resources/es.ts
  - libs/localization/src/resources/pt.ts
  - libs/localization/src/resources/de.ts
  - libs/localization/src/resources/index.ts
  - libs/localization/src/index.ts
---

## Goal
Create the new `@helsoft/localization` workspace package and its i18next core: the shared `Locale` type + supported-locale constants (in `@helsoft/types`), the four resource bundles (`en`, `es`, `pt`, `de`), and an i18next instance configured with react-i18next and `fallbackLng: 'en'`. This is the foundation every other task builds on. Adding a locale later must be a matter of dropping a bundle + registering its code in `resources/index.ts` and `SUPPORTED_LOCALES` — no other code changes.

## Done criteria
- [ ] Scenario(s) @s2 covered by a concrete test (a key resolves from each of the `en`/`es`/`pt`/`de` bundles)
- [ ] `Locale`, `SUPPORTED_LOCALES`, `FALLBACK_LOCALE` defined in `libs/types/src/locale.ts` (plain TS) and exported via the types barrel
- [ ] i18next configured with react-i18next, `fallbackLng: 'en'`, all four bundles registered, `initImmediate: false` (or equivalent) for a synchronous-friendly init
- [ ] Bundles are key-aligned (every non-`en` bundle has the same key set as `en`); at least a small starter key set exists
- [ ] Package wired into pnpm workspace (`main`/`types` → `src/index.ts`, `check-types` + `test` scripts) and exports through `src/index.ts`
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm test` green
- [ ] No hardcoded strings/colors/dimensions

## Notes
- Per Open decisions: `Locale`/`SUPPORTED_LOCALES`/`FALLBACK_LOCALE` live in `@helsoft/types` to avoid a circular dep between `@helsoft/localization` and `@helsoft/services`.
- Add `i18next` + `react-i18next` as deps of this lib only. Approve any pnpm ignored-build prompt in `pnpm-workspace.yaml` (R8).
- `supported-locales.ts` also holds the static endonym labels (English, Español, Português, Deutsch) used later by the selector wiring (Open decision: labels are not translation keys).
- Keep resources as plain TS objects/namespaces; the migration task (task-10/11) fills in the full key set.
