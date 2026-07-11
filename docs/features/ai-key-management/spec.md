---
feature: ai-key-management
story: user-stories/ai-key-management.md
status: approved
---

> **Human gate (approved):** Encryption = Supabase Vault (default, as specced). Provider = OpenAI (default, as specced). Hosted-project Vault/Edge Functions availability was **not confirmed** at the gate — `implementator` must verify this early in Slice 1 (task-1/task-2) and fall back to the documented `pgcrypto`/`pgsodium` column mechanism (Open decision 1) if Vault is unavailable, without blocking the rest of the build.

# Spec — ai-key-management

## Summary
Bring-your-own AI key management for the AI Study Buddy free tier (PRD R6). An authenticated user saves their own AI provider API key inline on the existing account/profile screen; the key is validated by a Supabase Edge Function (a lightweight, no-cost provider auth probe) **before** it is persisted, stored encrypted server-side scoped to that user, and **never returned to the client after save, never rendered, and never written to server logs**. The user can update or remove the key. When a user with no key saved reaches the lesson-generation entry point, a guard rail surfaces an inline "an API key is required" message with a link to the account screen instead of failing silently or crashing.

This story owns **only** save / update / remove of the key plus the "no key" guard rail. It does **not** implement lesson generation (PRD R2/R2.1) — generation is a separate story that consumes the key this story manages. The design deliberately keeps the encrypted-key store and the Edge Function proxy pattern reusable so R2 can read the key server-side at call time without rework, and so a future paid tier could swap in a platform-managed key without touching the proxy (PRD Future Considerations).

## User stories
- As a **learner on the free tier**, I want **to save my own AI provider API key and have it used server-side only**, so that **I can generate lessons with my own key without it ever being exposed to my device, logs, or other users**.
- As a **learner**, I want **to update or remove my stored key**, so that **I can rotate a rolled key or stop using the app with my credentials on file**.
- As a **learner with no key set**, I want **a clear prompt (with a link to where I add one) when I try to generate**, so that **I understand why generation can't run instead of hitting a silent failure**.

## Context already in place (this feature builds on, does NOT rebuild)
- **Auth + session** — `useSession()` (`@helsoft/hooks`) and Supabase Auth (login-and-logout story) give us `auth.uid()`; every query/row here is scoped to the authenticated user. The account screen is only reachable behind the `Stack.Protected guard={!!session}` app group.
- **Account/profile screen** — the story's "account/profile screen" maps to the existing **Settings screen** (`apps/app-study-buddy/src/app/(app)/settings.tsx`), which already composes `<LanguageSettings />` + `<SignOut />`. This feature adds `<ApiKeySettings />` to that same thin shell (no new route/screen for v1).
- **Generation entry point** — the Upload screen (`apps/app-study-buddy/src/app/(app)/upload.tsx`, currently a stub) is where a learner begins the (future R2) generation flow; the guard rail is surfaced there.
- **Layering + precedents** — `Component → Hook → Service → DAO → Supabase` (`.agents/rules/hooks-service-dao.mdc`). We mirror the login backbone: a Supabase DAO (`AuthDao`), a normalizing service with a typed error code in `@helsoft/types` (`AuthService` + `AuthErrorCode`), a plain-state one-shot-mutation hook (`useAuth`), a presentational organism in `@helsoft/components` (`LoginForm`) driven by a feature-wiring component in `@helsoft/study-buddy` (`SignInForm`).
- **Building blocks** — `TextField` (molecule, has `secureTextEntry` passthrough + `error`/`supportingText` + `accessibilityInvalid`), `Button` (atom), `Card`/`ScreenContainer`, `Dialog` (for remove confirmation), `useLocalization()`/`t()`, the 4 locale bundles (en/es/pt/de) and the `migration-coverage.test.ts` key-alignment guard.

What this feature **adds**: a `user_ai_keys` table + Supabase Vault secret + RLS (first migration in the repo); the `manage-api-key` Edge Function (first Edge Function in the repo — validate-then-store + remove, server-side only); `AiProvider`/`ApiKeyStatus`/`ApiKeyErrorCode` types; `ApiKeyDao` + `ApiKeyService` + `useApiKey`; the `ApiKeyForm` organism and `ApiKeyRequiredNotice` component; the `ApiKeySettings` + `ApiKeyGate` feature-wiring; the `settings.apiKey.*` i18n strings.

