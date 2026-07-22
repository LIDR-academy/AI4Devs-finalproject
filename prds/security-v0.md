# PRD — Security v0 (Magic-Link Auth)

- **Feature ID**: `security-v0`
- **Status**: Approved by human
- **Depends on**: `home-stream-lifecycle-v0`, `room-chat-v0`, `stream-media-v0` (shipped)
- **Scopes involved**: ALL — `security`, `users`, `streamer`, `qc-portal`, `devops`
- **Constitutions in force**: all, including `CONSTITUTION.style.md` (qc-portal)

## 1. Summary

Real identity arrives. Email magic-link authentication via **SuperTokens
managed cloud** (free tier; human provides credentials), fronted by the
`security` service. First login auto-creates a user in MongoDB (owned by
`users`) with a random username. Auth gates **starting streams** and
**chatting**; the stream list and watching remain public. The `creatorKey`
stopgap is retired: ownership, publish rights, and the STREAMER label all
derive from the authenticated user — and creator reload finally works.

## 2. Goals

- Sign in with an email magic link; sign out.
- First login creates the user record (random, fixed username).
- Only authenticated users can create streams and send chat messages.
- Anonymous visitors can browse the list, watch streams, and read chat.
- Streams are owned; only the owner can end their stream and publish media.

## 3. Non-Goals (explicitly out of scope)

- Username/profile editing (username is **fixed** in v0), avatars, email change.
- Roles/moderation/bans, rate limiting (still an accepted risk; next candidate).
- Social login, passwords, 2FA — passwordless magic link only.
- Self-hosted SuperTokens core (managed cloud for v0; self-hosting is a
  possible future devops feature).
- Migrating pre-auth anonymous streams (dev data; environment is ephemeral).

## 4. Decisions on Record

- **SuperTokens managed cloud**, Passwordless recipe (email magic link).
  Human provides `SUPERTOKENS_CONNECTION_URI` + `SUPERTOKENS_API_KEY`.
  Managed service hosts the core **and** its database (no local core, no
  Postgres) and handles **magic-link email delivery** (no Mailpit; real inbox).
- `security` fronts SuperTokens via the official **SuperTokens Go SDK**.
  No other service talks to SuperTokens — ever.
- **Local JWT verification**: `security` exposes its JWKS; `streamer` verifies
  access tokens statelessly. No per-request calls to security.
- **Header-based auth** (`Authorization: Bearer <access token>`), SuperTokens
  header transfer mode — not cookies. WS passes the token in the join frame.
- First login: `security` → `users` (internal contract) get-or-create by email;
  new users get a random **word+alphanumeric** username, fixed for v0.
- `users` stays fully internal: never exposed to the portal. Identity reaches
  services via JWT claims (`userId`, `username`).
- **`creatorKey` is retired everywhere.** Streams are owned by `userId`;
  username comes from the account; the start-flow username field is removed.
  Creator reload keeps identity (session survives) — the old edge is fixed.
- **One active stream per user** (`409` on a second create).
- Owner-only: end stream, publish media, STREAMER chat role.
- Anonymous: list + watch + **read** chat; composer replaced by a calm
  "sign in to chat" prompt. Protected actions are **visible, gated, calm** —
  never hidden.
