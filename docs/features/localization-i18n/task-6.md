---
id: task-6
title: LocalePreferenceService — validate + read/write the locale preference
slice: 2
scenarios: [s7, s12]
status: done
paths:
  - libs/services/src/services/locale-preference.service.ts
  - libs/supabase-services/src/services/index.ts
  - libs/supabase-services/src/index.ts
---

## Goal
Add the business-logic layer over `LocalePreferenceDao`. `LocalePreferenceService` validates that a value to persist is a supported `Locale` before storing it, and on read returns a valid stored `Locale` or `null` (unknown/absent/failed-read → `null` so the caller can fall back to detection).

## Done criteria
- [ ] Scenario(s) @s7, @s12 supported by concrete service tests (valid locale is persisted then read back; a read failure or unsupported stored value resolves to `null`)
- [ ] `LocalePreferenceService` is an `abstract class` with `static` methods `getStoredLocale(): Promise<Locale | null>` and `setStoredLocale(locale: Locale): Promise<void>`
- [ ] Validates against `SUPPORTED_LOCALES` (from `@helsoft/types`); rejects/ignores unsupported input rather than persisting junk
- [ ] Catches DAO read failures and resolves to `null` (never throws on read); calls the DAO, never AsyncStorage directly
- [ ] Exported through `src/services/index.ts` and `src/index.ts`
- [ ] Service tests mock the DAO; no React in this layer
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm test` green
- [ ] No hardcoded strings/colors/dimensions

## Notes
- Depends on task-5 (DAO) and task-1 (`Locale`/`SUPPORTED_LOCALES` in `@helsoft/types`). No dependency on `@helsoft/localization` — keeps the dep graph acyclic (R3).
- The "supported set" validation lives here (business logic); the pure resolution/precedence logic lives in the provider (task-7).
