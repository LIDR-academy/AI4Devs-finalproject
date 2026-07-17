---
id: task-8
title: ApiKeySettings wiring + settings screen + integration
slice: 1
scenarios: [s1, s3, s4]
status: done
paths: [libs/study-buddy/src/components/api-key-settings/api-key-settings.tsx, libs/study-buddy/src/components/api-key-settings/api-key-settings.test.tsx, libs/study-buddy/src/index.ts, apps/app-study-buddy/src/app/(app)/settings.tsx]
---

## Goal
Wire the happy path end-to-end and surface it on the account screen:
- `ApiKeySettings` (feature component in `@helsoft/study-buddy`) wires `useApiKey()` + `useLocalization()` to the presentational `ApiKeyForm`: passes `status`/`isLoadingStatus`/`isSubmitting`, maps `onSave` → `saveApiKey`, feeds the `labels` from `t('settings.apiKey.*')`. Clears its local input state on save success (raw key not retained).
- Add `<ApiKeySettings />` to `apps/app-study-buddy/src/app/(app)/settings.tsx` (keep it a thin shell, alongside `<LanguageSettings />` / `<SignOut />`).
- One **integration test** across the slice: hook → service → DAO with a mocked `getSupabase().functions.invoke` + metadata `select` (save success → masked state; status load).

## Done criteria
- [x] Scenario @s1 (end-to-end): entering a key and saving flows through the wiring → hook → service → DAO (mocked invoke) → masked "key saved" state renders.
- [x] Scenario @s3: on mount, the wiring loads status and reflects the masked saved state for a returning user.
- [x] Scenario @s4: replacing a key re-runs the save flow and reflects the update.
- [x] Integration test covers the composed slice with a mocked Supabase client.
- [x] `ApiKeySettings` exported via `libs/study-buddy/src/index.ts`; the screen stays a thin shell (composition only, no business logic in `apps/*`).
- [x] `pnpm lint` + `pnpm check-types` + `pnpm test` green; no hardcoded strings (settings screen must stay clean per `migration-coverage.test.ts`).

Note: `settings.apiKey.*` keys had to be added to **all four** locale bundles now (not just an en-only stub) because `es`/`pt`/`de` are typed as the exact `TranslationResource` shape derived from `en` — the compiler enforces parity, so a stub-only-en approach would fail `pnpm check-types` for the other three bundles. Task-13 (Slice 3) still owns the full i18n slice (copy review + extending `migration-coverage.test.ts`'s key-existence guard for the new component dirs, mirroring the `sign-in-form`/`sign-out` entries).

## Notes
- Mirrors `LanguageSettings`/`SignInForm`: presentational organism in `@helsoft/components`, wiring in `@helsoft/study-buddy`, screen composes only.
- Full `settings.apiKey.*` copy across all four locales lands in task-13; use the keys now so the screen references them (the keys must exist before the coverage test runs — coordinate with task-13 ordering within its slice, or stub en first and complete in Slice 3). Empty/Error/Remove wiring is completed in task-11.
