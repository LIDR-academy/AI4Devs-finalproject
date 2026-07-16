---
feature: plan-entitlements-key-routing
story: user-stories/done/plan-entitlements-key-routing.md
status: approved
---

# Spec — plan-entitlements-key-routing

## Summary
Client entitlements and generation key routing come from live `plans` flags joined via `profiles.plan_id`. Capability checks never branch on plan name; seeded `free`/`paid` rows set `use_platform_key`, `show_ads`, `show_key_settings`, and `can_create_without_key`.

## User stories
- As a free learner, I want clear BYOK gating so I know when generation is available.
- As a paid learner, I want generation without key setup so managed inference feels seamless.
- As the service owner, I want server-side key routing so crafted clients cannot consume the platform key.

## Acceptance criteria
See [`gherkin-scenarios.md`](./gherkin-scenarios.md). Each `@s` scenario is an acceptance criterion.

## UI states
| State | Trigger | Plan-sensitive UI |
|---|---|---|
| Loading | Plan or key status unresolved | Hide upload/create and key settings |
| Content | `can_create_without_key` or saved key | Show create/upload; key settings when `show_key_settings` |
| Empty | Needs key (`!can_create_without_key` and no key) | Hide create/upload; show key setup guidance |
| Error | Plan read fails or profile is missing | Hide plan-sensitive controls; show error + retry |

## Analytics events
None in v1.

## Feature flags
None. `profiles.plan_id` → `plans` flags is the switch and applies without redeploy.

## Out of scope / non-goals
- Billing, Stripe, checkout, or plan-management UI
- Ad rendering or ad-network requests
- Usage caps, token metering, or quotas
- Per-user editable entitlement overrides (flags live on `plans` rows only)
- Changing access to previously generated lessons
- New AI providers or key migration

## Open decisions (resolved)
1. **This story supersedes PRD Non-Goal #5 for the v1 demo.** Manual dashboard `plan_id` flips + managed inference—no billing. **Why:** trusted bootcamp demos.
2. **`public.plans` holds entitlement flags; `profiles.plan_id` FKs to it (default `free`).** Seeded free/paid rows. **Why:** capabilities are data-driven; no `plan === 'paid'` branches.
3. **Plan flag columns:** `use_platform_key`, `show_ads`, `show_key_settings`, `can_create_without_key`. **Why:** explicit B contract; `canCreate = can_create_without_key || hasKey`.
4. **Use `PLATFORM_GROQ_API_KEY`.** **Why:** provider-explicit naming.
5. **`useEntitlements()` → Service → DAO join; compose `useApiKey()`.** **Why:** layering; `canCreate` from flag + key status.
6. **Hide plan-sensitive controls while loading; failed/missing profile → error+retry.** **Why:** no incorrect-plan flash.
7. **Expose `showAds` unused.** **Why:** stable later contract.
8. **Edge reads live plan flags each generate; route on `use_platform_key` only.** **Why:** no name checks; dashboard flips apply immediately.
9. **`platform_key_unavailable` for absent/unusable platform key.** **Why:** no BYOK CTA/fallback.
10. **No analytics in v1.** **Why:** demo scope.
11. **Discard plan-name derivation, client-supplied plan, and key fallback.** **Why:** escalation / config-error hiding.
