# stream-media Specification

## Purpose
TBD - created by archiving change stream-media-v0. Update Purpose after archive.
## Requirements
### Requirement: Mint a media access token
The service SHALL expose `POST /streams/{id}/media-token` with an **empty body** and **optional** authentication via `Authorization: Bearer <access token>` (`creatorKey` is retired). The room MUST exist in Valkey, else the service SHALL return `404` and SHALL NOT create a LiveKit room. On success it SHALL return `200` with `{ "token": string, "url": string, "identity": string, "role": "streamer" | "viewer" }`, where `token` is a signed LiveKit access token, `url` is the browser-facing LiveKit URL from `LIVEKIT_PUBLIC_URL`, and `identity`/`role` are server-stamped. A valid token whose `userId` is the stream owner SHALL grant publish+subscribe with `identity` = the account username and `role` = `"streamer"`. A valid token for a non-owner SHALL grant subscribe-only with `identity` = the account username and `role` = `"viewer"`. No or an invalid token (anonymous) SHALL grant subscribe-only with a generated word+alphanumeric `identity` and `role` = `"viewer"` — not an error. The LiveKit API secret SHALL NEVER appear in the response, logs, or errors.

#### Scenario: Owner gets a publish token
- **WHEN** the stream owner POSTs the media-token endpoint with a valid token whose `userId` is the owner
- **THEN** the response is `200` with a publish+subscribe token, `identity` = the account username, and `role` = `"streamer"`

#### Scenario: Signed-in non-owner gets subscribe-only
- **WHEN** a signed-in non-owner POSTs the media-token endpoint with a valid token
- **THEN** the response is `200` with a subscribe-only token, `identity` = their account username, and `role` = `"viewer"`

#### Scenario: Anonymous gets subscribe-only
- **WHEN** a client with no or an invalid token POSTs the media-token endpoint for an existing room
- **THEN** the response is `200` with a subscribe-only token, a generated `identity`, `role` = `"viewer"`, and no error

#### Scenario: Token for a nonexistent room
- **WHEN** a client POSTs the media-token endpoint for a room id that does not exist
- **THEN** the response is `404`

### Requirement: Publish permission is server-enforced by the token grant
The service SHALL encode publish permission in the token grant, not leave it to the client: a streamer token SHALL carry `CanPublish` true and `CanSubscribe` true; a viewer token SHALL carry `CanPublish` false and `CanSubscribe` true. The grant SHALL scope the token to the specific room. This makes any publish attempt with a viewer token rejectable by LiveKit.

#### Scenario: Viewer token grants no publish
- **WHEN** a subscribe-only token is minted
- **THEN** its decoded grant has `CanPublish` false and `CanSubscribe` true, scoped to the room (verified at the grant level, not via the UI)

#### Scenario: Streamer token grants publish
- **WHEN** a publish token is minted for a valid creator
- **THEN** its decoded grant has `CanPublish` true and `CanSubscribe` true, scoped to the room

### Requirement: Media tokens have a bounded lifetime
Every minted token SHALL have a bounded validity (a short TTL, documented in this scope), after which LiveKit rejects it.

#### Scenario: Token carries an expiry
- **WHEN** a token is minted
- **THEN** it encodes an expiry no further than the documented TTL from issue time

### Requirement: LiveKit webhooks are authenticated at the boundary
The service SHALL expose a webhook endpoint for LiveKit participant/room events and SHALL verify each request's signature against the LiveKit API key/secret before acting on it. An unsigned or invalidly signed request SHALL be rejected and SHALL cause no state change.

#### Scenario: Valid webhook is accepted
- **WHEN** LiveKit sends a correctly signed participant event
- **THEN** the service accepts it and updates its per-room reaper state

#### Scenario: Spoofed webhook is rejected
- **WHEN** a request arrives at the webhook endpoint with a missing or invalid signature
- **THEN** the service rejects it with a client error and makes no state change

### Requirement: Streamer auto-reaps abandoned rooms
The service SHALL track publisher presence per room from LiveKit webhooks. When the publisher (the creator identity) disconnects and does not return within a **departure grace window**, or a room never gets a publisher within a **creation grace window**, the service SHALL end the room — deleting the Valkey stream, its messages, and the LiveKit room — which fires the shipped room-ended broadcast so connected viewers redirect Home. A transient publisher drop that recovers within the grace window SHALL NOT reap the room or eject viewers. Both grace windows SHALL be documented in this scope. All reaper timers SHALL have a defined stop path and be cancelled at shutdown, leaking no goroutine.

#### Scenario: Publisher leaves past the grace
- **WHEN** the publisher disconnects and does not return within the departure grace window
- **THEN** the service ends the room (stream + messages + LiveKit room) and connected viewers receive the room-ended signal

#### Scenario: Transient publisher blip does not reap
- **WHEN** the publisher drops and returns within the departure grace window
- **THEN** the room is not reaped and viewers are not ejected

#### Scenario: Room that never gets a publisher is reaped
- **WHEN** a room is created but no publisher appears within the creation grace window
- **THEN** the service ends the room

### Requirement: LiveKit configuration from the environment with fail-fast startup
The service SHALL read `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `LIVEKIT_URL` (server-to-server), and `LIVEKIT_PUBLIC_URL` (browser-facing) only from the environment, and SHALL fail fast at startup when any is missing. The API secret SHALL NOT be logged, returned, or embedded in an image, and only `LIVEKIT_PUBLIC_URL` (never `LIVEKIT_URL` or the secret) SHALL cross the `/media-token` boundary.

#### Scenario: Missing LiveKit configuration
- **WHEN** the service starts without one of the four LiveKit variables set
- **THEN** startup fails immediately with an error naming the missing variable, and no server begins listening

#### Scenario: Secret never crosses the boundary
- **WHEN** any media-token response, log line, or error is produced
- **THEN** it contains neither the API secret nor the server-to-server `LIVEKIT_URL`

