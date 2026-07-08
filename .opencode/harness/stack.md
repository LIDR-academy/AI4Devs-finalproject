# Stack

The Realista stack is the result of several decisions documented in `docs/adr/`. This document lists the exact versions, rationale, and compatibility notes.

## Languages

| Language | Version | Why |
|---|---|---|
| TypeScript | 5.4+ | Strict typing across frontend + backend; required for hexagonal purity |
| JavaScript (ES2022) | n/a | Runtime target for Vite/Node 20 |
| HTML/CSS (Svelte) | n/a | UI markup |
| SQL (PostgreSQL dialect) | 16 | Database |

## Runtime

| Runtime | Version | Why |
|---|---|---|
| Node.js | 20 LTS | Vite 5 support, native fetch, stable AbortController |
| npm | 10+ | Default package manager; deterministic with `package-lock.json` |

## Backend

| Package | Version | Purpose |
|---|---|---|
| `express` | 4.19+ | HTTP server, minimal |
| `@prisma/client` | 5.x | ORM, type-safe queries |
| `prisma` | 5.x (dev) | CLI for migrations |
| `cheerio` | 1.0.0-rc.12+ | HTML parsing, server-side |
| `node-fetch` | 3.x | HTTP client for OpenRouter + Nominatim + Catastro |
| `pino` | 9.x | Structured logging (via port) |
| `zod` | 3.x | Runtime schema validation (LLM output, env vars) |
| `vitest` | 1.x (dev) | Unit + integration tests |
| `@vitest/coverage-v8` | 1.x (dev) | Coverage report |
| `supertest` | 7.x (dev) | HTTP integration tests |
| `typescript` | 5.4+ (dev) | Compiler |
| `tsx` | 4.x (dev) | Run TS files in dev mode |
| `eslint` | 9.x (dev) | Linting |
| `prettier` | 3.x (dev) | Formatting |
| `@types/*` | matching | Type definitions |

## Frontend

| Package | Version | Purpose |
|---|---|---|
| `@sveltejs/kit` | 2.x | SvelteKit framework |
| `svelte` | 4.x | UI library |
| `vite` | 5.x | Build tool |
| `@sveltejs/adapter-node` | 5.x | Node adapter (for self-hosting) |
| `@vite-pwa/sveltekit` | 0.6+ | PWA plugin |
| `workbox-window` | 7.x | Service worker registration |
| `@testing-library/svelte` | 5.x (dev) | Component unit tests |
| `@playwright/test` | 1.4x+ (dev) | E2E tests |
| `svelte-check` | 3.x (dev) | TypeScript checking for .svelte |
| `vitest` | 1.x (dev) | Unit tests |
| `typescript` | 5.4+ (dev) | Compiler |
| `eslint` + `eslint-plugin-svelte` | 9.x (dev) | Linting |
| `prettier` + `prettier-plugin-svelte` | 3.x (dev) | Formatting |

## E2E

| Package | Version | Purpose |
|---|---|---|
| `@playwright/test` | 1.4x+ | E2E tests at root level (`e2e/`) |
| `dotenv` | 16.x (dev) | Load `.env` for test config |

## External services

| Service | Purpose | Auth | Cost |
|---|---|---|---|
| **OpenRouter** | LLM gateway for listing analysis | `OPENROUTER_API_KEY` | Pay-per-token, very cheap for dev |
| **Nominatim (OSM)** | Geocoding (address → coordinates) | None (User-Agent required) | Free |
| **Sede Electrónica del Catastro** | Cadastral cross-reference | None (User-Agent required) | Free, rate-limited |
| **PostgreSQL 16** | Primary data store | Local Docker in dev | Free |

## Why these choices

- **SvelteKit over Next.js** — better DX, smaller bundles, PWA-first. ADR documents the comparison.
- **Express over Fastify/NestJS** — minimal, transparent, well-known. Easy hexagonal layering.
- **PostgreSQL over MongoDB** — relational data (processes, listings, checklists) is naturally SQL.
- **Prisma over TypeORM/Drizzle** — type-safe, migration tooling, single source of truth.
- **OpenRouter over direct OpenAI/Anthropic** — flexibility to swap models, one API key.
- **Cheerio over Puppeteer** — server-side, fast, no browser needed. ADR documents the .m. fallback.
- **Vitest over Jest** — native ESM/TS support, faster, Vite-aligned.
- **Playwright over Cypress** — multi-browser, better API, well-supported in Node ecosystem.

## Compatibility matrix

| Component | Requires | Notes |
|---|---|---|
| `@sveltejs/kit` 2.x | `vite` 5.x | Breaking changes from SvelteKit 1 |
| `@vite-pwa/sveltekit` 0.6 | `@sveltejs/kit` 2.x | Older versions not compatible |
| `prisma` 5.x | Node 18.18+ | Node 20 LTS recommended |
| `cheerio` 1.0.0-rc | Node 18.17+ | ESM-only |
| `vitest` 1.x | Node 18+ | Same as Vite 5 |

## Node version manager

Use `nvm` or `fnm` to pin Node 20:

```bash
nvm use 20
# or
fnm use 20
```

Add a `.nvmrc` file at the repo root:

```
20
```

## Updating dependencies

- **Patch versions** — automatic via `dependabot.yml`
- **Minor versions** — review changelog, update manually
- **Major versions** — open a discussion; may require ADR
