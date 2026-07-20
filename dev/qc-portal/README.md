# QuickChat Portal (`qc-portal`)

The frontend of QuickChat. It delivers the **Streamings** and **Rooms** experience:
a Home page listing live streams, a modal flow to start a stream, and a room page
with live chat. Built with TypeScript, Vite, VanJS, Bun, and Tailwind v4.

## What it is

- **Home (`/`)** — fetches `GET /streams` once on load (no polling) and lists live
  streams by username + title, with a **Start streaming** action. Calm empty state when none.
- **Start flow** — a single modal: required username + title + optional description
  (≤ 100 Unicode code points), `POST /streams`; the returned `creatorKey` is kept in
  memory only (never persisted), then redirect to the new room.
- **Room page (`/stream/{id}`)** — camera placeholder + live **chat** (camera 2/3 +
  chat 1/3 wide, stacked rows narrow, with a chat toggle), and **End stream**
  (`DELETE /streams/{id}`). Chat history loads over HTTP and live messages over a
  WebSocket, reconciled so nothing is missed or duplicated; the stream creator is
  labelled **STREAMER** from a server-stamped role.

The portal consumes the streamer HTTP + WebSocket contract at the **same-origin path
`/streams`** (chat WS at `/streams/{id}/ws`) — no base URL is baked into the bundle,
and there is no CORS. In production a reverse proxy routes `/streams*` (HTTP and WS
upgrade) to streamer and everything else to this app's static server.

## Prerequisites

- [Bun](https://bun.sh) (runtime, package manager, test runner).

## Install

```sh
bun install
```

## Run (development)

```sh
cp .env.example .env   # set STREAMER_PROXY_TARGET if streamer isn't on :8080
bun run dev
```

Vite serves the app and proxies the literal `/streams` path (HTTP and the chat
WebSocket upgrade at `/streams/{id}/ws`) to `STREAMER_PROXY_TARGET`, mirroring the
production single-origin setup.

## Test

```sh
bun test          # unit + component tests (happy-dom)
bun run typecheck # tsc --noEmit, strict mode
bun run lint      # Biome: lint + format check
```

## Build & serve (production image)

```sh
bun run build     # type-checks, then builds static assets to ./dist
bun run serve     # serves ./dist on $PORT (default 3000) with SPA fallback
```

The `Dockerfile` does the same in two stages and is what `devops` runs in compose.

## Environment variables

| Variable                 | Where    | Default                 | Purpose                                                  |
| ------------------------ | -------- | ----------------------- | -------------------------------------------------------- |
| `STREAMER_PROXY_TARGET`  | dev only | `http://localhost:8080` | Where `bun run dev` proxies `/streams` (not in the bundle). |
| `PORT`                   | runtime  | `3000`                  | Port the static server (`server.ts`) listens on.         |
