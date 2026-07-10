---
id: task-2
title: Add LocalizationProvider + useLocalization hook
slice: 1
scenarios: [s1]
status: done
paths:
  - libs/localization/src/provider/localization-provider.tsx
  - libs/localization/src/hooks/use-localization.ts
  - libs/localization/src/index.ts
---

## Goal
Expose the React surface of the lib: a `<LocalizationProvider>` that wraps react-i18next's `I18nextProvider` with the configured instance, and a `useLocalization()` hook that returns `{ t, locale, setLocale, supportedLocales }`. Consumers translate through the hook only — never importing i18next directly. This delivers the happy path: a component inside the provider renders a translated key for the active locale.

## Done criteria
- [ ] Scenario(s) @s1 covered by a concrete test (a test component inside the provider renders the translated value for the active locale via the hook)
- [ ] `useLocalization` wraps react-i18next's `useTranslation`; `t`, `locale`, `setLocale`, `supportedLocales` are returned and typed with `Locale`
- [ ] `setLocale` changes the active language via `i18n.changeLanguage` (persistence wired later in task-7)
- [ ] Provider exposes a `ready` signal so the app can gate first paint (used in task-4)
- [ ] Provider + hook exported through `src/index.ts`
- [ ] Logic unit test for the hook; no React state left in services/DAO layers
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm test` green
- [ ] No hardcoded strings/colors/dimensions

## Notes
- Per Open decisions the hook/provider live in `@helsoft/localization` (not `@helsoft/hooks`) because they are intrinsic to the i18n context; persistence is still routed through `@helsoft/services` in slice 2.
- Keep `setLocale` a thin wrapper here; the persistence/precedence logic is layered on in task-7 so this task stays atomic.
