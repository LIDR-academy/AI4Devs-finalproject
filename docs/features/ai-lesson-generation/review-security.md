# Security review — ai-lesson-generation

**Verdict: APPROVE**

Scope: `git diff b05c083..HEAD` (commits 8e7ffb6, e97c71f, 406d39c, 79d86f5). CI handed off clean
(lint/check-types clean; two pre-existing, out-of-scope, byte-identical-at-base test failures
noted by the lead — not reviewed here).

## Focus area 1 — `get_api_key` RPC (`supabase/migrations/20260713120000_get_api_key.sql`)
- `security definer` (L21), `set search_path = public, vault, pg_temp` (L22) — matches
  `save_api_key`/`remove_api_key`'s established pattern exactly (`20260710223250_user_ai_keys.sql:54-55`,
  `20260710232757_remove_api_key.sql:13`).
- `revoke all on function public.get_api_key(uuid) from public` (L33) + `grant execute ... to
  service_role` only (L34) — no grant to `authenticated`/`anon` anywhere in the migrations
  directory (`grep -rn "grant execute" supabase/migrations/` returns only the three RPC grants,
  all to `service_role`). An authenticated client cannot invoke this even with a valid JWT
  (OWASP A01 — broken access control — not applicable here; control confirmed present).
- No other migration re-grants broader execute rights on this function (no
  `alter default privileges` / blanket `grant execute on all functions` found repo-wide).
- Verdict: matches the R6 precedent, no deviation, no finding.

## Focus area 2 — `supabase/functions/generate-lesson/index.ts`
- Auth gate before any data read: `Authorization` header checked first (`index.ts:132-134`),
  then `callerClient.auth.getUser()` is awaited and `user` checked (`index.ts:145-150`) — both
  gates run *before* the first `documents`/`document_images` read (`index.ts:168-182`). Matches
  OWASP ASVS/MASVS session-validation control.
- `documents`/`document_images` reads use `callerClient` (JWT-forwarding, RLS-scoped) (`index.ts:168-182`),
  not `adminClient`. `documents`/`document_images` RLS (`20260710202811_pdf_extraction.sql:51-77`)
  scopes both tables to `auth.uid() = user_id` (directly or via the parent-document join), so a
  caller-supplied `documentId` for another user's document resolves to no row →
  `document_not_ready` (422), not a cross-tenant read (A01 mitigated).
  `callerClient.storage.from(PDF_IMAGES_BUCKET).download(...)` (`index.ts:228-230`) also uses the
  caller-JWT client, correctly staying inside the caller's own storage-policy prefix
  (`pdf_images_select_own`, `20260710202811_pdf_extraction.sql`).
- `adminClient` (service-role) is used **only** for `adminClient.rpc('get_api_key', ...)`
  (`index.ts:186`) — grepped the whole function for `adminClient` usage; this is its one call
  site.
- `p_user_id: user.id` (`index.ts:186`) comes from the caller's own authenticated session
  (`callerClient.auth.getUser()` result), never from the request body — the client-supplied
  `body.documentId`/`body.composition` are the only fields read off `req.json()`
  (`index.ts:156-166`); no client-suppliable user/id field reaches `get_api_key`.
- Key never leaves the server: `keyRow.api_key` (decrypted, `index.ts:187-188`) flows only into
  `runGeneration(keyRow.api_key, prompt)` (`index.ts:209`) and `runVisionPlacement(keyRow.api_key,
  ...)` (`index.ts:243`), both of which hand it straight to `createGroq({ apiKey })` (`index.ts:65,106`).
  Grepped the function + `_shared/*.ts` for the key variable and for `console.*` — zero
  `console.log`/`console.error`/`console.*` calls exist anywhere in the diff (confirmed via
  `git diff b05c083..HEAD -- supabase/functions libs/... | grep "console\."` → no hits besides
  the unrelated `console.groq.com/keys` guidance-URL string). The key is never placed in the
  response body (`jsonResponse(lesson, ...)` / `errorResponse(errorCode, ...)` at `index.ts:53-57,260,265`
  only ever serialize the typed deck or `{ errorCode }`) and never included in a thrown error
  passed to the client (`mapGenerationError(cause)` at `index.ts:264` returns only
  `{ errorCode, status }` — see next point).
- Raw Groq/Supabase errors are never passed through: `mapGenerationError` in both
  `supabase/functions/generate-lesson/_shared/lesson-generation.errors.ts` and its Jest-tested
  mirror `libs/supabase-services/src/services/lesson-generation.errors.ts` are byte-for-byte
  logic matches (same branches: `GenerationTimeoutError`→`timeout`/504,
  `GenerationSchemaError`→`generation_failed`/502, `statusCode` 401/403→`invalid_key`/401, 429→
  `rate_limited`/429, else→`generation_failed`/502) and both return only `{ errorCode, status }`
  — the Jest test `lesson-generation.errors.test.ts:81-85` explicitly asserts
  `Object.keys(mapGenerationError(cause))` is exactly `['errorCode', 'status']` for a cause
  carrying a fake secret in its `message` (`'Bearer sk-super-secret-key rejected'`), i.e. an
  explicit anti-leakage regression test (@s8). Good control; no finding.
