# QuickChat Portal (`qc-portal`)

The frontend of QuickChat. This v0 slice delivers the **Streamings** experience:
a Home page listing live streams, a modal flow to start a stream, and a stream
page to end it. Built with TypeScript, Vite, VanJS, Bun, and Tailwind v4.

## What it is

- **Home (`/`)** — fetches `GET /streams` once on load (no polling) and lists live
  streams by title, with a **Start streaming** action. Calm empty state when none.
- **Start flow** — a single modal: required title + optional description
  (≤ 100 Unicode code points), `POST /streams`, redirect to the new stream on success.
- **Stream page (`/stream/{id}`)** — placeholder content + **End stream**
  (`DELETE /streams/{id}`), redirecting Home on success or if already ended.

The portal consumes the streamer HTTP contract at the **same-origin path `/streams`**
— no base URL is baked into the bundle, and there is no CORS. In production a reverse
proxy routes `/streams*` to streamer and everything else to this app's static server.

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

Vite serves the app and proxies the literal `/streams` path to `STREAMER_PROXY_TARGET`,
mirroring the production single-origin setup.

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
