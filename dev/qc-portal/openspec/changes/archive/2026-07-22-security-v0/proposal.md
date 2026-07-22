## Why

Real identity arrives. The portal gains email magic-link sign-in/sign-out via SuperTokens (`supertokens-web-js`, header-auth mode), and the `creatorKey` stopgap threaded through the last three features is retired: ownership, publish rights, the STREAMER label, and End-stream all derive from the authenticated session — and the creator-reload edge is finally gone (the session survives reload). Auth gates starting streams and chatting; browsing the list, watching, and reading chat stay public.

This is the qc-portal deliverable for feature `security-v0`. The cross-scope contract (PRD §6) and decisions (root record D1–D7) are frozen; this change records only how the portal implements against them.

## What Changes

Components touched: **Login** (new — sign-in flow), **Streamings** (Home auth controls, start flow), **Rooms** (owner-by-session, chat/media auth). Uses the `security` service `/auth/*` (magic link) and consumes the auth-gated `streamer` contract.

Adds a new capability `portal-auth`:
- **`supertokens-web-js`** initialized in header-auth mode; a session module owns session state (signed-in? + `username` claim) and provides the access token for authed requests.
- **Sign-in flow**: an email form → a calm "check your inbox" state → a magic-link **landing route** that consumes the link via the SDK → redirect to the intended destination (or Home).
- **Home top-right**: **Sign in** (signed out) or **username + Sign out** (signed in), beside Start streaming. Identity display is typography only (no avatars, no colored chips).
- **Auth transport**: every protected request carries `Authorization: Bearer <access token>` (HTTP) and the WS `join` frame carries the token (D2). Sessions refresh via the SDK; reload keeps identity.
- **Sign-out**: clears the session → anonymous UI; if the user is currently publishing, a calm warning first, and their active stream is ended before sign-out completes (D5).

Modifies `portal-home-stream-lifecycle`:
- **Start flow** drops the **username** field (title + description only; username comes from the account). `POST /streams` is auth-required (Bearer), returns no `creatorKey`; a signed-out Start-streaming click routes to a calm sign-in prompt (the action stays visible — D6). Handles `401` (sign-in) and `409` (already streaming) calmly.
- **End stream** is **owner-only via session** (creatorKey retired); the wire boundary sends the Bearer token and no longer reads/stores a creatorKey.

Modifies `portal-room-chat`:
- **Owner-by-session**: the room shows the publisher/End experience to the signed-in **owner** (session username == the stream's username), and it **survives reload**. The in-memory `creatorKey` store is **removed**.
- **Chat**: anonymous users read history + live messages but the composer is replaced by a calm **"Sign in to chat"** affordance; signed-in users chat as their username; the WS `join` carries the access **token** (not a key); a `message` rejected with `error "auth_required"` is handled calmly.

Modifies `portal-stream-media`:
- The media-token request body drops `creatorKey` and sends the Bearer token when signed in (auth-optional); the creator (publish) flow is driven by the server-stamped `role`/ownership, not a key.

## Capabilities

### New Capabilities

- `portal-auth`: the portal-side authentication experience — `supertokens-web-js` header-mode integration, session state driving the UI, the magic-link sign-in flow + landing route, sign-out (with a publishing warning + stream end), Bearer/WS-token transport, and typography-only identity display.

### Modified Capabilities

- `portal-home-stream-lifecycle`: Home auth controls; start-flow username removed; auth-required create (no creatorKey); owner-only End via session.
- `portal-room-chat`: owner-by-session (reload-safe, creatorKey store removed); chat auth (token join, anon composer gate, `auth_required`).
- `portal-stream-media`: media-token drops creatorKey and carries the Bearer token; creator flow by ownership/session.

## Impact

- **Scope**: qc-portal only. All files under `dev/qc-portal/`. No other scope touched.
- **New dependency**: `supertokens-web-js` (blessed by the PRD §4/§10) — the official SuperTokens browser SDK; the only sanctioned way to run the header-mode passwordless client session.
- **Consumes (frozen §6, not modified here)**: `security` `/auth/*` (magic link, session, sign-out, session info) same-origin; the auth-gated `streamer` contract — `POST /streams` [auth], `DELETE /streams/{id}` [auth, owner-only], `POST /streams/{id}/media-token` [auth-optional, no creatorKey], WS `join` with `token`. `GET /streams` + history stay public.
- **Breaking removal**: `creatorKey` and its in-memory store are deleted from the portal.
- **Coordination (for the race)**: the auth transport (Bearer HTTP + token in the WS join) with streamer; that `security`'s `/auth/*` and JWKS are reached at the same origin (devops proxy).
- **Constitutions**: `CONSTITUTION.md`, `CONSTITUTION.ts.md`, `CONSTITUTION.style.md` — auth surfaces are the calmest in the product.
- **Not involved**: `users` (fully internal); the SuperTokens core (only `security` talks to it).

## Non-goals

- Username/profile editing (username is fixed), avatars, colored identity chips.
- Social login / passwords / 2FA — magic link only; self-hosting SuperTokens.
- Migrating pre-auth anonymous streams. Enforcing WS token expiry mid-connection (server simplification). Dark mode (style §8).
- Any change to §6 — it is law; changes route through the team lead.
