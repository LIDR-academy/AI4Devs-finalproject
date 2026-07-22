## Context

Final v0 feature: real magic-link identity, retiring the `creatorKey` stopgap threaded through the three shipped features. Frozen in the root record and binding on the portal:

- **§6 is law** — auth transport `Authorization: Bearer <token>` (HTTP) + `token` in the WS `join`; `POST /streams` [auth, no username, no creatorKey], `DELETE` [auth, owner-only], media-token [auth-optional, no creatorKey], WS message needs a valid token else `error "auth_required"`; `GET /streams` + history public.
- **D1** — SuperTokens managed cloud, Passwordless (email magic link), fronted by `security`; only `security` talks to SuperTokens.
- **D2** — header Bearer transport; the portal uses `supertokens-web-js` header mode; sessions refresh via the SDK; reload keeps the session.
- **D3/D4** — identity (`userId`, `username`) comes from the account; `creatorKey` is retired; ownership is by `userId` (server-side). The portal's client-side ownership signal is: signed-in and the session `username` equals the stream's `username`.
- **D5** — the escape-hatch DELETE is retired (owner-only via session); the reaper stays (server-side); **sign-out ends the user's active stream** (portal warns calmly if publishing).
- **D6** — anonymous is visible-but-gated (Start streaming shown → sign-in prompt; composer → "Sign in to chat").

Constitutions: `CONSTITUTION.md`, `CONSTITUTION.ts.md`, `CONSTITUTION.style.md`.

## Goals / Non-Goals

**Goals:**
- Keep `supertokens-web-js` (the untestable-in-bun SDK) behind a thin injected seam so all UI, session-state, ownership, and transport logic is unit-tested with a fake — no SDK, no network.
- Session state drives the UI reactively; reload keeps identity.
- Retire `creatorKey` cleanly from every portal path.
- Auth surfaces are the calmest in the product (style §7/§6).

**Non-Goals:**
- Changing §6, SuperTokens/security internals, or the proxy (devops/security-owned).
- Profile editing, avatars/chips; enforcing WS token expiry mid-connection.

## Decisions

### D-P1 — Feature folder `src/auth/`, thin SuperTokens seam
New `src/auth/`: `auth-session.ts` defines an `AuthSession` interface the app depends on (`init`, `isSignedIn`, `username`, `getAccessToken`, `requestMagicLink(email)`, `consumeMagicLink()`, `signOut`) with a real implementation that is the **ONLY** importer of `supertokens-web-js`. A fake `AuthSession` drives tests. Also: `session-store.ts` (reactive signed-in/username state), `sign-in.ts` (the email form + inbox-check view), `auth-controls.ts` (Home top-right Sign in / username + Sign out), and the landing route wiring. The seam is type-only-imported + injected so bun tests never load the SDK.

### D-P2 — Reactive session store drives the UI
A small session store holds `{ status: "loading" | "anonymous" | "signed-in", username? }`. On boot the app resolves the session once via `AuthSession` (does-session-exist + username claim) and sets the store; Home controls, the room, and chat subscribe. Sign-in/out update the store, re-rendering the affected surfaces.

### D-P3 — One authed transport helper; token from the SDK
`authedFetch(input, init, session)` attaches `Authorization: Bearer <access token>` (from `AuthSession.getAccessToken()`) to protected requests. The streams API (`createStream`, `endStream`) and media-token boundary use it; public reads (`listStreams`, history) stay unauthenticated. The WS `join` frame carries the token (from the SDK) instead of a creatorKey. All token access goes through the injected `AuthSession`, so tests supply a fake token.

### D-P4 — Ownership by session; creatorKey retired
`creator-key.ts` and its store are **deleted**. The room derives ownership client-side as `signedIn && sessionUsername === stream.username` — used to show the **End** control and the **publisher** (pre-join/go-live) experience. The server enforces ownership (media-token `role`, `403` on non-owner delete), so a client mismatch is safe. `POST /streams` no longer sends a username; the start modal drops the username field. Reload keeps the session → ownership/publish/STREAMER survive (the old edge is gone).

