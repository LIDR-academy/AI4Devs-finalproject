# Risks — plan-entitlements-key-routing

## Dependencies
- **R6 BYOK:** available — Vault-backed `user_ai_keys` and service-role-only `get_api_key`.
- **R2 generation:** available — authenticated `generate-lesson` Edge Function using Groq through Vercel AI SDK.
- **Auth:** available — Supabase Auth; new profile trigger depends on `auth.users`.
- **Operations:** blocked until `PLATFORM_GROQ_API_KEY` is configured in each target Supabase environment.

## Risks

### R1 — Missing profiles for existing users
The signup trigger only covers future users; current auth users could produce client errors and generation failures.

**Mitigation:** migration backfills one `free` profile per existing `auth.users` row before enabling runtime reads; unique PK makes reruns safe. Test existing-user backfill and new-user trigger.

### R2 — Privilege escalation through profile writes
If authenticated clients can update `profiles.plan`, free users can select the platform key.

**Mitigation:** authenticated role receives select-own only; no update/insert/delete policy or grant. Plan changes remain dashboard/service-role operations. Test denied client mutation.

### R3 — Client/server entitlement drift
Cached client state may lag a dashboard plan change.

**Mitigation:** UI reload/retry fetches current plan for UX, while generation always reads `profiles.plan` live and ignores client plan/key-source inputs.

### R4 — Wrong-key fallback leaks cost or breaks downgrade behavior
A paid request might accidentally call Vault, or a missing platform key might fall back to the user's key.

**Mitigation:** mutually exclusive resolver with tests asserting which dependency is and is not called. Never fall back between key sources.

### R5 — Platform secret absent or misconfigured
Paid demo generation can fail after deployment if the environment secret is missing, empty, or invalid.

**Mitigation:** return `platform_key_unavailable` before a provider call for a missing/empty secret and normalize configured-but-invalid/unusable platform credentials to the same operator-facing code. Never show BYOK guidance or fall back to a user key. Add deployment checklist/manual smoke for each environment.

### R6 — Key disclosure in diagnostics
Adding a second key source increases chances of logging key material or raw provider failures.

**Mitigation:** pass keys only to provider construction; never include them in response/error objects or logs. Retain redacted error mapping and add assertions around observable output.

### R7 — Duplicate key-status requests
`useEntitlements()` composing `useApiKey()` could bypass the shared provider and fetch status repeatedly.

**Mitigation:** keep `ApiKeyProvider` above plan-sensitive screens and consume its context. Test one status request across entitlement consumers.

### R8 — Loading/error UI flashes unauthorized controls
Independent plan and key requests can briefly expose free or paid controls.

**Mitigation:** entitlement loading spans both dependencies; render neither upload/create nor key settings until resolved. Errors hide all plan-sensitive controls and expose retry.

### R9 — Edge Function logic lacks direct Deno CI coverage
The repository tests pure Edge decisions through mirrored Jest modules; runtime wiring can still diverge.

**Mitigation:** keep mirror changes atomic and reviewed together; manually invoke deployed free, paid, missing-user-key, and missing-platform-key paths before demo.

### R10 — Scope expansion into billing, ads, or limits
Plan infrastructure may invite unrelated paid-tier work and threaten the demo timeline.

**Mitigation:** derive `showAds` only; add no ad consumer, billing, admin UI, metering, or usage caps.
