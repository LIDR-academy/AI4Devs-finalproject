# Reading Analytics Platform — Frontend

React 19 + Vite + TypeScript SPA for **Reading Analytics Platform** (desktop-first, Spanish UI).

## Quick start

See the full guide: [`docs/development_guide.md`](../docs/development_guide.md).

```bash
cd frontend
cp .env.example .env   # VITE_API_URL=http://localhost:3000/v1
npm install
npm run dev
```

App URL: `http://localhost:5173` — open `/login` and use dev-login (backend must be running).

## Production

| | URL |
|---|-----|
| **Live app** | https://reading-analytics.vercel.app |
| **API** | https://reading-analytics-api.onrender.com/v1 |

Deploy settings: [`docs/deployment.md`](../docs/deployment.md) (`VITE_API_URL` on Vercel, root `frontend/`).

## Routes (MVP)

| Route | Page |
|-------|------|
| `/` | Home — books in progress, monthly KPIs, goal, current TBR |
| `/book-tracker` | Library table, add book, reading lifecycle |
| `/stats` | Reading Stats dashboards and insights |
| `/lists` | Monthly TBR |
| `/goals` | Annual reading goal |
| `/settings` | Genres, formats, audiences, theme |
| `/import` | Goodreads CSV import |
| `/library`, `/recap` | Placeholders (UC-09 / UC-10) |

## Structure

- `src/pages/` — route-level views
- `src/components/` — shared UI (layout, modals, charts, Home cards)
- `src/api/` — typed REST client (`client.ts`, `types.ts`, `errors.ts`)
- `src/theme/` — design tokens (PRD palette)
- `src/lib/locale.ts` — Spanish date/number formatting

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |

## Documentation

- [`docs/standards/frontend-standards.md`](../docs/standards/frontend-standards.md) — coding conventions
- [`docs/api-spec.yml`](../docs/api-spec.yml) — API contracts consumed by `src/api/`