### D-P5 — Start flow: auth-gated, username removed (D6)
Start streaming is always visible. A signed-out click routes to a calm sign-in prompt (with the intended destination remembered). Signed-in, the modal shows **title + optional description only** (no username), `POST /streams` with the Bearer token; `201` → redirect to the room; `401` → sign-in prompt; `409` → a calm "you already have an active stream" message; `400` → calm inline validation.

### D-P6 — Chat auth (D6)
The WS `join` carries the access token when signed in. The composer is shown only to signed-in users; anonymous users see a calm **"Sign in to chat"** affordance in its place (still reading history + live messages). A server `error "auth_required"` (e.g. token lapsed) is surfaced calmly and the composer prompts re-auth; identity/STREAMER rendering is unchanged (server-stamped role).

### D-P7 — Sign-out warns then ends the owned stream (D5)
On sign-out, if the user owns an active stream (found in the list by session username) and is currently publishing, the portal shows a **calm confirmation** ("Signing out will end your stream"). On confirm it `DELETE`s the owned stream (Bearer) and then signs out; otherwise it signs out directly. This — with the server reaper — prevents an abandoned stream from locking the "one stream per user" slot.

### D-P8 — Magic-link landing route consumes the link via the SDK
A dedicated landing route (e.g. `/auth/verify`) is served by the SPA (static-server fallback already covers it) and, on mount, calls `AuthSession.consumeMagicLink()` (the SDK reads the link params), sets the session, and redirects to the remembered destination or Home. Failure → a calm "this link didn't work — try again" with a path back to sign-in.

### D-P9 — Same origin; nothing baked
`supertokens-web-js` is initialized with the app's own origin as the API domain (the proxy routes `/auth/*` to `security`); no auth URL is baked into the bundle, consistent with the shipped single-origin model.

### D-P10 — Style: the calmest surfaces (style §6/§7)
Sign-in form, inbox-check, gated prompts, and the sign-out warning are quiet typography + standard style-§6 buttons (email input per §6) with zero urgency styling. Identity is typography only — no avatar circles, no colored chips. Sign-in copy + the landing route wording are mine (D7), reported to the lead.

## Risks / Trade-offs

- **supertokens-web-js is unmockable in bun tests** → the `AuthSession` seam confines it to one module; everything else (store, transport, ownership, views, sign-out flow) is unit-tested with a fake. The real SDK path is exercised in the compose E2E (AC1 real-email loop).
- **Retiring creatorKey ripples through 3 baselines** → handled as MODIFIED requirements; my own test suites (start flow, room, chat, media) are updated and re-run (AC8 regression).
- **Ownership computed client-side** (username match) is a UI convenience only → the server is authoritative (403 / media role); no security decision is made on the client.
- **Sign-out-ends-stream from anywhere** → needs the owned stream id; found via the public list by session username; if not found (not streaming) sign-out proceeds directly.
- **Token expiry mid-WS** not enforced server-side in v0 → the SDK refreshes the session; a reconnect re-joins with a fresh token; a lapsed `message` gets `auth_required` handled calmly.

## Migration Plan

Additive `src/auth/` + a breaking sweep that deletes `creator-key.*` and threads the session through start/room/chat/media. Order: (1) add `supertokens-web-js`; (2) `AuthSession` seam + fake + session store; (3) authed transport + WS token; (4) sign-in flow + landing route + Home controls; (5) start-flow username removal + auth gate + 401/409; (6) room owner-by-session + creatorKey deletion; (7) chat composer gate + token join; (8) media-token token/no-key; (9) sign-out warn+end; (10) style litmus; (11) full `bun test` + `tsc` + Biome + Docker + regression sweep of the prior features under auth. Portal builds against the frozen contract (fake session / stubbed `/auth`) in parallel; the real-email loop runs once the human supplies SuperTokens creds.

## Open Questions

None blocking. Sign-in copy + the landing route path chosen here and reported to the lead; may refine auth-surface visuals via the frontend-design plugin without changing the contract or the calm intent.