## Acceptance criteria (Given/When/Then)
- **AC1** — Given I am authenticated with no key saved and I am on the account screen, When I enter a key and submit, Then the Edge Function test-validates it against the provider, and on success the key is stored encrypted and scoped to me and the screen shows a masked "key saved" state (never the raw key). *(→ @s1, @s2, @s13)*
- **AC2** — Given a submitted key that fails the provider test call (invalid/revoked), When I submit, Then save is rejected, I see a clear message explaining the key didn't validate, and no key is persisted. *(→ @s6)*
- **AC3** — Given a valid key but the server/edge cannot be reached (transport/timeout/unexpected failure), When I submit, Then I see a retryable "couldn't reach the server" message and no key is persisted; When the server is reachable again and I resubmit, Then the key validates, is stored, and the masked "key saved" state is shown. *(→ @s7)*
- **AC4** — Given I already have a key saved, When I enter a new key and submit, Then the same validate-then-store flow runs and the new key replaces the old one. *(→ @s4)*
- **AC5** — Given I have a key saved, When I choose to remove it and confirm, Then the stored key is deleted and the account screen returns to the no-key state. *(→ @s8)*
- **AC6** — Given I have a key saved, When I confirm removal but the removal request fails, Then I see a readable error, my saved key remains intact, and the screen does not crash. *(→ @s9)*
- **AC7** — Given I am authenticated with no key saved, When the account screen loads, Then I see an input to enter a key with guidance on where to get one, and the submit control is disabled until I enter a non-blank key (a blank/whitespace-only key is never submitted — see Open decisions). *(→ @s5)*
- **AC8** — Given a saved key, When the account screen loads or reloads, Then the client only ever receives a masked / boolean "key present" indicator — the raw key value is never sent to or rendered by the client after the initial save. *(→ @s3, @s11)*
- **AC9** — Given any key save, update, remove, or generation-time read, Then the raw key value never appears in server logs. *(→ @s12)*
- **AC10** — Given I have no key saved, When I attempt to generate a lesson (R2), Then generation fails gracefully with an inline message explaining a key is required plus a link to the account screen — no crash, no silent failure. *(→ @s10)*
- **AC11** — Given I have a valid key saved, When generation runs (R2), Then the Edge Function reads the key server-side to make the provider call; the client only triggers generation and at no point holds or transmits the raw key itself. *(→ @s11, @s13)*
- **AC12** — Given I am on the account screen and the generation-entry guard, Then the key input exposes an accessible label, the Save/Replace/Remove controls and the notice action expose a button role, and a save or removal error is announced to assistive technology. *(→ @s14)*
- **AC13** — Given the app locale is a supported language, When I view the key manager and the "key required" guard message, Then all labels, placeholders, button text, guidance, and error messages render from the active locale bundle (no hardcoded strings). *(→ @s15)*

> **AC11 scope note.** Actual lesson generation is PRD R2, a separate story. This story delivers AC11 as a **structural guarantee**, verified here (not the generation call itself): there is no client-facing API that returns the raw key, the stored key is only decryptable by the Edge Function's service role, and the "key present" read exposes a masked/boolean status only. R2 will trigger its own Edge Function, which reads the key from the same store server-side.

## Architecture & data flow
```
Account screen (settings.tsx)
  └─ ApiKeySettings            (study-buddy — wires hook + i18n to the organism)
       └─ ApiKeyForm           (components — presentational: 4 states)
            └─ useApiKey        (hooks — plain state: status, isLoading, isSubmitting, error)
                 └─ ApiKeyService (services — validate input, normalize errors)
                      └─ ApiKeyDao (services — Supabase DAO)
                           ├─ save/remove → getSupabase().functions.invoke('manage-api-key')
                           │                     └─ Edge Function (Deno, service role):
                           │                          1. provider auth probe (validate)
                           │                          2. on success: write key → Vault secret
                           │                          3. upsert user_ai_keys metadata row
                           │                          4. return masked status (never the key)
                           └─ status  → getSupabase().from('user_ai_keys').select(non-secret cols)  [RLS: auth.uid() = user_id]

Upload screen (generation entry)
  └─ ApiKeyGate (study-buddy)  → if !hasKey renders ApiKeyRequiredNotice (link → account screen)
```
- The raw key travels from the input field to the Edge Function **once, over TLS, in the invoke body** at save time. That transmission is unavoidable (the server must receive the key to validate/store it). After the call resolves the component clears its local input state; **no hook/service/DAO/client state retains the raw key**, and no client read ever returns it. AC11 ("client never holds the key") is specifically about **generation** time (R2 triggers the function with no key in the request).
- The provider call to validate the key happens **inside** the Edge Function (Deno). There is therefore **no external-API DAO in the client libs** for this story — the only client DAO is a Supabase DAO (`functions.invoke` + a metadata `select`).

## UI states (ApiKeyForm organism)
The 4-state model mapped to an inline key manager. "Empty" = the no-key state; "Content" = the key-saved masked state.

