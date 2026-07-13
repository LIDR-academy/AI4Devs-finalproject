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
Swap the app's single AI provider from OpenAI to **Groq** end-to-end, atomically (spec.md Open decision #1). Straight rename swap, not a provider picker. `AiProvider` is a closed union, so every `provider: 'openai'` fixture breaks and must land in the same commit.

## Scope of edits
- `libs/types/src/api-key.ts:5` — `AiProvider = 'openai'` → `'groq'` (keep `AssertExactKeys` shape lock).
- `supabase/functions/manage-api-key/provider.ts:5,10` — mirror type + `AI_PROVIDERS` allow-list to `['groq']` (keep `isAiProvider`).
- **`libs/supabase-services/src/services/api-key.service.ts:6` — `DEFAULT_PROVIDER` → `'groq'`.** Production logic, not a fixture: the UI (`use-api-key.ts`) always calls `saveApiKey(rawKey)` with no provider arg, so this constant is what's actually persisted — without it @s20 fails even after the type flips.
- `api-key-settings.tsx:8,14` — `PROVIDER_DISPLAY_NAMES = { groq: 'Groq' }`; `GUIDANCE_URL = 'https://console.groq.com/keys'`.
- `settings.apiKey.guidance` in all four locale bundles (en/es/pt/de) — "OpenAI" → "Groq" (translated per locale).
- Every `provider: 'openai'`/"OpenAI"/`platform.openai.com` fixture across the `paths:` list above flips to Groq — includes the e2e `api-key-form.e2e.js` (asserts exact guidance/saved-status copy strings) and `api-key-settings.test.tsx`/`api-key-gate.test.tsx` (assert the OpenAI guidance URL and `provider: 'openai'` status shape).

## Done criteria
- [x] Scenario @s20 covered (both the closed-union type **and** the persisted `DEFAULT_PROVIDER` resolve to Groq; guidance links to Groq console; no user-facing "OpenAI" copy remains)
- [x] No product behavior change to R6 save/remove — only provider identity + copy
- [x] `settings.apiKey.guidance` still passes the localization key-alignment / coverage guard (only values change, keys unchanged)
- [x] `pnpm lint` + `pnpm check-types` + `pnpm test` green for every touched workspace (types/supabase-services/hooks/components/study-buddy/localization); repo-wide confirmation deferred to the Slice-1 gate
- [x] No hardcoded strings/colors/dimensions introduced

## Notes
- The R6 OpenAI validation probe no longer exists (removed 2026-07-13, `progress/history.md:27`) — no probe endpoint to re-point; swap is type+default+copy+guidance+fixtures only. Invalid key is first discovered at generation time (`invalid_key`, task-12).
- Provider brand names are proper nouns — not translated (only the surrounding guidance sentence is).
