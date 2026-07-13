---
id: task-1
title: Provider swap OpenAI → Groq (across shipped R6 code)
slice: 1
scenarios: [s20]
status: done
paths:
  - libs/types/src/api-key.ts
  - supabase/functions/manage-api-key/provider.ts
  - supabase/functions/manage-api-key/provider.test.ts
  - supabase/functions/manage-api-key/handle-save.test.ts
  - libs/supabase-services/src/services/api-key.service.ts
  - libs/supabase-services/src/services/api-key.service.test.ts
  - libs/supabase-services/src/dao/api-key.dao.test.ts
  - libs/study-buddy/src/components/api-key-settings/api-key-settings.tsx
  - libs/study-buddy/src/components/api-key-settings/api-key-settings.test.tsx
  - libs/study-buddy/src/components/api-key-gate/api-key-gate.test.tsx
  - libs/components/src/organisms/api-key-form/api-key-form.stories.tsx
  - libs/components/src/organisms/api-key-form/api-key-form.test.tsx
  - libs/components/tests/e2e/organisms/api-key-form/api-key-form.e2e.js
  - libs/hooks/src/hooks/use-api-key.test.ts
  - libs/hooks/src/hooks/api-key.integration.test.ts
  - libs/localization/src/resources/en.ts
  - libs/localization/src/resources/es.ts
  - libs/localization/src/resources/pt.ts
  - libs/localization/src/resources/de.ts
---

## Goal
Swap the app's single AI provider from OpenAI to **Groq** end-to-end, atomically, so the stored key and the generation call both target Groq (spec.md Open decision #1). This is a straight rename swap — not a provider picker. Because `AiProvider` is a closed union, changing it breaks every `provider: 'openai'` fixture, so all edits land together and the whole workspace stays green.

## Scope of edits
- `libs/types/src/api-key.ts:5` — `AiProvider = 'openai'` → `'groq'` (keep the `AssertExactKeys` shape lock as-is).
- `supabase/functions/manage-api-key/provider.ts:5,10` — mirror the type + `AI_PROVIDERS` allow-list to `['groq']` (Deno mirror; keep `isAiProvider`).
- **`libs/supabase-services/src/services/api-key.service.ts:6` — `const DEFAULT_PROVIDER: AiProvider = 'openai'` → `'groq'`.** This is production logic, not a fixture: `ApiKeyService.saveApiKey(rawKey, provider = DEFAULT_PROVIDER)` persists this default whenever no provider is passed, and the UI (`use-api-key.ts` → `ApiKeyService.saveApiKey(rawKey)`) always calls it **with no provider argument** — so this constant is the provider actually stored. Without it, @s20's "the stored/supported provider resolves to Groq" fails even after the type flips.
- `libs/study-buddy/src/components/api-key-settings/api-key-settings.tsx:8,14` — `PROVIDER_DISPLAY_NAMES = { groq: 'Groq' }`; `GUIDANCE_URL = 'https://console.groq.com/keys'`.
- `settings.apiKey.guidance` in **all four** locale bundles (en:128, es:104, pt:104, de:104) — replace "OpenAI" with "Groq" (translate per locale).
- Every `provider: 'openai'` and "OpenAI"/`platform.openai.com` fixture the type + copy change breaks:
  - `@helsoft/hooks` — `use-api-key.test.ts`, `api-key.integration.test.ts`.
  - `@helsoft/components` — `api-key-form.test.tsx`, `api-key-form.stories.tsx`, and the e2e `libs/components/tests/e2e/organisms/api-key-form/api-key-form.e2e.js` (asserts `text=Don't have a key? Get one from OpenAI` and `text=OpenAI key saved · …` — both flip to Groq).
  - `@helsoft/supabase-services` — `api-key.service.test.ts`, `api-key.dao.test.ts`.
  - `@helsoft/study-buddy` — `api-key-settings.test.tsx` (asserts the OpenAI guidance URL `https://platform.openai.com/api-keys`, `provider: 'openai'`, and the `savedStatus` `"provider":"OpenAI"` interpolation) and `api-key-gate.test.tsx` (`status: { hasKey: true, provider: 'openai', … }`).
  - Deno `manage-api-key/*.test.ts` — `provider.test.ts`, `handle-save.test.ts`.

## Done criteria
- [x] Scenario @s20 covered (both the closed-union type **and** the persisted `DEFAULT_PROVIDER` resolve to Groq; guidance links to Groq console; no user-facing "OpenAI" copy remains)
- [x] No product behavior change to R6 save/remove — only provider identity + copy
- [x] `settings.apiKey.guidance` still passes the localization key-alignment / coverage guard (only values change, keys unchanged)
- [x] `pnpm lint` + `pnpm check-types` + `pnpm test` green for every touched workspace (types/supabase-services/hooks/components/study-buddy/localization); repo-wide confirmation deferred to the Slice-1 gate
- [x] No hardcoded strings/colors/dimensions introduced

## Notes
- **The R6 OpenAI validation probe no longer exists** (removed 2026-07-13, `progress/history.md:27`; `handle-save.ts` stores directly) — so there is **no probe endpoint to re-point**. This swap is type + default-provider + copy + guidance + fixtures only. A consequence handled downstream: an invalid key is first discovered at generation time (`invalid_key`, task-12).
- Provider brand names are proper nouns — not translated (only the surrounding guidance sentence is).
