---
feature: plan-entitlements-key-routing
story: user-stories/in-progress/plan-entitlements-key-routing.md
status: approved
---

# Spec — plan-entitlements-key-routing

## Summary
Derive client entitlements from a server-owned `free|paid` plan and route generation keys from that same live plan. Free learners use BYOK; paid learners use the platform Groq key without making client gates authoritative.

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
| Content | Paid, or free with saved key | Show create/upload; show key settings only for free |
| Empty | Free with no saved key | Hide create/upload; show key setup guidance |
| Error | Plan read fails or profile is missing | Hide plan-sensitive controls; show error + retry |

## Analytics events
None in v1.

## Feature flags
None. `profiles.plan` is the switch and applies without redeploy.

## Out of scope / non-goals
- Billing, Stripe, checkout, or plan-management UI
- Ad rendering or ad-network requests
- Usage caps, token metering, or quotas
- Independently editable entitlement flags
- Changing access to previously generated lessons
- New AI providers or key migration

## Open decisions (resolved)
1. **This story supersedes PRD Non-Goal #5 and its Future-only paid inference note for the v1 demo.** The story and its approved human decisions are source of truth despite citing an absent R10. Scope is manual dashboard plan flips plus managed inference—no billing. **Why:** enable trusted bootcamp demos without expanding into Stripe or self-service plans.
2. **Store plan in `public.profiles`.** Seed constrained `free` rows from `auth.users`; expose select-own RLS. **Why:** plan exists independently of optional BYOK metadata and defaults securely.
3. **Use `PLATFORM_GROQ_API_KEY`.** **Why:** provider-explicit naming avoids ambiguity.
4. **Expose `useEntitlements()` through Service → DAO; compose shared `useApiKey()` in the hook.** **Why:** preserves layering while deriving `canCreate` from plan + key status.
5. **Hide plan-sensitive controls while loading; make failed/missing profile reads retryable errors.** **Why:** prevents incorrect-plan flashes and exposes data-integrity failures.
6. **Expose derived `showAds`, unused.** **Why:** stabilizes the later contract without adding ads now.
7. **Read plan live in `generate-lesson`; route exclusively.** Free reads Vault BYOK; paid reads only the platform key and ignores saved user keys. **Why:** dashboard changes apply immediately and clients cannot select funded inference.
8. **Return `platform_key_unavailable` for absent or unusable platform configuration.** **Why:** identifies an operator failure and prevents any BYOK CTA or cross-source fallback.
9. **No analytics or feature flag in v1.** **Why:** unnecessary for the demo; plan is the switch.
10. **Discard plan-on-`user_ai_keys`, client-supplied plan, and key fallback.** **Why:** they fail for keyless paid users, enable escalation, or hide configuration errors.