| State | Trigger | Notes |
|---|---|---|
| Empty | Authenticated, status loaded, `hasKey === false` | Key input (secure entry) + **Save** (disabled until a non-blank key is entered) + "where to get a key" guidance link. No key value shown. |
| Content | Status loaded, `hasKey === true` | Masked "Key saved" indicator (provider name + last-updated; **no characters of the key**) + **Replace** (re-reveals the input) + **Remove** (opens confirm dialog). Raw key never shown. |
| Loading | Initial status fetch in flight (`isLoading`), or a save/remove in flight (`isSubmitting`) | On fetch: skeleton/spinner in place of the control. On submit: input + buttons disabled, submit shows a progress label. Resolves to Content / Empty / Error. |
| Error | Save rejected (`invalid_key`) or transport/edge failure (`network_error`), or remove failed | Inline error message with guidance; input stays editable; retry = resubmit. Error is announced to assistive tech. On invalid/network the prior state is preserved (nothing persisted). |

## Error & security contract
`ApiKeyService` normalizes every failure into a typed `ApiKeyErrorCode` (discriminated type in `@helsoft/types`), so the UI never branches on raw Supabase/Edge errors. Copy is not part of the contract — the UI maps `code` → an i18n key.

| Code | Cause | User-facing message (i18n key) | Retry |
|---|---|---|---|
| `invalid_key` | Edge Function's provider auth probe returns 401/403 (invalid or revoked key). Nothing is persisted. | `settings.apiKey.error.invalidKey` → "That key didn't validate. Check it and try again." | Edit + resubmit |
| `network_error` | Transport/edge/timeout failure, offline, or any unexpected exception (safer default — never claim "invalid" when we don't know). | `settings.apiKey.error.network` → "Couldn't reach the server. Try again." | Resubmit |
| `validation_error` | Client-side pre-check fails (blank/whitespace-only key) — never reaches the provider. Defensive backstop only (see Open decisions): the UI disables submit until a non-blank key is entered (AC7/@s5), so this code is unreachable through the form. | field-level `settings.apiKey.error.empty` → "Enter your API key." | Fix input |

Security guarantees (enforced across layers, verified per the Testing map in `gherkin-scenarios.md`):
- **Encrypted at rest, server-only decryption.** The key is stored as a **Supabase Vault** secret; the plaintext is only readable via the privileged decrypted view, accessible to the Edge Function's **service role** — never to `anon`/`authenticated`, so the client physically cannot read it even with a valid JWT.
- **RLS.** `user_ai_keys` rows are readable only where `auth.uid() = user_id`; all writes (insert/update/delete) go through the service-role Edge Function, not the client.
- **No key material in the client contract.** `ApiKeyStatus` carries `{ hasKey, provider?, updatedAt? }` only — no key characters, not even a partial/last-4 hint.
- **No key in logs.** The Edge Function redacts the raw key from every log statement on save, update, remove, and (future) generation read.
- **No enumeration of storage internals.** Errors return a normalized `code`, never a raw provider/Supabase/Vault error.

## Analytics events
None — out of scope for MVP per the story.

## Feature flags
None — out of scope for MVP per the story. (The `AiProvider` union + service-role proxy are the seam a future paid tier / additional provider slots into — see Open decisions — but no runtime flag ships here.)

## Out of scope / non-goals
- **Lesson generation (R2/R2.1).** This story does not call the provider to generate anything; it only validates a key on save and guards the generation entry point. The generation Edge Function is R2.
- **A dedicated settings/profile screen or key-management screen.** The key lives inline on the existing Settings screen.
- **Multiple providers / a provider picker in the UI.** v1 targets a single provider (see Open decisions); the type/schema keep the seam open, the UI does not expose a choice.
- **Paid / platform-managed key tier, usage metering, billing.** Future Considerations; the proxy is kept key-source-agnostic but nothing paid ships.
- **Key rotation reminders, expiry tracking, multi-key storage.** One key per user.
- **Analytics & feature flags.** Not in MVP.

## Open decisions (resolved with rationale)
- **[Story open decision 1 — encryption mechanism] Decision: Supabase Vault** (per-user secret in `vault.secrets`, referenced by `user_ai_keys.secret_id`; app table holds non-secret metadata only). — **why:** Vault is Supabase's current, recommended secret store (pgsodium-backed authenticated encryption with the encryption key held outside the DB in Supabase infra). Its decrypted view is reachable only by the **service role**, so an `authenticated` client cannot read plaintext even with a valid JWT — this maps exactly to "raw key never returned to client / read server-side at call time." Column-level pgsodium TCE is **not** chosen: Supabase has deprecated/discouraged TCE in favor of Vault, and a decrypting view is easier to mis-scope under RLS. **Fallback (flagged, R-enc):** if Vault proves unavailable/awkward on the hosted project, store the key in a `bytea` column encrypted via `pgcrypto`/`pgsodium` with a symmetric key provided to the Edge Function as a Supabase secret (env), so decryption still cannot happen client-side. Confirm at the gate / R1-style spike before Slice 1 build.
- **[Story open decision 2 — validation call] Decision: a no-cost provider auth probe — default `GET https://api.openai.com/v1/models` with `Authorization: Bearer <key>`.** 2xx → valid; 401/403 → `invalid_key` (rejected, nothing stored); anything else / thrown → `network_error`. — **why:** the story requires a *lightweight* validation that does **not** implement generation (R2). Listing models is free (consumes no tokens), fast, and purely checks that the key authenticates — the minimal, no-cost probe. It runs inside the Edge Function via a plain `fetch`; the Vercel AI SDK (PRD R2) is a generation concern and is not needed to validate. Provider default is **OpenAI** because the PRD's AI SDK integration has OpenAI as its canonical default and it offers cheap vision-capable models (needed later for R2 image placement); the probe is wrapped behind a small `validateKey(provider, key)` seam so another provider (e.g. Anthropic — its cheapest analogous probe is a `max_tokens: 1` message, which is not free, making OpenAI's `/v1/models` strictly the better no-cost probe) can be slotted in without reworking the flow. **Flag:** if the project pins a different default provider at the gate, swap the probe endpoint only.
- **[Story open decision 3 — `validation_error` is a defensive backstop] Decision: `ApiKeyService.saveApiKey` rejects a blank/whitespace-only key (`validation_error`) before any round-trip, but this path is exercised and asserted only at the **service layer** — it has no end-to-end/UI scenario, because the reachable guard is `ApiKeyForm`'s Empty-state disabled submit (AC7 / @s5).** — **why:** the Empty state disables **Save** until a non-blank key is entered (AC7/@s5), so `onSave`/`handleSubmit` can never fire with a blank key through the UI; a mirrored UI-level `validation_error` branch would be unreachable dead code no test could legitimately drive (TDD Three Laws — no production code without a failing test). The service's own blank-key rejection stays as the **defensive backstop** for any future caller that bypasses the form, tested in `api-key.service.test.ts`. This mirrors the login precedent, where `AuthService.signIn`'s empty-password `validation_error` throw is the service-level backstop behind the same disabled-submit guard. The `settings.apiKey.error.empty` i18n key (task-13) stays defined for that backstop and for any future consumer of `ApiKeyForm`'s `error` prop. **This does not re-open Open decisions 1 or 2.**
- **Decision: the presentational `ApiKeyForm` is an organism in `@helsoft/components`; the wiring (`ApiKeySettings`, `ApiKeyGate`) lives in `@helsoft/study-buddy`; app screens stay thin shells.** — **why:** mirrors the established `LoginForm`/`SignInForm` and `LanguageSelector`/`LanguageSettings` split; keeps business logic out of `apps/*` per the layering rule.
- **Decision: `useApiKey` is a plain-state hook (`useState` for status/isLoading/isSubmitting/error), not tanstack-query.** — **why:** the status read is a single lightweight boolean fetch on one screen and save/remove are one-shot mutations with a server side effect — the same shape as `useAuth`, which deliberately deferred tanstack-query. The rule reserves tanstack-query for data-fetching hooks "when first needed"; a single non-cached status read does not yet justify adding the dependency. Revisit when a second cached query appears. (Flagged in risks as a deferral, not a gap.)
- **Decision: the masked "key saved" state shows provider + last-updated only — no characters of the key (no last-4 hint).** — **why:** the strictest reading of "never the raw key"; persisting or displaying any portion of a secret is an avoidable exposure. A boolean/provider indicator fully satisfies "masked state" and is what `ApiKeyStatus` carries.
- **Decision: save/validate AND remove both route through the service-role Edge Function; the client's only direct DB access is the RLS-scoped metadata `select` for status.** — **why:** both writes touch the Vault secret (a privileged operation the `authenticated` role must not perform directly); centralizing them in the function keeps the secret store off-limits to the client and keeps the "no key in logs" redaction in one place.
- **Decision: the guard rail is a reusable `ApiKeyGate` (renders `ApiKeyRequiredNotice` when `hasKey === false`) wired at the generation entry point (Upload screen).** — **why:** R2 will build the generation UI inside this gate; delivering the gate now satisfies AC10 without implementing generation and gives R2 a ready-made "key required" surface. While status is loading the gate renders neither branch (no premature "key required" flash — see @s10). The notice links to the account screen (`/settings`).
- **Decision: removing a key uses a confirmation dialog (reuse `Dialog`).** — **why:** removal is destructive (the user must re-enter and re-validate a key to generate again); a confirm affordance matches the `SignOut` precedent for irreversible account actions.
