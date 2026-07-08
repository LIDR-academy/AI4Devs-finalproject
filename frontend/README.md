# Realista Frontend

SvelteKit PWA. Mobile-first (375px+ target), installable on iOS Safari and Android Chrome.

## Quick start

```bash
# From repo root
docker compose up -d             # postgres
cd backend && npm install && npx prisma migrate dev && cd ..
cd frontend
cp .env.example .env
npm install
npm run dev                      # http://localhost:5173
```

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Dev server with HMR |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run check` | svelte-check (typecheck .svelte files) |
| `npm run lint` | ESLint |
| `npm run test` | Vitest unit tests |
| `npm run test:e2e` | Playwright E2E |

## Layout

```
src/
├── routes/              # SvelteKit file-based routing
│   ├── +layout.svelte   # Shell with nav tabs
│   ├── +page.svelte     # Dashboard
│   ├── listing-lens/    # US1
│   ├── mortgage-compass/# US2
│   ├── timeline/        # US5
│   └── checklist/       # US6
├── lib/
│   ├── stores/          # Svelte writable stores
│   ├── api/             # Backend client
│   ├── components/      # Shared components
│   └── utils/           # Helpers
├── service-worker.ts    # PWA service worker (generated)
└── app.css              # Global styles
```

## PWA

- Manifest at `static/manifest.webmanifest` (configured in `vite.config.ts` via `@vite-pwa/sveltekit`)
- Service worker auto-generated
- Icons at `static/icons/` (192, 512, 512-maskable)
- iOS: meta tags in `src/app.html`

## Constitutional compliance

- **Principle V (PWA mobile-first)** — Tailwind-style mobile-first CSS, touch-friendly targets ≥ 44px
- **Principle III (AI disclaimer)** — `<AIDisclaimer />` shown on every view with AI-generated content (FR-017)
- **No third-party content in storage** — all LLM analysis fetched on demand, no caching of listing text

## Documentation

- `.opencode/harness/` — stack, env vars, test strategy
- `.opencode/agents/implementer.md` — how the implementer agent builds features
- `specs/001-realista-mvp/` — product spec
