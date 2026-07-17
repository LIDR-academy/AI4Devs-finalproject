# Security review — ai-lesson-generation

**Verdict: APPROVE**

Scope: `git diff b05c083..HEAD` (commits 8e7ffb6, e97c71f, 406d39c, 79d86f5). CI handed off clean; 2 pre-existing out-of-scope byte-identical test failures not reviewed here.

## `get_api_key` RPC (`supabase/migrations/20260713120000_get_api_key.sql`)
`security definer` + `set search_path = public, vault, pg_temp` (L21-22), matches `save_api_key`/`remove_api_key` precedent. `revoke all ... from public` + `grant execute ... to service_role` only (L33-34) — no grant to `authenticated`/`anon` anywhere in migrations (grep-confirmed). Matches R6 exactly.

## `supabase/functions/generate-lesson/index.ts`
- Auth gate (`Authorization` header + `callerClient.auth.getUser()`, `:132-150`) runs before any `documents`/`document_images` read (`:168-182`).
- Reads use `callerClient` (RLS-scoped), not `adminClient`. RLS scopes both tables to `auth.uid() = user_id` — cross-tenant `documentId` resolves to `document_not_ready` (422), not a leak. Storage download also caller-JWT scoped.
- `adminClient` used only for `adminClient.rpc('get_api_key', ...)` (`:186`, grep-confirmed sole use). `p_user_id: user.id` from the caller's own session, never the request body (client only supplies `documentId`/`composition`, `:156-166`).
- Key never leaves server: flows only into `runGeneration`/`runVisionPlacement` → `createGroq({ apiKey })`. Zero `console.*` in the diff (grep-confirmed). Never in response/error payload (`mapGenerationError` returns only `{ errorCode, status }`, asserted by anti-leakage test `lesson-generation.errors.test.ts:81-85` @s8 with a fake secret in the cause message).
- Input validation: `documentId` type-checked, `composition` checked against closed set before use (`:59-60,163-165`); malformed JSON caught. `documentId` only used in parameterized query builder — no injection surface.

## `libs/supabase-services/src/dao/lesson-generation.dao.ts`
`functions.invoke` sends only `{ documentId, composition }` (`:15-17`, asserted by DAO test `:34-36`) — no key/content/userId. Hook reads `session?.user.id` only to gate client-side; never part of the wire payload.

## Provider swap (OpenAI → Groq)
`AiProvider` narrowed to `'groq'`, allow-list updated in lockstep, closed-list validation preserved. Display name/guidance URL updated to Groq console (plain HTTPS). Test fixtures updated only; `handle-save.ts`'s no-raw-key-logging behavior unmodified. OpenAI validation-probe removal is pre-existing/out of scope (already removed prior to this feature).

## OWASP Top 10
- **A01**: RLS confirmed on `documents`/`document_images`/`user_ai_keys`; all 3 RPCs `service_role`-only. No cross-tenant path.
- **A02**: key remains Vault-encrypted at rest, decrypted only inside Edge Function via `service_role`.
- **A03**: all DB access parameterized; no string-concat SQL. LLM output validated against strict zod schema; failure → atomic `generation_failed`, never partial deck.
- **A05**: no new CORS/permissive config; `Authorization` required unconditionally.
- **A09**: zero `console.*` touching key/PII in new/changed code.
- **PII**: only opaque `user.id` UUID used for RPC/RLS; none in logs or prompt/response contract.
- No new deep links/webviews; new external URL is a static HTTPS guidance link via existing mechanism. No new dependency advisories in scope.

## Summary
No secrets, unvalidated trust-boundary inputs, or logging/PII leaks. `get_api_key` RPC matches R6 pattern exactly. Two-client split (caller-JWT reads, service-role scoped strictly to key RPC) implemented as documented; key never reaches client/error payload/logs. Provider swap clean, no validation/storage weakening. No blockers.
