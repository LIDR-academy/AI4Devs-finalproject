# Localization (i18n)

**As a** multilingual user of AI Study Buddy
**I want** the app to display in my language and let me switch languages in-app
**so that** I can study comfortably in the language I understand best, on web, iOS, or Android

## Context
- New shared library `libs/localization` published as `@helsoft/localization`, wrapping **i18next + react-i18next** (works across web + iOS + Android from one Expo codebase).
- Supported locales at launch: **English (`en`, base/fallback), Spanish (`es`), Portuguese (`pt`), German (`de`)**. Adding a locale later must be config-only (drop in a resource bundle + register it).
- Language is chosen by **auto-detect + manual override**: on first launch the app detects the device locale via `expo-localization`; the user can override it in the existing **Settings** screen (`apps/app-study-buddy/src/app/(app)/settings.tsx`), and that choice persists across restarts and wins over the device locale.
- Scope of migration: **all existing user-facing hardcoded strings** in `libs/components/` and `apps/app-study-buddy/` are replaced with translation keys — no hardcoded UI copy should remain after this story.
- Consumes existing design-system tokens/components; a language selector component is added to `@helsoft/components` following atomic design.
- Business/config logic lives in the lib, not in the app (per `.agents/rules/global.mdc` + `hooks-service-dao.mdc`); the app only mounts the provider and composes.
- Expo SDK 57 — verify `expo-localization` API against https://docs.expo.dev/versions/v57.0.0/ before coding.

## Acceptance criteria

### Library & provider
- `@helsoft/localization` exists and configures i18next with react-i18next, `en` as the fallback locale, and resource bundles for `en`, `es`, `pt`, `de`, each exporting through the lib's `index.ts` barrel.
- The lib exposes a provider (e.g. `<LocalizationProvider>`) and a translation hook (e.g. `useTranslation` / `useLocale`) so any component in libs or the app can translate without importing i18next directly.
- The app mounts the provider at startup (root `_layout.tsx`) so every screen and shared component can translate.

### Auto-detection (first launch)
- On first launch with no saved preference, the app reads the device locale via `expo-localization`.
  - Device locale is one of `en/es/pt/de` → UI renders in that language.
  - Device locale is unsupported → UI falls back to **English**.

### Manual override & switching
- The Settings screen shows a language selector listing the 4 supported languages, each labeled in its **own** name (English, Español, Português, Deutsch), with the active one indicated.
- Selecting a language updates the UI **immediately** (no app restart) across both app screens and shared components.
- The selected language **persists** across app close/reopen and takes precedence over the device locale on subsequent launches.

### Coverage & correctness
- Every user-facing string in `libs/components/` and `apps/app-study-buddy/` is rendered from a translation key; no hardcoded UI strings remain.
- A key missing from the active locale falls back to the English string (never renders a raw key or crashes).
- Interpolation (values inside a string) and pluralization work through i18next.
- Renders correctly on **web, iOS, and Android**.

## Notes
- **Library layering** (`.agents/rules/hooks-service-dao.mdc`): keep i18next setup + resources in `@helsoft/localization`; if the persisted-preference store needs data access, route it through a service/DAO rather than touching storage from a component. Persistence uses the platform store (AsyncStorage on native / `localStorage` on web).
- **Atomic design** (`.agents/rules/atomic-design.mdc`): the language selector lives in `@helsoft/components` at the correct atomic level (molecule/organism), reuses existing tokens/components, ships a `<name>.stories.tsx` covering each locale, and has a `<name>.test.tsx` (TDD).
- **Accessibility**: the selector is keyboard/screen-reader accessible with proper roles/labels, the active selection is announced, and no meaning is conveyed by color alone.
- New dependencies introduced by this story: `i18next`, `react-i18next`, `expo-localization` (justify in the architecture review). Add them to `@helsoft/localization` (and the app for `expo-localization` if required).
- No analytics events or feature flags required for MVP.
- Follow-on: locale-aware date/number formatting is out of scope for this story unless a translated string requires it.
