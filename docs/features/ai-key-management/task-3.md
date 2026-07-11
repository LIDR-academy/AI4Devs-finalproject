---
id: task-3
title: Types — AiProvider, ApiKeyStatus, save params
slice: 1
scenarios: [s11]
status: done
paths: [libs/types/src/api-key.ts, libs/types/src/index.ts]
---

## Goal
Add the plain-TS domain types the DAO/service/hook/UI share (one `type-name.ts` file, exported via the barrel):
- `AiProvider` — the supported-provider union; v1 = `'openai'` (union keeps the seam open for more providers).
- `ApiKeyStatus = { hasKey: boolean; provider?: AiProvider; updatedAt?: string }` — the **only** thing the client ever learns about a saved key. **No key characters, no last-4 hint.**
- `SaveApiKeyParams = { provider: AiProvider; apiKey: string }` (or equivalent) for the save call.

## Done criteria
- [x] Scenario @s11 (contract facet): `ApiKeyStatus` contains **no** field that could carry the raw key — a type-level test/assertion locks the shape (`hasKey`/`provider`/`updatedAt` only).
- [x] Plain TS types only (no runtime/React); exported through `libs/types/src/index.ts`.
- [x] `pnpm check-types` + `pnpm lint` + `pnpm test` green.
- [x] No hardcoded user-facing strings (types carry no copy).

## Notes
- Mirrors the `@helsoft/types` conventions used by `locale.ts` / `auth-error.ts`.
- `ApiKeyErrorCode`/`ApiKeyError` are added in task-10 (Slice 2 error contract), mirroring how `AuthErrorCode` landed with the login error-contract task.
