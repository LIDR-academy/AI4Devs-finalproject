---
id: task-6
title: useApiKey hook — load status + save
slice: 1
scenarios: [s1, s2, s3]
status: done
paths: [libs/hooks/src/hooks/use-api-key.ts, libs/hooks/src/hooks/use-api-key.test.ts, libs/hooks/src/hooks/index.ts]
---

## Goal
Create the React integration (`useApiKey`) over `ApiKeyService` — a plain-state hook (no tanstack-query, per spec Open decisions):
- State: `status: ApiKeyStatus`, `isLoading` (initial status fetch), `isSubmitting` (save in flight), `error: ApiKeyErrorCode | null` (error carries a code from task-10 onward; null in Slice 1).
- On mount **when authenticated** (`useSession()`), load `getApiKeyStatus()` into `status`; cancel/ignore on unmount to avoid a set-after-unmount race.
- `saveApiKey(rawKey): Promise<void>` — flips `isSubmitting`, calls `ApiKeyService.saveApiKey`, refreshes `status` on success. **Does not retain the raw key** in any hook state.

## Done criteria
- [x] Scenario @s1 (hook half): `saveApiKey` calls the service and updates `status` to the masked saved state on success.
- [x] Scenario @s2: `isSubmitting` is true while a save is in flight and false after it resolves (either outcome).
- [x] Scenario @s3: status loads on mount for an authenticated user; `hasKey` reflects the stored state.
- [x] The raw key is passed through to the service and **never** stored in hook state (test/inspection confirms no state holds it).
- [x] `useApiKey` exported via `libs/hooks/src/hooks/index.ts`; wraps the service, never the DAO.
- [x] `pnpm lint` + `pnpm check-types` + `pnpm test` green.

Note: `error` is typed as a bare `null` literal in Slice 1 (no `ApiKeyErrorCode` exists yet — that type lands in task-10); widens once task-10 adds it. Also found and fixed a real race (see tdd.md): the effect originally read `useSession()`'s transient `session: null` (before its own `getSession()` resolves) as "definitely unauthenticated" and prematurely flipped `isLoading` false; now gated on `useSession().isLoading` too.

## Notes
- Mirrors `useAuth`'s plain-state one-shot-mutation shape (`withSubmitting`-style bookkeeping) + a mount-time load like a light data fetch. tanstack-query is deferred by decision (spec Open decisions; risks R7).
- `removeApiKey` + the error-code wiring land in task-10 (Slice 2).
