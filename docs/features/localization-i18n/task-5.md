---
id: task-5
title: LocalePreferenceDao — persist/read the chosen locale (AsyncStorage)
slice: 2
scenarios: [s7, s12]
status: done
paths:
  - libs/services/src/dao/locale-preference.dao.ts
  - libs/services/package.json
---

## Goal
Add the data-access layer for the persisted language preference. `LocalePreferenceDao` reads, writes, and clears a locale string in the platform store via `@react-native-async-storage/async-storage` (universal: `localStorage` on web, native store on iOS/Android). Raw storage access only — no validation, no React.

## Done criteria
- [ ] Scenario(s) @s7, @s12 supported by concrete DAO tests (get returns the stored value; get on a storage error is handled per contract — surfaces so the service can fall back)
- [ ] `LocalePreferenceDao` is an `abstract class` with `static` methods `getStoredLocale()`, `setStoredLocale(value)`, `clearStoredLocale()`
- [ ] Uses a single well-known storage key constant; wraps access so a failure is a rejected promise / null rather than an uncaught crash
- [ ] `@react-native-async-storage/async-storage` added to `@helsoft/services` deps
- [ ] DAO tests mock AsyncStorage; no business logic in the DAO
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm test` green
- [ ] No hardcoded strings/colors/dimensions

## Notes
- Per hooks-service-dao.mdc this is a non-Supabase (platform-store) DAO; keep it separate from the Supabase DAO.
- R4: storage may throw (SSR/web prerender, private mode) — the DAO must not crash the app; graceful fallback logic lives in the service (task-6) / provider (task-7).
