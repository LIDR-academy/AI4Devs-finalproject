# Realista Backend

Express + TypeScript backend following hexagonal architecture. Owns:

- REST API for all 6 user stories
- PostgreSQL persistence via Prisma
- OpenRouter LLM integration (Listing Lens analyzer)
- Nominatim geocoding
- Catastro SEC cross-reference
- Session UUID management and rate limiting

## Quick start

```bash
# From repo root
docker compose up -d             # start postgres
cd backend
cp .env.example .env             # configure
npm install
npx prisma migrate dev
npm run db:seed                  # seed default checklist + narrative templates
npm run dev                      # http://localhost:3001
```

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Watch mode (tsx) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled JS (production) |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest unit tests |
| `npm run test:integration` | Vitest integration tests |
| `npm run test:contract` | API contract tests |
| `npm run test:coverage` | Coverage report (80% domain required) |
| `npm run db:migrate` | `prisma migrate dev` |
| `npm run db:reset` | Wipe + re-migrate (DESTRUCTIVE in dev) |
| `npm run db:seed` | Seed default data |
| `npm run db:studio` | Prisma Studio (DB UI) |
| `npm run check:hexagonal` | Run `hexagonal-check` skill |

## Layout

```
src/
├── domain/         # Aggregates, VOs, ports, services (zero framework deps)
├── adapters/       # OpenRouter, Cheerio, Catastro, Nominatim, etc.
├── api/            # Express routes, middleware, controllers
├── infrastructure/ # Prisma client, env config
└── index.ts        # Entry point
```

## Constitutional compliance

- **Principle I (Hexagonal)** — `domain/` has zero `express`, `prisma`, `svelte`, `cheerio`, `node-fetch` imports. Verified by `npm run check:hexagonal`.
- **Principle II (TDD)** — tests written first, ≥80% domain coverage.
- **Principle III (Educational)** — Mortgage Compass narratives use templates (no LLM). See `.opencode/prompts/narrative-templates.md`.
- **Principle IV (Privacy)** — User-Agent `Realista/1.0 (analizador educativo)`. No third-party content stored.

## Documentation

- `.opencode/harness/` — stack, env vars, test strategy, run locally, troubleshooting
- `.opencode/agents/implementer.md` — how the implementer agent builds features
- `.opencode/skills/` — TDD cycle, hexagonal check, etc.
- `specs/001-realista-mvp/` — product spec
- `docs/evidence/` — per-task evidence (self-documentation)
