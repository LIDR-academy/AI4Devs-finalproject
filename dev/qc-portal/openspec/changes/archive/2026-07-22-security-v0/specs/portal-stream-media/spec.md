## MODIFIED Requirements

### Requirement: Media token boundary
The portal SHALL fetch a media token from `POST /streams/{id}/media-token` with an empty body, attaching `Authorization: Bearer <access token>` via the auth seam when the user is signed in (auth-optional; the `creatorKey` mechanism is retired). It SHALL validate the response shape from `unknown` (`token`, `url`, `identity` strings; `role` ∈ `{ "streamer", "viewer" }`) before use, and SHALL treat `token` and `url` as **opaque** — passing them to `livekit-client` and NEVER parsing the JWT. A `404` (room gone) SHALL be surfaced as a failure. All media HTTP SHALL live in one non-UI module; UI components SHALL NOT call `fetch` directly. The `role` (server-stamped by ownership) selects the creator vs viewer flow.

#### Scenario: Signed-in owner token request carries the token
- **WHEN** the signed-in owner enters their room
- **THEN** the media-token request includes `Authorization: Bearer <access token>` and the response `role` is `"streamer"`

#### Scenario: Anonymous token request omits auth
- **WHEN** an anonymous visitor enters a room
- **THEN** the media-token request is sent without an `Authorization` header and the client accepts whatever `role` the response assigns (subscribe-only)

#### Scenario: Malformed token response is a failure
- **WHEN** the media-token response is missing a field or has an invalid `role`
- **THEN** the module reports a failure and no connection is attempted

### Requirement: Creator pre-join and explicit go-live
When the media token's `role` is `"streamer"` (server-stamped by ownership of the authenticated user — no key involved), the portal SHALL present a pre-join step in the media area — request camera/microphone and show a local preview — and SHALL publish ONLY on an explicit **Go live** action (no auto-publish). While live it SHALL provide **mute mic** and **camera off** toggles; the End stream action SHALL remain. Because the session survives reload, the owner keeps the publisher experience after reloading. All WebRTC SHALL go through `livekit-client`; there SHALL be no manual SDP/ICE code.

#### Scenario: Pre-join shows a preview and does not publish
- **WHEN** the signed-in owner arrives and grants camera/mic
- **THEN** a local preview is shown and nothing is published until they activate **Go live**

#### Scenario: Owner keeps the publisher experience across reload
- **WHEN** the owner reloads while on their room page
- **THEN** the session persists, the media token's `role` is still `"streamer"`, and the pre-join/go-live experience is retained

#### Scenario: Live controls toggle tracks
- **WHEN** the live owner activates mute mic or camera off
- **THEN** the corresponding local track is disabled through `livekit-client`
