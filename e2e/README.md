# E2E Tests (Playwright)

End-to-end tests for the Realista app. Run against a real Postgres + backend + frontend.

## Prerequisites

1. Docker running (Postgres on port 5433):
   ```bash
   docker compose up -d
   ```

2. Backend running with mocks (port 3001):
   ```bash
   cd backend
   DATABASE_URL=postgresql://realista:realista@localhost:5433/realista \
   MOCK_OPENROUTER=true MOCK_NOMINATIM=true MOCK_CATASTRO=true \
   npm run dev
   ```

3. Frontend running (port 5173):
   ```bash
   cd frontend
   VITE_API_URL=http://localhost:3001 npm run dev
   ```

## Run

```bash
cd e2e
npx playwright install --with-deps chromium
npx playwright test
```

In CI, the steps above are orchestrated by `.github/workflows/ci.yml`.

## Tests

- `full-flow.spec.ts`:
  - Dashboard empty state visible
  - Listing Lens AI disclaimer present
  - Timeline shows milestones
  - **Happy path** (new): dashboard → analyze listing → see result → mortgage-compass → checklist
