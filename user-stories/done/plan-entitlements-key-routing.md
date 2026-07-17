# Plan entitlements & key-source routing

**As a** learner on free or paid plan
**I want** the app to use the right AI key source and gate upload/key settings from my plan flags
**so that** free users BYOK safely and paid users generate without key setup — without client-only checks that can be bypassed

## Context
- PRD **R10** (extends R6 / R2). Ships before bootcamp demo.
- `profiles.plan_id` FKs to `plans` (default `free`). Flip via **Supabase dashboard** only — no billing UI, no Stripe.
- Capabilities come from **live `plans` flags** (never `plan === 'paid'` branches):

| Flag | Free | Paid | Effect |
|---|---|---|---|
| `use_platform_key` | false | true | Edge key route; also drives client `canCreate` with saved key |
| `show_key_settings` | true | false | BYOK settings visibility |
| `show_ads` | true | false | Exposed on profile; **no ad UI** in this story |

- Client: `canCreate = use_platform_key || hasKey` (via `useProfile()`).
- Blocked create UI: contact-support message (`upload.cannotCreate`).
- **No hard usage cap** beyond existing platform-generation limits. Platform key is for trusted/manual paid demos only.
- Paid → free: existing lessons stay playable; next generate needs a user key again (unless `use_platform_key`).
- Server is source of truth: Edge resolves key from live `use_platform_key`; client gates are UX only.

## Acceptance criteria
- Given a new signup, when the profile row is created, then `plan_id` is `free`.
- Given free flags + saved key, when profile loads, then key settings are shown, `showAds` is true, and upload/create is shown.
- Given free flags + no key, when the learner views upload/create, then those controls are hidden and contact-support is shown; if generate is called anyway, Edge rejects with `missing_key`.
- Given free flags + valid key, when generation runs, then Edge uses the user's stored key (R6).
- Given paid flags, when profile loads, then key settings are hidden, `showAds` is false, and upload/create is available without a user key.
- Given paid flags, when generation runs, then Edge uses `PLATFORM_GROQ_API_KEY` — never the user's key.
- Given paid flags and platform key missing/misconfigured, when generation runs, then Edge fails with `platform_key_unavailable` (not a "add your key" CTA).
- Given a user flipped `paid` → `free` in the dashboard, when they reopen the app, then key settings reappear, upload is gated on their key, and previously saved lessons remain openable/playable.
- Given any `plan_id` change in the dashboard, when the user next loads profile or generates, then live flags apply without a redeploy.
- Given a crafted client request that ignores UI gates, when generate runs, then key-source routing still follows server-side `use_platform_key`.

## Notes
- Related: R6 (BYOK for free), R2 (generation Edge Function).
- Out of scope: Stripe/billing, ad rendering, token/lesson caps, admin UI to flip plan.
- Analytics: optional later. Feature flag: none — `plan_id` → `plans` flags is the switch.
- Client stack: `ProfileProvider` / `useProfile` → `ProfileService` → `ProfileDao` (profiles→plans join).
