## Context

devops implementation design for `stream-media-v0`, building on the shipped `home-stream-lifecycle-v0` + `room-chat-v0` runtime (single-origin nginx proxy, Valkey + streamer + portal, WS chat). The cross-scope decisions are frozen in the root record: D1 (streamer is token authority), D3 (media is a SECOND published origin — WebRTC can't traverse nginx), D4/D6 (auto-reap via LiveKit webhooks + DELETE also deletes the LiveKit room), and D9 (UDP port strategy + LiveKit dev config are devops's call). This document records the devops-owned *how*; it does not reopen those.

Hard constraint: devops is READ-ONLY on all service code. This design consumes streamer's LiveKit env contract and webhook endpoint; it never edits their code.

## Goals / Non-Goals

**Goals:**
- A single-node dev-mode LiveKit reachable by the browser (media) and by streamer (server-to-server), brought up with `docker compose up`.
- Browser WebRTC media reachability on localhost **without host networking** (works on Docker Desktop / macOS / Windows, not just Linux).
- Streamer gets its four LiveKit env vars and LiveKit delivers participant webhooks to streamer.
- The app plane stays single-origin behind nginx — LiveKit is purely additive.

**Non-Goals:**
- Any change to service code/Dockerfiles (read-only) or to the existing nginx/app routing.
- Production LiveKit: TLS, TURN, real keys, Redis multi-node, host networking (recorded future feature).
- Reopening frozen contracts (§6, D1, D3, D4, env-var names).

## Decisions

### DD1 — Official image, dev mode, pinned tag, config file
Use the official `livekit/livekit-server` pinned to a specific tag, configured with a devops-owned `livekit.yaml` mounted read-only, run as a single node. A config file (rather than only `--dev` flag / env) is chosen because we need to pin the UDP port, the keys, and the webhook URL deterministically — the boring, reproducible option. Dev-mode semantics (well-known dev key/secret, no auth hardening) are acceptable for v0 per the PRD.

### DD2 — Ports: WS 7880, TCP 7881, a SINGLE UDP mux port (7882) — the fiddly zone
Publish exactly:
- `7880/tcp` — WebSocket signaling (browser ↔ LiveKit) and streamer's server API.
- `7881/tcp` — ICE/TCP fallback when UDP is blocked.
- `7882/udp` — a **single UDP port with UDP mux** for all media, published `7882:7882/udp`.

**Chosen over** publishing LiveKit's default UDP range (e.g. 50000–60000): publishing a 10k-port range on Docker Desktop is impractically slow and often unreliable. LiveKit supports a single UDP mux port (`rtc.udp_port`), which carries all participants' media over one port — the standard Docker-without-host-networking recipe. TCP 7881 is the fallback if a network blocks UDP.

Host networking (`network_mode: host`) would sidestep port mapping entirely but is **Linux-only** — it does not work on Docker Desktop for macOS/Windows. So the supported cross-platform local path is published ports + single UDP mux, documented as such; host networking is noted as a Linux-only optimization, not the default.

