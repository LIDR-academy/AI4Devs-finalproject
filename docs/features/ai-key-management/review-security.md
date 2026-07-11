# review-security.md — ai-key-management

## APPROVED

Full-review Round 3 of 3 (final). Fresh whole-feature security pass across the entire feature
surface (migrations, Edge Function, DAO/service/types, hooks, components, app screens) — zero
open findings.

## Verification performed

- Re-ran the Deno suite myself: `cd supabase/functions/manage-api-key && deno test --no-check=remote .` → **24/24 passed**.
- Grepped the whole feature surface for a raw key reaching `console.log`/`logEvent`/error
  messages/analytics — none found. `logger.ts:6-16`'s `ApiKeyLogEvent` type only ever carries
  `{ action, outcome, userId }`; `handle-save.ts:38,43`, `handle-remove.ts:26,29`, and
  `index.ts:133`'s catch-all log call all pass exactly that shape. No `analytics`/`track(` calls
  exist anywhere in this feature's files.
- Grepped the feature diff (`git diff main...HEAD`) for secret-shaped literals — only test
  fixtures (`sk-test-key`, `sk-replacement-key`) in `*.test.ts(x)` files; no real key, token, or
  `SUPABASE_SERVICE_ROLE_KEY` literal anywhere. `index.ts:109-111` reads all three Supabase
  values from `Deno.env.get`; the app's `.env.example` only exposes `EXPO_PUBLIC_SUPABASE_URL`/
  `EXPO_PUBLIC_SUPABASE_ANON_KEY`, never a service key. No non-example `.env` is tracked
  (`.gitignore:26-27` covers `.env`/`.env.*`).
- Confirmed `libs/study-buddy/src/components/api-key-gate/api-key-gate.tsx` matches the original
  `c0f60f8` approved content byte-for-byte (diffed against that commit) — Round 2's misattributed
  reversion finding stayed fixed; no new drift.
- Confirmed `libs/hooks/src/hooks/use-api-key.ts`'s `ApiKeyContext`/`ApiKeyProvider`: the shared
  context value carries only `{ status, isLoading, isSubmitting, error, saveApiKey, removeApiKey }`
  — never the raw key (never held in hook state at all; passed straight through to
  `ApiKeyService.saveApiKey(rawKey)` at `use-api-key.ts:114` and dropped). All consumers
  (`ApiKeyGate`, `ApiKeySettings`) are same-user, same-session screens under the same
  `(app)` route group — no cross-user leakage vector. Round 2's memoization fix (`use-api-key.ts:121-124`)
  is present and doesn't change what's exposed, only render frequency (a performance concern, not
  security).
- Re-checked both migrations: `user_ai_keys` has RLS enabled (`20260710223250_user_ai_keys.sql:35`)
  with a select-only, owner-scoped policy (`:39-42`) and no insert/update/delete grant to
  `authenticated`/`anon`; both `save_api_key`/`remove_api_key` are `security definer`, pin
  `search_path` (`:55`, `remove...sql:13`), derive `p_user_id` only from the Edge Function's
  authenticated caller (never client-supplied), and `revoke all ... grant execute ... to
  service_role` only (`:84-85`, `remove...sql:30-31`) — an authenticated client cannot invoke
  either function directly even with a valid JWT.
- Re-checked `index.ts`'s `authenticateCaller` (`:41-57`): derives `userId` from the caller's own
  JWT via `callerClient.auth.getUser()`, never trusts a client-supplied id; `dispatch` (`:65-106`)
  validates `body.action`/`isAiProvider(body.provider)`/`typeof body.apiKey === 'string'` before
  ever reaching a handler, returning `null` → 400 for anything malformed. Round 1/2's fixes
  (`isAiProvider` allow-list, `validate-key.ts:29,51,56` probe timeout) both confirmed present and
  unchanged since Round 2.
- All calls are to fixed, hardcoded HTTPS URLs (`validate-key.ts:23` OpenAI probe,
  `api-key-form.tsx:14`/`api-key-settings.tsx:14` OpenAI key-guidance link) — no user-controlled
  URL ever reaches `fetch`/`Linking.openURL`, so no SSRF/open-redirect surface.
- `ApiKeyStatus` (`libs/types/src/api-key.ts:12-16`) is compile-time shape-locked to exactly
  `hasKey`/`provider`/`updatedAt` — no key material can silently widen into the client contract.
- `pnpm audit --prod`: one pre-existing moderate advisory (`uuid` <11.1.1, transitive via
  `expo>@expo/cli>...>xcode`, build tooling only, not a runtime dependency this feature added or
  touches) — informational only, not critical, not introduced by this feature; not a finding.

## Not findings / informational
- The `uuid` moderate advisory above is a pre-existing transitive build-tool dependency unrelated
  to this feature; not blocking per the "known-critical advisories" bar.
- No new investigation was needed into the Round 2 suspicious tool-output messages (already
  closed out that round via `git fsck`/`git reflog` + direct file/test re-verification); nothing
  new of that kind surfaced this round.

## Findings
None.
