## Why

`stream-media-v0` replaces the camera placeholder with real WebRTC video/audio via a self-hosted **LiveKit SFU**. The runtime needs a new component: a LiveKit server, running locally in dev mode, that the browser can reach for media and that `streamer` can drive server-to-server for tokens, room deletion, and participant webhooks (its auto-reap depends on those webhooks). Today `docker compose up` has no media plane — acceptance #1 requires the whole flow to work on localhost. This change adds LiveKit to the environment and wires streamer's LiveKit configuration.

This is the devops deliverable, implemented against the frozen root record (`openspec/changes/stream-media-v0/` — design D3/D4/D6/D9 and the `stream-media` spec requirement "LiveKit runs in the compose environment (dev mode)"). It does not reopen those contracts. It extends the shipped `compose-runtime` baseline.

## What Changes

- **New compose service `livekit`**: official `livekit/livekit-server` (pinned tag), **single node, dev mode**, no Redis, no TLS, no TURN. This is v0/localhost-oriented; production hardening (TLS, TURN, real keys, host networking) is a recorded future devops feature, explicitly out of scope here.
- **LiveKit is a documented SECOND published origin** (root D3): WebRTC media cannot traverse the nginx HTTP reverse proxy, so LiveKit publishes its own ports and the browser connects to it cross-origin at `LIVEKIT_PUBLIC_URL`. The application itself stays single-origin behind nginx (unchanged) — only the media plane is a second origin.
- **Published LiveKit ports**: `7880` (WebSocket signaling), `7881` (TCP fallback), and a **single UDP media port** (mux) for browser reachability without host networking. The UDP publishing strategy is the fiddly zone (see design); the host-networking approach is Linux-only and a small published-UDP surface is the supported cross-platform (Docker Desktop) path.
- **Four LiveKit env vars supplied to `streamer`** (config from environment, no secret baked into an image or committed):
  - `LIVEKIT_API_KEY` — dev key (well-known LiveKit dev default), clearly marked DEV-ONLY.
  - `LIVEKIT_API_SECRET` — dev secret, clearly marked DEV-ONLY (not a secret to protect in v0, but labeled so nobody promotes it to prod).
  - `LIVEKIT_URL` — server-to-server, internal (`http://livekit:7880`, HTTP/Twirp API — confirmed with streamer), used by streamer to manage rooms / issue tokens.
  - `LIVEKIT_PUBLIC_URL` — browser-facing (e.g. `ws://localhost:7880`), returned by streamer in the token response; the portal bakes nothing.
- **LiveKit participant webhooks wired to streamer**: LiveKit's webhook is configured to POST participant events to streamer's webhook endpoint over the internal network (streamer's auto-reap of abandoned rooms depends on it). The exact path is coordinated with streamer.
- **Acceptance #1 "end to end"**: `docker compose up` brings up Valkey + streamer + LiveKit + portal + proxy and the media flow works on localhost — proven with Chrome fake media devices (`--use-fake-device-for-media-stream`) once the service images are ready, not by claim.

### Non-goals

- **No changes to any service code or Dockerfile** — devops stays read-only and consumes streamer's/qc-portal's images. If media fails at runtime, devops investigates LiveKit config first (the expected fiddly zone) and reports code/Dockerfile issues to the owner with evidence; it never edits their scope.
- **No reopening of frozen contracts** (§6 wire, D1 token authority, D3 second origin, D4 auto-reap, env-var names). This change implements them.
- **No production LiveKit**: TLS, TURN, real credentials, host networking, Redis-backed multi-node — all out of scope for v0 and recorded as a future devops feature.
- **No change to the single-origin app plane**: nginx routing for `/streams*` HTTP + the room WS is unchanged; LiveKit is additive and separate.
- **No secret handling beyond dev defaults**: the dev key/secret are the well-known LiveKit dev values, labeled DEV-ONLY; there is nothing sensitive to protect in v0.

## Capabilities

### New Capabilities

<!-- none — this extends the existing compose-runtime capability -->

### Modified Capabilities

- `compose-runtime`: the runtime gains a LiveKit media server as a documented second origin, streamer's LiveKit configuration from the environment, and LiveKit→streamer webhook delivery. ADDED requirements on the existing capability; the shipped single-origin app behavior (nginx routing, WS, chat env) is unchanged.

## Impact

- **dev/devops/ (files changed here only)**:
  - `docker-compose.yml` — add the `livekit` service (pinned image, dev mode, published 7880/7881/UDP, no Redis/TLS/TURN); add the four `LIVEKIT_*` env vars to the `streamer` service; add `livekit` to dependency ordering where sensible.
  - a LiveKit dev config file (e.g. `livekit.yaml`) mounted read-only — keys, the single UDP port, `use_external_ip` for localhost, and the webhook URL pointing at streamer.
  - `.env.example` — document the four `LIVEKIT_*` vars and the published ports, dev key/secret marked DEV-ONLY.
  - `README.md` — document the second-origin exception, the published ports, the host-networking-is-Linux-only caveat, and the dev-mode published-ports path.
- **Cross-scope dependencies devops CONSUMES (not owned here)**:
  - streamer reading `LIVEKIT_API_KEY` / `LIVEKIT_API_SECRET` / `LIVEKIT_URL` / `LIVEKIT_PUBLIC_URL` by these exact names, and exposing a **webhook endpoint** whose path devops points LiveKit at. **Must be confirmed with streamer.**
  - qc-portal connecting to LiveKit at the `url` returned in the token response (no baked URL).
- **Sequencing / risk**: the compose service + env + webhook config are authorable now, but acceptance #1 (media end to end) cannot be proven until streamer's token/webhook image and qc-portal's livekit-client image build. The UDP-in-Docker reachability is the biggest runtime risk and is verified with Chrome fake devices once images land. devops does not claim #1 without observed output.
- **External systems**: LiveKit SFU is new to the running environment (second origin). No TURN/STUN external, no Redis.
- **Coordination**: confirm with streamer the four env-var names, the two URLs (internal vs public, and the scheme it expects for the server-to-server URL), and the webhook endpoint path. Keep the team lead informed for the root openspec.