- Dependencies blessed: `supertokens-web-js` (portal), SuperTokens Go SDK
  (security), a standard JWKS/JWT library (streamer, e.g. `lestrrat-go/jwx` —
  final pick documented in streamer's openspec). Official/standard only.

## 5. Functional Requirements

### 5.1 security (Go)

- Integrates SuperTokens Passwordless (magic link, email):
  standard auth endpoints under `/auth/*` (SDK-provided): request magic link,
  consume link, session refresh, sign-out, session info.
- Exposes **JWKS** (SDK-provided endpoint) for streamer's local verification.
- On successful login (new session): calls `users` get-or-create by email;
  ensures the JWT payload carries `userId` and `username` claims.
- Config via env: `SUPERTOKENS_CONNECTION_URI`, `SUPERTOKENS_API_KEY`,
  app/api domain settings. The API key never appears in responses or logs.

### 5.2 users (Go + MongoDB)

- Owns MongoDB user persistence. Internal HTTP API, reachable only inside the
  compose network (never published to the host / portal).
- Internal contract (final shape documented in users' openspec, agreed with
  security during delegation):

```
POST /internal/users/get-or-create
  body: { "email": string }
  → 200 { "id": string, "email": string, "username": string, "created": bool }
```

- Username generation: word+alphanumeric (same style as ephemeral chat ids);
  must be unique; fixed (no update endpoint in v0).
- Mongo connection via env (host/port/db), provided by compose.

### 5.3 streamer (Go) — contract changes

- Verifies `Authorization: Bearer` JWTs locally against security's JWKS
  (fetched at startup + refreshed; env: `SECURITY_JWKS_URL`).
- `POST /streams`: **auth required** (`401` without valid token). Body drops
  `username` (comes from claims). Owner = `userId`. `409` if the user already
  has an active stream. Response has no `creatorKey` (field retired).
- `DELETE /streams/{id}`: auth required; **owner only** → `403` otherwise.
  Delete semantics unchanged (Valkey + messages + LiveKit room + disconnects).
- `GET /streams`, `GET /streams/{id}/messages`: **public**, unchanged shapes
  (`username` still listed per stream — now the owner's account username).
- `POST /streams/{id}/media-token`: body drops `creatorKey`; auth **optional**.
  Valid token + requester is owner → publish + subscribe, identity = username.
  Anyone else (auth non-owner or anon) → subscribe-only, identity = username
  (if authed) or generated id (if anon).
- **WS**: `join` frame carries optional `"token"` (the access token).
  - Valid token → sender = account username; role = `"streamer"` if owner,
    else `"viewer"`; may send messages.
  - No/invalid token → **read-only**: receives history/broadcasts, but any
    `message` frame is rejected with an `error` frame (`"auth_required"`).
    Invalid token = silent downgrade to read-only viewer (same doctrine).
- Token expiry mid-connection: existing WS connections are not killed on
  expiry in v0 (accepted simplification, recorded); new joins require a
  fresh token. Portal refreshes sessions via the SDK.

### 5.4 qc-portal

- `supertokens-web-js`, header auth mode. Session state drives the UI.
- **Home**: top-right gains **Sign in** (signed out) or username + **Sign out**
  (signed in), next to Start streaming. Start streaming stays visible for
  everyone; clicking it signed-out → calm sign-in prompt/redirect.
- **Sign-in flow**: email form → "check your inbox" state → magic-link landing
  route consumes the link via the SDK → redirect to where the user was going
  (or Home). All states calm, per style law.
- **Start flow**: username field **removed** (title + description remain).
- **Room page**: signed-in owner gets the publisher experience (pre-join →
  Go live) with no key juggling — reload keeps ownership. Non-owners and
  anons: viewer experience unchanged.
- **Chat**: anons see history and live messages; the composer area shows a
  calm "Sign in to chat" affordance instead of the input. Signed-in users chat
  as their username; owner messages carry the STREAMER label (server-stamped,
  as always).
- Sign-out: clears the session, UI returns to anonymous state; if currently
  publishing, portal warns calmly before completing sign-out.

### 5.5 devops

- Add **MongoDB** container to compose (for `users`): standard image, internal
  network only, dev credentials via env, no published port to host (or
  dev-profile only), ephemeral or volume — devops's call, documented.
- Provide env wiring: security's SuperTokens vars (values supplied by the
  human, injected via untracked env file — **never committed**), users' Mongo
  vars, streamer's `SECURITY_JWKS_URL`.
- No SuperTokens core container, no mail container (managed service does both).
- Read-only on all code, as always.

## 6. Wire Contract — Law (changes only)

```
Auth transport: Authorization: Bearer <access token> (HTTP)
               { "type": "join", "token"?: string }   (WS)

POST /streams                    [AUTH REQUIRED]
  body: { "title": string, "description"?: string }
  → 201 { "id", "username", "title", "description" }      // no creatorKey
  → 400 validation | 401 no/invalid session | 409 user already streaming

DELETE /streams/{id}             [AUTH REQUIRED, OWNER ONLY]
  → 204 | 401 | 403 not owner | 404

POST /streams/{id}/media-token   [AUTH OPTIONAL]
  body: {}                                               // creatorKey retired
  → 200 { "token", "url", "identity", "role" }            // role by ownership
  → 404

GET /streams, GET /streams/{id}/messages — public, shapes unchanged.

WS: join with valid token → can chat (role by ownership);
    join without/invalid token → read-only; message frames → error "auth_required".

security: standard SuperTokens /auth/* endpoints + JWKS endpoint (SDK shapes).
security ↔ users: internal get-or-create contract (§5.2), never public.
```

## 7. Style Requirements (qc-portal)

`CONSTITUTION.style.md` applies in full. Feature-specific checks:

- Sign-in form, inbox-check state, and gated prompts ("Sign in to chat",
  start-streaming gate) are the calmest surfaces in the product: quiet text,
  standard buttons, zero urgency styling. Email input per style §6.
- Username display (header, chat) is typography only — no avatar circles,
  no colored identity chips. STREAMER label unchanged from `room-chat-v0`.

## 8. Acceptance Criteria

1. Full loop: enter email → receive real magic-link email → click → signed in;
   first login creates the Mongo user with a random username (`created: true`
   once, `false` after); sign-out returns the UI to anonymous.
2. Anonymous: sees the list, watches a stream, reads chat — cannot create
   (`401` verified), cannot chat (WS `auth_required` verified), sees calm
   gates instead of hidden features.
3. Signed-in user creates a stream (no username field); it lists under their
   account username; a second create while live → `409`.
4. Owner: publishes media, chats with STREAMER label, ends the stream.
   **Reload keeps all of it** — the old creator-reload edge is demonstrably gone.
5. Non-owner signed-in user: chats as their username (no label), gets
   subscribe-only media token, `403` on delete attempt.
6. streamer verifies JWTs locally (no security call per request — asserted in
   tests with a stubbed JWKS); tampered/expired tokens rejected.
7. `users` is unreachable from outside the compose network; identity flows
   only via JWT claims; no SuperTokens API key or secrets in any response,
   log, or committed file (grep-verified in evidence).
8. All prior features still pass their acceptance criteria end to end under
   the new auth rules (regression sweep across the three shipped PRDs).
9. Full suites pass with evidence: `bun test`; `go test -race ./...` +
   `go vet` + linter across security, users, streamer.
10. qc-portal's done report explicitly states style-law compliance.

## 9. Delegation Plan (team lead)

- Record in openspec as `security-v0` with contract changes to `streamer`'s
  API and the retirement of `creatorKey` noted as a breaking contract change.
- **Five deliverables** — the first all-hands race: security (§5.1), users
  (§5.2), streamer (§5.3), qc-portal (§5.4), devops (§5.5).
- The security ↔ users internal contract is finalized between those two
  teammates at delegation time (lead records it); the JWT claim set
  (`userId`, `username`) is law for streamer from day one.
- Human must supply SuperTokens credentials before devops can wire env —
  flag this as the race's only external dependency.
- Pending until all five report done with evidence; lead presents the final
  summary. **The human has the final word on shipped.**

## 10. Resolved Decisions (for the record)

- SuperTokens **managed cloud**, free tier, human-supplied credentials
  (gaps #1–2 — supersedes the self-hosted + Mailpit proposal); managed core
  hosts its own storage and sends magic-link emails (gap #9: moot).
- Local JWKS/JWT verification in streamer (gap #3).
- Get-or-create on first login; random fixed username; users fully internal,
  claims carry identity (gap #4).
- `creatorKey` retired; ownership-based everything; reload fixed (gap #5).
- Owner-only delete; **one active stream per user**, `409` on second
  (gap #6 — concurrency question resolved by lead's call, approved).
- Anonymous chat is read-visible with a sign-in gate (gap #7).
- `supertokens-web-js` blessed; sign-out included (gap #8).
- Visible-but-gated pattern for protected actions (gap #10).
- Header-based auth transport (lead's call, approved).
- WS connections survive mid-connection token expiry in v0 (recorded
  simplification).
