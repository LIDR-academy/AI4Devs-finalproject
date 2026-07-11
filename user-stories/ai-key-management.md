# Bring-your-own AI key (server-side proxy)

**As a** learner using the free tier
**I want** to save my own AI provider API key and have it used server-side only
**so that** I can generate lessons with my own key without it ever being exposed to my device, logs, or other users

## Context
- PRD R6 (drives R2). Companion to R2 (AI lesson generation) and R2.1 (lesson composition) — those stories consume the key this story manages; this story is only about save/update/remove and the guard rail, not generation itself.
- Key lives inline on the existing account/profile screen (no separate settings screen for v1).
- Storage: encrypted/secured server-side (Postgres + Supabase, e.g. Vault/pgsodium-backed column — exact mechanism is a `spec_partner` decision, not prescribed here), scoped to the authenticated user via RLS. The raw key is never returned to the client after save, never logged, and never present in client-side state during a generation request — the Edge Function (R2) reads it directly from storage at call time.
- On save, the Edge Function makes a lightweight test call to the provider to confirm the key is valid before persisting; an invalid key is rejected with guidance instead of being stored.
- Free tier only for v1 (see PRD Nice-to-Have: a future paid tier would swap in a platform-managed key without reworking the Edge Function proxy — out of scope here).
- No analytics event or feature flag for MVP.

## Acceptance criteria
- Given the profile screen, when an authenticated user with no key saved enters a key and submits, then the Edge Function test-validates it against the provider; on success the key is stored encrypted and scoped to that user, and the profile screen shows a masked "key saved" state (never the raw key).
- Given a submitted key that fails the provider test call (invalid/revoked), when the user submits, then save is rejected and the user sees a clear message explaining the key didn't validate, with no key persisted.
- Given a user who already has a key saved, when they enter a new key and submit, then the same validate-then-store flow runs and the new key replaces the old one.
- Given a user with a key saved, when they choose to remove it, then the stored key is deleted and the profile screen returns to the no-key state.
- Given a saved key, when the profile screen loads or reloads, then the client only ever sees a masked/boolean "key present" indicator — the raw key value is never sent to or rendered by the client after the initial save.
- Given any key save, update, remove, or generation-time read, then the raw key value never appears in server logs.
- Given a user with no key saved, when they attempt to generate a lesson (R2), then generation fails gracefully with an inline message explaining a key is required, plus a link to the profile screen to add one — no crash, no silent failure.
- Given a user with a valid key saved, when generation runs (R2), then the Edge Function reads the key server-side to make the provider call; the client only triggers generation and at no point holds or transmits the raw key itself.

## Notes
- Related: R2 (AI lesson generation) reads the key this story manages; R2.1 (lesson composition) is passed through the same Edge Function call.
- Open decision (non-blocking, for `spec_partner`): exact server-side encryption mechanism (e.g. Supabase Vault vs. pgsodium column-level encryption) and the specific lightweight provider call used to validate a key on save.
- No analytics event or feature flag for MVP.
