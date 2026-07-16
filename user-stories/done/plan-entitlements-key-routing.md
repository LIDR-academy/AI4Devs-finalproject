# Plan entitlements & key-source routing

**As a** learner on free or paid plan
**I want** the app to use the right AI key source and gate upload/key settings from my plan
**so that** free users BYOK safely and paid users generate without key setup — without client-only checks that can be bypassed

## Context
- PRD **R10** (extends R6 / R2). Ships before bootcamp demo.
- `plan`: `free` | `paid`. Default `free` on signup. Flip to `paid` **only via Supabase dashboard** — no billing UI, no Stripe.
- Entitlements **derived from plan** (not independently editable flags):

| | Free | Paid |
|---|---|---|
| Key source | User BYOK (R6) | Platform env key |
| Show key settings | Yes | No |
| `showAds` | Yes | No |
| Create / upload | Yes **if** user key saved | Yes (no user key) |

- `showAds` is stored/derived for later; **no ad UI or network** in this story.
- **No hard usage cap** in v1 (token metering = v2). Platform key is for trusted/manual paid demos only.
- Paid → free: existing lessons stay playable; next generate needs a user key again.
- Server is source of truth: Edge Function resolves key from plan; client gates are UX only.

## Acceptance criteria
- Given a new signup, when the profile/account row is created, then `plan` is `free`.
- Given `plan = free`, when the app loads entitlements, then key settings are shown, `showAds` is true, and upload/create is shown only if a user key is saved.
- Given `plan = free` and no key saved, when the learner views screens with upload/create, then those controls are hidden; if generate is called anyway, the Edge Function rejects with a clear "key required" error.
- Given `plan = free` and a valid key saved, when generation runs, then the Edge Function uses the user's stored key (R6).
- Given `plan = paid`, when the app loads entitlements, then key settings are hidden, `showAds` is false, and upload/create is available without a user key.
- Given `plan = paid`, when generation runs, then the Edge Function uses the platform key from server env — never the user's key (if any still stored).
- Given `plan = paid` and the platform key is missing/misconfigured, when generation runs, then the Edge Function fails with a clear server error (not a "add your key" CTA).
- Given a user flipped `paid` → `free` in the dashboard, when they reopen the app, then key settings reappear, upload is gated on their key, and previously saved lessons remain openable/playable.
- Given any plan change in the Supabase dashboard, when the user next loads entitlements or generates, then the new plan applies without a redeploy.
- Given a crafted client request that ignores UI gates, when generate runs, then key-source routing still follows the server-side `plan` (client entitlements alone cannot force the platform key).

## Notes
- Related: R6 (BYOK for free), R2 (generation Edge Function).
- Out of scope: Stripe/billing, ad rendering, token/lesson caps, admin UI to flip plan.
- Analytics: optional later (`plan_entitlements_loaded`, `generate_key_source`). Feature flag: none — plan column is the switch.
- Spec partner: where `plan` lives (e.g. `profiles.plan`), platform key env var name, and how entitlements are exposed to the client (hook/service).
