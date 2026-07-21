## Why

The room's camera area is still a placeholder. This change delivers real camera + microphone media via a self-hosted **LiveKit SFU** (WebRTC): the stream creator publishes camera + mic after an explicit go-live, and everyone else subscribes and watches in the 2/3 camera area. Publish permission is server-enforced — `streamer` mints LiveKit tokens and only a valid `creatorKey` gets a publish grant.

This is the qc-portal deliverable for feature `stream-media-v0`. The cross-scope contract (PRD §6: `POST /streams/{id}/media-token`) and the decisions (root record D1–D9) are frozen; this change records only how the portal implements against them. It never restates the contract as changeable.

## What Changes

Component touched: **Rooms** (the room page camera area gains media). Home, Login, and the chat client are untouched (chat and media are independent — D8).

Adds a new capability `portal-stream-media`:
- **Media token boundary**: `POST /streams/{id}/media-token`, sending the in-memory `creatorKey` (if held) as `Authorization: Bearer <creatorKey>` (D2, matching the shipped DELETE). The `token` and `url` are treated as **opaque** and handed to `livekit-client` — the portal never parses the JWT. `role` (server-stamped) selects the creator vs viewer flow.
- **Creator flow** (token `role: "streamer"`): a **pre-join** step in the camera area — camera/mic permission + a local preview — and an explicit **Go live** action (no auto-publish). While live: **mute mic** and **camera off** toggles; End stream remains.
- **Viewer flow** (token `role: "viewer"`): subscribe and render the publisher's video + audio in the camera area (and the expanded area when chat is toggled), **starting muted** with a solid `ink`/`paper` tap-to-unmute affordance (AA over video, D8). No publisher on air → a calm offline state (quiet text on `gray-fill`, no spinner); publisher appears → video replaces it; publisher leaves → back to offline. Presence is detected client-side via `livekit-client` track events (D7).
- **Independence + resilience** (D8): media (WebRTC) and chat (WebSocket) are separate connections — a chat drop never tears down media and vice versa. A media drop triggers a quiet reconnect with simple backoff and calm styling.
- All WebRTC goes through **`livekit-client`** (blessed dependency); no manual SDP/ICE anywhere.

Modifies `portal-room-chat`:
- The room page **camera area** no longer renders a static placeholder; it hosts the media surface (creator pre-join/live, or viewer video/offline). The 2/3-wide + expanded-on-toggle layout is unchanged.

## Capabilities

### New Capabilities

- `portal-stream-media`: the portal-side media experience — the media-token boundary, creator pre-join + go-live + live controls, viewer muted-subscribe + tap-to-unmute + offline↔video presence, and independent media/chat connections with reconnect — consuming the frozen §6 media-token contract and driving `livekit-client`.

### Modified Capabilities

- `portal-room-chat`: the room page camera area hosts live media instead of the static placeholder.

## Impact

- **Scope**: qc-portal only. All files under `dev/qc-portal/`. No other scope touched.
- **New dependency**: `livekit-client` — the official LiveKit browser SDK, blessed by the PRD (§4) and the constitution (hand-rolling WebRTC is a boring-code violation). It is the only reasonable way to speak LiveKit's WebRTC protocol.
- **Consumes (frozen §6, not modified here)**: `POST /streams/{id}/media-token` at the same-origin `/streams` path (reached through the nginx proxy). The browser connects to **LiveKit cross-origin** at the `url` returned in the token response (a second published origin, D3) — the portal bakes no LiveKit URL.
- **Escape hatch / auto-reap (D4) are server-side**: the portal's creator-only End (Bearer key) is unchanged; abandoned/zombie rooms are reaped by streamer, and viewers are redirected Home by the **already-shipped** room-ended handling — no new portal redirect logic.
- **Coordination (for the race)**: the media-token contract shape + `role` semantics with streamer; that `Authorization: Bearer <creatorKey>` is the token transport (D2).
- **Constitutions**: `CONSTITUTION.md`, `CONSTITUTION.ts.md`, `CONSTITUTION.style.md`.
- **Not involved**: `security`, `users` — `creatorKey` remains the stopgap.

## Non-goals

- Screen share, co-hosts, viewer cameras (one publisher per room); a quality picker; recording/egress/thumbnails/Home previews.
- Server-side publisher-presence ("live" still means "room exists in Valkey"); any new redirect logic for streamer-left (reuses shipped room-ended handling).
- Production LiveKit hardening (TURN/TLS/real keys) — a future devops feature.
- Parsing the LiveKit JWT; any manual SDP/ICE; dark mode (style §8). Any change to §6 — it is law; changes route through the team lead.