### DD3 — Localhost IP advertisement (`use_external_ip: false`)
For localhost dev the browser connects to `127.0.0.1`, so LiveKit must advertise ICE candidates the host can reach. Set `rtc.use_external_ip: false` so LiveKit does not try to discover a public IP via STUN; combined with the published UDP port on localhost this is the known dev recipe. This is the single most fragile setting — it is verified during apply with Chrome fake devices, and if a platform still fails, config is investigated first (per the PRD's "devops investigates config first"). If localhost candidates need an explicit override, `rtc.node_ip` / a `LIVEKIT_NODE_IP` is the escape hatch, recorded but not used unless needed.

### DD4 — Env vars + dev key/secret (labeled DEV-ONLY)
Supply the `streamer` service: `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `LIVEKIT_URL=http://livekit:7880` (internal), `LIVEKIT_PUBLIC_URL=ws://localhost:7880` (browser). The key/secret are the well-known LiveKit dev pair, and the SAME pair is written into `livekit.yaml`'s `keys` so streamer's signed tokens validate against the server. All via `${VAR:-default}` so the env runs with documented defaults. `.env.example` documents them with a loud DEV-ONLY label. These are not secrets to protect (public dev defaults) — the label exists so nobody promotes them to prod.

**Scheme resolved with streamer:** `LIVEKIT_URL` is **`http://`** (not `ws://`) — streamer's Go RoomServiceClient (DeleteRoom, ListParticipants) uses LiveKit's HTTP/Twirp API served on the signaling port `7880`, so `http://livekit:7880` is the unambiguous server-API form. `LIVEKIT_PUBLIC_URL` stays `ws://localhost:7880` (the browser's WebRTC signaling URL), passed through opaquely by streamer.

### DD5 — Webhook wiring (LiveKit → streamer)
Configure `livekit.yaml`'s `webhook` with `api_key: <dev key>` and `urls: [ http://streamer:8080/livekit/webhook ]` (path **confirmed with streamer**), pointing at streamer's webhook endpoint on the internal compose network. LiveKit signs the webhook with the dev API key; streamer verifies the signature and rejects anything unsigned. This is server-to-server (not through nginx, not browser-facing). It powers streamer's auto-reap (D4); the creation-grace reaper + escape-hatch DELETE are streamer-side backstops if a webhook is missed.

### DD6 — Dependency ordering
`streamer` should have LiveKit available for room management / webhooks, but LiveKit is not required for streamer to start serving HTTP (token minting is offline signing; room deletion tolerates LiveKit being unreachable per D6). So `streamer depends_on livekit: service_started` (not a hard health gate) is sufficient; if LiveKit exposes a health/readiness signal, gate on it, otherwise service_started. LiveKit itself depends on nothing in our stack (no Redis). The proxy is unchanged (it does not front LiveKit).

### DD7 — What devops does NOT own (consumed contracts)
- streamer reading the four env vars by name and exposing the webhook endpoint path — streamer's.
- streamer's use of `LIVEKIT_URL` for the server API + token signing — streamer's.
- qc-portal connecting to the `url` from the token response via `livekit-client` — qc-portal's.
All consumed at runtime; issues are reported upstream with evidence, never patched here.

## Risks / Trade-offs

- **UDP media in Docker is THE fiddly zone** → single UDP mux port + `use_external_ip: false` is the boring known recipe; TCP 7881 fallback covers UDP-blocked networks. Verified with Chrome fake devices during apply, not assumed. Host networking is Linux-only and not the default.
- **ICE candidate / localhost advertisement** → `use_external_ip: false` is the fragile setting; `rtc.node_ip` override is the recorded escape hatch if a platform misbehaves.
- **Webhook path mismatch** → coordinate the exact path with streamer before finalizing; a wrong path silently breaks auto-reap (but streamer's creation-grace + escape-hatch are backstops).
- **Dev key/secret** → public dev defaults, labeled DEV-ONLY; the same pair in `livekit.yaml` and streamer's env so tokens validate. Not a secret to protect in v0; the label prevents prod promotion.
- **Sequencing** → LiveKit service + env + webhook config authorable now; acceptance #1 (real media E2E) waits on streamer's token/webhook image + qc-portal's livekit-client image, then Chrome fake-device verification.

## Migration Plan

Additive: one new compose service, four env vars, one config file, doc updates. No data migration; Valkey unchanged. Delivery: devops adds LiveKit + env + webhook config now and validates `docker compose config` + a LiveKit-only bring-up (server starts, WS port answers); the full media E2E (AC #1) is proven once streamer's and qc-portal's images build, using Chrome fake media devices. Feature pending until all three report done with evidence.

## Open Questions

- **RESOLVED with streamer (race GO):** `LIVEKIT_URL=http://livekit:7880` (HTTP/Twirp server API), `LIVEKIT_PUBLIC_URL=ws://localhost:7880` (browser), webhook path `POST http://streamer:8080/livekit/webhook` (signed with the dev API key). Env-var names confirmed verbatim.
- Whether the pinned LiveKit image exposes a health/readiness endpoint for `depends_on` gating (else service_started). Verify at apply.
- None reopen a frozen contract; the above settled during coordination.
