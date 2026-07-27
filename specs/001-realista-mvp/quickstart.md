# Quickstart: Realista MVP

## Prerequisites

- Node.js 20+
- PostgreSQL 16+
- [uv](https://docs.astral.sh/uv/) (para gestión de Python, spec-kit)
- OpenRouter API key

## Setup

```bash
# 1. Clone and install
git checkout 001-realista-mvp
npm install

# 2. Environment variables
cp .env.example .env
# Fill in: DATABASE_URL, OPENROUTER_API_KEY

# 3. Database
npx prisma migrate dev --name init
npx prisma db seed

# 4. Start development
npm run dev          # Starts backend (3001) + frontend (5173)
```

### Playwright (DataDome bypass)

El escaneo de URLs contra Idealista/Fotocasa requiere un Chromium real. Instálalo una vez:

```bash
cd backend && npx playwright install chromium
```

Si no lo haces, el endpoint `/api/listings/analyze` con URL de un portal protegido devolverá `PORTAL_BLOCKED` y la UI mostrará el fallback de pegar texto.

## Run Tests

```bash
npm run test          # Vitest unit + integration
npm run test:e2e      # Playwright E2E (requires dev server running)
npm run lint          # ESLint
npm run typecheck     # TypeScript compiler check
```

## Validate E2E Flow

1. Open `http://localhost:5173`
2. Paste an Idealista URL in Listing Lens → verify score + red flags
3. Navigate to Mortgage Compass → enter property price, savings, income
4. Verify hidden costs breakdown and strategy comparison
5. Return to Dashboard → verify listing and profile persisted

## CI/CD Pipeline

```
Push to main → lint → typecheck → unit tests → integration tests → build → E2E → deploy
```

Pipeline config in `.github/workflows/ci.yml` (operativo — lint → typecheck → test → coverage → hexagonal-check → E2E).

## Project Structure

```
backend/     → Node.js + Express (hexagonal architecture)
frontend/    → SvelteKit + PWA (mobile-first)
e2e/         → Playwright end-to-end tests
specs/       → Spec-driven development artifacts
docs/        → Constitución, ADRs, eventos de dominio
.specify/    → Spec-kit toolkit (regenerable con 'specify init')
```

## Architecture Decision Records

See `docs/adr/` for:
- 001-hexagonal.md — Why hexagonal + DDD
- 002-avena-score.md — (deprecated) Why @avena/score was originally chosen as fallback
- 003-no-scraping.md — Why educational scraping vs commercial
