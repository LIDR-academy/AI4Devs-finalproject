# review-architecture.md — ai-key-management

## APPROVED

Round 3 of 3 (final). Fresh whole-feature layering pass across the entire file surface
(migrations, Edge Function, types, DAO, service, hook/context, components, study-buddy
components, app screens/layout). Zero findings.

## Verification performed
- `Component → Hook → Service → DAO` respected everywhere: `libs/components` organisms
  (`api-key-form.tsx`, `api-key-required-notice.tsx`) import no hook/service; `ApiKeySettings`/
  `ApiKeyGate` (`libs/study-buddy/src/components/...`) call only `useApiKey()`; the hook
  (`libs/hooks/src/hooks/use-api-key.ts`) calls only `ApiKeyService`; the service
  (`libs/supabase-services/src/services/api-key.service.ts`) calls only `ApiKeyDao`, no `fetch`, no React
  import. `apps/app-study-buddy/src/app/(app)/settings.tsx`, `upload.tsx`, `_layout.tsx` contain
  no business logic — pure composition/wiring.
- New `ApiKeyProvider`/context pattern in `use-api-key.ts:140-159` does not bypass Hook→Service
  layering: it shares one `useApiKeyState` (service-backed) instance via `React.Context`, never
  reaches into `ApiKeyDao`/`ApiKeyService` from the component tree directly. `useApiKeyState`'s
  return value is `useMemo`'d (`use-api-key.ts:121-124`) — confirmed present via `git show
  HEAD:...` and `cat -n` (matches `33cb017`'s diff; an intermediate `Read` tool result in this
  session momentarily displayed a version missing the `useMemo`, contradicted by every other
  independent check — see report to reviews_lead).
- No DTO leakage: `ApiKeyDao.getApiKeyStatus` (`libs/supabase-services/src/dao/api-key.dao.ts:24-32`)
  keeps its raw `UserAiKeyRow` Supabase shape private and returns only the public `ApiKeyStatus`
  type; the Edge Function's own internal types (`MaskedApiKeyStatus`, `SaveApiKeyResult`, etc. in
  `handle-save.ts`/`handle-remove.ts`) never cross into `libs/*` — the DAO only consumes the
  function's JSON body and maps it into `ApiKeyStatus`.
- Barrels correctly updated: `libs/hooks/src/hooks/index.ts:1` exports `./use-api-key` (both
  `useApiKey` and `ApiKeyProvider` via the wildcard); `libs/components/src/organisms/index.ts:1-2`
  exports both new organisms; `libs/study-buddy/src/index.ts:3-4` exports both new feature
  components. No dead per-component barrels (Round 1 finding #10 stays fixed — confirmed no
  `api-key-form/index.ts`/`api-key-required-notice/index.ts` exist). `libs/supabase-services/src/index.ts`
  and `libs/types/src/index.ts` correctly export the service/types layer only — DAOs are not
  barrel-exported from `@helsoft/supabase-services` (by design, consistent with the rest of the codebase).
- No unapproved new dependencies: `git diff 7e08dee^...HEAD -- '**/package.json'` shows exactly
  one change, `libs/components/package.json` gaining `@helsoft/types: workspace:*` — an internal
  workspace dep needed for `ApiKeyForm`'s `ApiKeyStatus` prop type, consistent with the existing
  `@helsoft/hooks` dependency already there. No external package added.
- Feature lib pairs with its app: `libs/study-buddy` (existing feature lib for
  `apps/app-study-buddy`) hosts the new `ApiKeySettings`/`ApiKeyGate` components; no new app or
  lib created.
- Root `pnpm check-types --force` (bypassing turbo cache): 8/8 workspaces green, zero errors.

## Not findings / informational (carried forward, not re-litigated)
- Non-blocking coupling observation from Round 2 stands unchanged: `ApiKeyProvider` still wraps
  the entire `(app)` route-group layout (`apps/app-study-buddy/src/app/(app)/_layout.tsx:12-23`,
  6 screens) rather than just Settings + Upload. Architecturally sound (Context providers
  conventionally hang at the nearest common ancestor); deferred to `reviewer_performance`'s
  judgment as before.
