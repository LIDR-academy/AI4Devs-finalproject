## Context

Final v0 feature; first all-hands race across all five scopes, waking `security` and `users` (greenfield since muster). Builds on the three shipped features and retires the `creatorKey` stopgap threaded through them. PRD `prds/security-v0.md` approved; §4/§10 resolve most gaps; explore-mode intake resolved three cross-scope decisions with the human. Orchestration-level design; each teammate produces its own.

## Goals / Non-Goals

**Goals:** real magic-link identity; ownership by `userId`; auth gates create + chat while browse/watch/read stay public; the creator-reload edge finally gone; no user lockout from an abandoned stream.

**Non-Goals:** profile editing, roles/moderation, self-hosted SuperTokens, anonymous-stream migration (see proposal Non-goals).

## Decisions

### D1 — Auth stack (from PRD)
SuperTokens **managed cloud**, Passwordless (email magic link), fronted by `security` via the SuperTokens Go SDK. Managed service hosts core + storage + sends the magic-link email (no local core, no Postgres, no Mailpit). Only `security` talks to SuperTokens, ever. Human supplies `SUPERTOKENS_CONNECTION_URI` + `SUPERTOKENS_API_KEY` via an untracked env file — never committed, never logged/returned.

### D2 — Header Bearer + local JWKS verification (from PRD)
`Authorization: Bearer <access token>` (HTTP), SuperTokens header-transfer mode (not cookies); WS carries the token in the `join` frame. `security` exposes JWKS; `streamer` verifies access tokens **statelessly** against it (fetched at startup + refreshed via `SECURITY_JWKS_URL`) — no per-request call to security (AC6). JWT claim set `userId` + `username` is LAW for streamer from day one.

### D3 — Identity & the internal contract (from PRD + human decision)
First login: `security` → `users` `POST /internal/users/get-or-create {email} → {id,email,username,created}`. `userId` is the users-service id (Mongo), stamped as the JWT claim and used for ownership (not SuperTokens' internal id). Username = random word+alphanumeric, unique, fixed for v0. `users` is compose-internal only, never published. **security→users trust = the network** (no shared secret; same as Mongo/Valkey) — human decision, dev-appropriate.

### D4 — creatorKey retired; ownership by userId (from PRD, breaking change)
`creatorKey` is removed from every contract and code path (create response, media-token body, WS, DELETE auth). Ownership = the stream's `userId`. Username comes from the account; the start-flow username field is removed. Because the session survives reload, the old creator-reload edge is gone — reload keeps ownership, publish rights, and the STREAMER label.

### D5 — Abandoned-stream cleanup: escape-hatch retired, reaper kept, sign-out ends stream (human decision)
"One stream per user" (`409` on a second create) + owner-only DELETE + no creatorKey would otherwise let an abandoned live stream lock a user out. Resolution:
- The stream-media **escape-hatch (keyless delete when no publisher) is RETIRED** — DELETE is strictly owner-only via session now.
- The **reaper is KEPT**: when the owner's media leaves past the grace window, streamer reaps the stream (deletes it), which frees the user's "one stream" slot and redirects viewers Home (existing room-ended path).
- **Sign-out ends the user's active stream** (portal warns calmly if publishing). Between reaper + sign-out, an abandoned stream self-heals; no lockout.

### D6 — Anonymous is visible-but-gated (from PRD)
Anonymous visitors: list + watch + **read** chat. Protected actions stay **visible and calm**, never hidden: Start streaming is shown but routes signed-out users to a calm sign-in prompt; the chat composer is replaced by a calm "Sign in to chat" affordance. WS `message` from a no/invalid-token connection → `error "auth_required"` (invalid token = silent read-only downgrade, same doctrine as prior features).

### D7 — Teammate-owned (recorded as their call)
JWKS/JWT lib pick for streamer (e.g. `lestrrat-go/jwx`); SuperTokens SDK claim-override mechanics (security); username generator + Mongo interface/fake (users); Mongo image/persistence choice (devops); grace-window reuse (streamer); sign-in copy + landing route (qc-portal, style exception available).

## Risks / Trade-offs

- **Breaking contract change** (creatorKey retired) ripples through three shipped baselines → handled as MODIFIED requirements; AC8 regression sweep re-verifies all prior features under auth.
- **External dependency**: real SuperTokens creds + a real inbox gate the AC1 E2E. The five scopes build against the contract (stubbed JWKS / mocked SuperTokens) in parallel; the real-email loop runs once creds land (human supplies).
- **Secret hygiene**: SuperTokens API key + Mongo creds never committed/logged/returned (AC7, grep-verified); untracked env file.
- **users internal endpoint** creates users from an email with only network isolation → accepted for v0 (D3); a shared secret is a trivial future hardening.
- **WS token expiry mid-connection** not enforced in v0 (recorded simplification); new joins need a fresh token; portal refreshes via the SDK.

## Migration Plan

Additive services (security, users, Mongo) + breaking streamer contract. No data migration (ephemeral). Parallel build against the frozen contract; security↔users finalize the internal shape at delegation; the JWT claim set is law for streamer immediately. Full loop + regression sweep once creds land. Pending until all five report done with evidence.

## Open Questions

None blocking. D7 items are teammate-owned; the security↔users internal contract shape is finalized between those two at delegation (lead records it).