- Input validation: `body.documentId` type-checked (`typeof body.documentId !== 'string'`) and
  `body.composition` checked against a closed set via `isLessonComposition` (`index.ts:59-60,163-165`)
  before use — malformed JSON body also caught (`index.ts:157-161`). `documentId` is only ever
  used in a parameterized Supabase query builder call (`.eq('id', documentId)`), not raw SQL —
  no injection surface (OWASP A03).

## Focus area 3 — `libs/supabase-services/src/dao/lesson-generation.dao.ts`
- `functions.invoke('generate-lesson', { body: { documentId, composition } })` (`lesson-generation.dao.ts:15-17`)
  — only these two fields are sent; no key, no page/image content, no `userId`. Confirmed by the
  DAO's own test asserting the exact invoke args (`lesson-generation.dao.test.ts:34-36`). The
  hook (`use-lesson-generation.ts:79-81`) reads `session?.user.id` only to gate client-side
  (`LessonGenerationService.generate(request, userId)` — `!userId` throws `unauthenticated`
  before any network call, `lesson-generation.service.ts:73`); that `userId` is never part of
  `GenerateLessonRequest` and never reaches the DAO/wire — the server independently derives its
  own `user.id` from the JWT (focus area 2). No finding.

## Focus area 4 — Provider swap (OpenAI → Groq)
- `libs/types/src/api-key.ts`, `supabase/functions/manage-api-key/provider.ts`: `AiProvider`
  narrowed to `'groq'`, `AI_PROVIDERS` allow-list updated in lockstep — the closed-allow-list
  validation pattern (`isAiProvider`) is preserved, no weakening.
- `libs/supabase-services/src/services/api-key.service.ts`: `DEFAULT_PROVIDER` →
  `'groq'` only; no other logic in this file touched.
- `libs/study-buddy/src/components/api-key-settings/api-key-settings.tsx`: display name +
  guidance URL updated to Groq's own console (`https://console.groq.com/keys`, plain HTTPS,
  opened via `openURL` — no new webview/deep-link surface introduced).
- `supabase/functions/manage-api-key/handle-save.test.ts` / `provider.test.ts`: fixture-only
  updates (`'openai'`→`'groq'`); `handle-save.ts`'s own logic (the file that owns the "never log
  the raw key" behavior, still asserted by its own untouched test at
  `handle-save.test.ts:23-31`) is unmodified in this diff.
- The OpenAI validation-probe removal is pre-existing/out of scope (spec.md Open decision #1,
  removed 2026-07-13 prior to this feature) — confirmed no probe-related code exists in the
  current `manage-api-key` diff; consistent with the documented trade-off (`invalid_key` now
  surfaces at generation time, not save time). No new finding.

## Focus area 5 — OWASP Top 10 / general
- **A01 Broken access control**: RLS confirmed on `documents`/`document_images`/`user_ai_keys`;
  `get_api_key`/`save_api_key`/`remove_api_key` all `service_role`-only. No cross-tenant read
  path found.
- **A02 Cryptographic failures**: key remains Vault-encrypted at rest (unchanged by this story);
  decrypted only inside the Edge Function via `service_role`, consistent with R6's documented
  model (spec.md Open decision #6, risks.md R5/R7).
- **A03 Injection**: all DB access goes through the Supabase client query builder / RPC
  (parameterized); no string-concatenated SQL. LLM output is validated against a strict `zod`
  deck schema (`lesson-generation.schema.ts`) before use, and a schema/invariant failure throws
  `GenerationSchemaError` → atomic `generation_failed`, never a partially-assembled deck
  (mitigates untrusted-model-output injection into the typed deck).
- **A05 Security misconfiguration**: no new CORS/permissive config found; function requires
  `Authorization` header unconditionally.
- **A09 Logging failures / sensitive-data exposure**: grepped the entire diff for
  `console.*`; zero hits touching the key or PII. No `userId`/email/key logged anywhere in the
  new/changed code (only a structural `{ action, outcome, userId }` log shape in the *pre-existing,
  untouched* `handle-save.ts`, which is out of this diff's scope and already had its own
  no-raw-key-in-logs test).
- **PII**: no PII (email, name, etc.) enters any log or the deck-generation prompt/response
  contract beyond the opaque `user.id` UUID used solely for the RPC call and RLS scoping.
- No deep links / webviews introduced; the one new external URL
  (`https://console.groq.com/keys`) is a static HTTPS guidance link opened via the existing
  `openURL` mechanism (unchanged pattern from R6's OpenAI link).
- No new third-party dependency advisories surfaced in this review's scope (`@ai-sdk/groq`,
  `ai`, `zod` are Deno `npm:` specifiers inside the Edge Function only, consistent with
  risks.md's documented boundary; dependency-advisory scanning is out of this review's grep-based
  protocol).

## Summary
No secrets, unvalidated trust-boundary inputs, or logging/PII leaks found. The new
service-role-only `get_api_key` RPC matches R6's established, reviewed pattern exactly. The Edge
Function's two-client split (caller-JWT for RLS-scoped reads, service-role scoped strictly to the
key RPC) is implemented as documented, `p_user_id` is server-derived only, and the decrypted key
never reaches the client contract, an error payload, or a log call — the errors.ts anti-leakage
test is a genuinely strong regression guard here (@s8). The provider swap is a clean, contained
type/copy/default change with no weakening of validation or storage. No blockers, no findings.
