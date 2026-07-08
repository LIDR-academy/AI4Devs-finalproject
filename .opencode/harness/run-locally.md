# Run Locally

Step-by-step guide to get Realista running on your machine. Assumes macOS/Linux. Windows users: use WSL2.

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | 20 LTS | `nvm install 20 && nvm use 20` |
| npm | 10+ | bundled with Node 20 |
| Docker | 24+ | https://docs.docker.com/get-docker/ |
| Docker Compose | v2 (bundled with Docker Desktop) | n/a |
| Git | 2.30+ | https://git-scm.com |

## 1. Clone and checkout branch

```bash
git clone https://github.com/dmiguelm/AI4Devs-finalproject-DMM.git
cd AI4Devs-finalproject-DMM
git checkout feature-entrega2-DMM
```

## 2. Install dependencies

```bash
# Root (Playwright + tooling)
npm install

# Backend
cd backend
npm install
cd ..

# Frontend
cd frontend
npm install
cd ..

# E2E (optional, for full local E2E)
cd e2e
npm install
cd ..
```

## 3. Configure environment

```bash
# Copy the example file
cp .env.example .env

# Edit with your secrets
$EDITOR .env
```

Required edits:

- `OPENROUTER_API_KEY` — get one at https://openrouter.ai/keys
- `DATABASE_URL` — leave as default for local Docker
- `FRONTEND_URL` — leave as default for local dev

## 4. Start the database

```bash
docker compose up -d
```

This starts:

- `postgres` on `localhost:5432`
- `adminer` (DB UI) on `localhost:8080`

Verify:

```bash
docker compose ps
```

## 5. Run database migrations

```bash
cd backend
npx prisma migrate dev
npx prisma generate
cd ..
```

You should see a new `node_modules/.prisma/client` directory.

## 6. (Optional) Seed the database

```bash
cd backend
npm run db:seed
cd ..
```

This populates:

- Default checklist template (T082 seed)
- Sample templates for narrative generation

## 7. Start the dev servers

In two terminals:

```bash
# Terminal 1: backend
cd backend
npm run dev
# → listening on http://localhost:3001
```

```bash
# Terminal 2: frontend
cd frontend
npm run dev
# → listening on http://localhost:5173
```

Or use the root-level script to start both:

```bash
# From repo root
npm run dev
```

## 8. Verify

Open http://localhost:5173 in your browser. You should see the Realista dashboard.

Test the API:

```bash
curl http://localhost:3001/health
# → {"status":"ok","timestamp":"..."}
```

Test the full flow:

1. Click "Analizar un anuncio"
2. Paste a URL from Idealista (e.g., a real listing)
3. Wait 8-15 seconds for the analysis
4. Verify the transparency score, red flags, and cadastral comparison appear
5. Navigate to "Mortgage Compass" and complete the form
6. Navigate to "Dashboard" and verify the data is reflected

## 9. Run the test suite

```bash
# Backend
cd backend
npm test
npm run test:coverage

# Frontend
cd frontend
npm test

# E2E
cd e2e
npx playwright test
```

## 10. Optional: enable real-API E2E

By default, E2E mocks external services. To run E2E against real APIs:

```bash
# .env
MOCK_OPENROUTER=false
MOCK_NOMINATIM=false
MOCK_CATASTRO=false

npx playwright test
```

Warning: this consumes OpenRouter tokens and is rate-limited by Catastro. Use sparingly.

## Troubleshooting

See `troubleshooting.md`.

## Common issues

### "Cannot connect to database"

```bash
docker compose ps  # is postgres running?
docker compose logs postgres  # any errors?
```

### "Port 3001 already in use"

```bash
lsof -i :3001  # what's using it?
# Change PORT in .env
```

### "Prisma client out of sync"

```bash
cd backend
npx prisma generate
```

### "Module not found" after `git pull`

```bash
# Reinstall
rm -rf node_modules
npm install
```

## Next steps

- Read `.opencode/README.md` to understand the AI components
- Read `specs/001-realista-mvp/spec.md` to understand the product
- Read `docs/evidence/INDEX.md` to see the self-documentation history
- Open a new branch for your feature: `git checkout -b feature-<name>`
