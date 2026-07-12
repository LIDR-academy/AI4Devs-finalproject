# Flow Testing — Slice 3: Playwright whole-journey E2E

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax. During the spec task, use the **Playwright MCP** to drive the live stack and confirm selectors before writing assertions.

**Goal:** One real-browser end-to-end test of the core booking journey — register → search → open a property → checkout → confirmation — running against the full stack (frontend + backend + Postgres/PostGIS + MailHog) via `docker-compose`, with a new (initially non-blocking) CI job.

**Architecture:** `@playwright/test` drives Chromium against a `next start` frontend that talks (client-side) to the real backend; both run as containers alongside the existing Postgres/MailHog. Payments can't use real Stripe headlessly, so an **E2E-gated stub-payment path** in `PaymentForm` (enabled only when `NEXT_PUBLIC_E2E=true`) completes the journey using the backend's existing `StubPaymentAdapter` semantics. The journey is owned solely by this browser test (the backend integration tests own per-endpoint coverage).

**Tech stack:** Playwright, Next.js 15, Spring Boot 3.5 (bootJar), Docker + Compose, GitHub Actions.

**Scope:** Slice 3 of `docs/superpowers/specs/2026-06-19-e2e-flow-testing-strategy-design.md`. Slice 4 (enforcement) already merged (#140); Slices 1–2 (backend per-endpoint) merged (#138/#142/#143).

**Two notable production changes** (small, both reviewed): (a) add `data-testid`s to `SearchBar`; (b) add an `NEXT_PUBLIC_E2E`-gated stub-payment branch to `PaymentForm`. Everything else is new test/infra files. **If you object to (b), the fallback is to stop the E2E at the rendered checkout page** (assert booking hold + payment form) and leave payment→confirmation to the backend tests — but this plan implements the full journey.

**Branch/PR:** isolated worktree `git worktree add .worktrees/issue-<n>-e2e -b issue-<n>-e2e origin/main`; one PR. Create a tracking issue first.

---

### Task 1: Add `@playwright/test` + config + scripts

**Files:**
- Modify: `frontend/package.json`
- Create: `frontend/playwright.config.ts`
- Create: `frontend/tests/e2e/.gitkeep`
- Modify: `frontend/.gitignore`

- [ ] **Step 1: Add the dev dependency + scripts**

```bash
cd frontend && npm install -D @playwright/test@latest
```
Then add to `frontend/package.json` `scripts`:
```json
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
```

- [ ] **Step 2: Create `frontend/playwright.config.ts`**

```ts
import { defineConfig, devices } from '@playwright/test';

/**
 * E2E config. The full stack (frontend :3000 + backend :8080 + Postgres + MailHog)
 * is started by docker-compose BEFORE this runs (see docker-compose.e2e.yml and the
 * CI job), so there is no `webServer` block here — we point at the running frontend.
 * Override the target with PLAYWRIGHT_BASE_URL when needed.
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['html', { open: 'never' }], ['list']],
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
```

- [ ] **Step 3: Ignore Playwright output**

Append to `frontend/.gitignore`:
```
/test-results/
/playwright-report/
/blob-report/
/playwright/.cache/
```
Create `frontend/tests/e2e/.gitkeep` (empty) so the dir exists before the spec lands.

- [ ] **Step 4: Verify install (Artifactory auth is fixed; uses the env token)**

Run: `cd frontend && npm run test:e2e -- --list`
Expected: lists 0 tests (no specs yet) and exits 0 — proves Playwright resolves and config parses.

- [ ] **Step 5: Commit**

```bash
git add frontend/package.json frontend/package-lock.json frontend/playwright.config.ts frontend/tests/e2e/.gitkeep frontend/.gitignore
git commit -m "test(e2e): add @playwright/test, config, scripts (#<n>)"
```

---

### Task 2: Frontend testability changes (SearchBar testids + E2E stub-payment path)

**Files:**
- Modify: `frontend/src/components/search/SearchBar.tsx`
- Modify: `frontend/src/components/booking/PaymentForm.tsx`

- [ ] **Step 1: Add stable selectors to `SearchBar`**

Read the file first. Add `data-testid` attributes (do not change behavior): the `<form>` → `data-testid="search-form"`; the location text input → `data-testid="search-location"`; the submit button → `data-testid="search-submit"`. (The date inputs already have `id="check-in"` / `id="check-out"` — leave them; the spec can use those ids.)

- [ ] **Step 2: Add an E2E-gated stub-payment branch to `PaymentForm`**

Read `PaymentForm.tsx` first. It currently renders Stripe `<Elements>` + `CardElement` and calls `stripe.confirmCardPayment(clientSecret, …)` then `onSuccess(paymentIntent.id)`. Add a guarded branch at the **top of the component's render** (before any Stripe hooks/elements are required) so that when `process.env.NEXT_PUBLIC_E2E === 'true'`, it renders a plain button instead of Stripe:

```tsx
  // E2E mode: real Stripe Elements can't run headlessly with stub keys. When the
  // app is built for E2E, skip Stripe and complete using the backend's stub
  // PaymentIntent. The stub client secret is `pi_stub_secret_<paymentIntentId>`.
  if (process.env.NEXT_PUBLIC_E2E === 'true') {
    const stubPaymentIntentId = clientSecret.replace(/^pi_stub_secret_/, '');
    return (
      <div data-testid="payment-form-wrapper">
        <p className="text-sm text-gray-500 mb-2">E2E test mode — Stripe bypassed.</p>
        <button
          type="button"
          data-testid="pay-button"
          onClick={() => onSuccess(stubPaymentIntentId)}
          className="w-full bg-blue-600 text-white rounded-lg py-3 font-medium hover:bg-blue-700"
        >
          Pay (E2E)
        </button>
      </div>
    );
  }
```

Match the real prop names from the file (`clientSecret`, `onSuccess`, `onError`) — adjust the snippet to the actual signature. The normal (non-E2E) path is unchanged. Keep `data-testid="pay-button"` and `data-testid="payment-form-wrapper"` identical to production so the spec is mode-agnostic.

- [ ] **Step 3: Verify the frontend still builds + unit tests pass**

Run: `cd frontend && npm run test && npm run build`
Expected: vitest green; `next build` succeeds.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/search/SearchBar.tsx frontend/src/components/booking/PaymentForm.tsx
git commit -m "feat(e2e): search-bar testids + NEXT_PUBLIC_E2E stub-payment path (#<n>)"
```

---

### Task 3: Dockerfiles for backend and frontend

**Files:**
- Create: `backend/Dockerfile`, `backend/.dockerignore`
- Create: `frontend/Dockerfile`, `frontend/.dockerignore`

- [ ] **Step 1: `backend/Dockerfile`** (multi-stage: build bootJar with JDK 21, run on JRE 21)

```dockerfile
# syntax=docker/dockerfile:1
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY gradlew settings.gradle.kts build.gradle.kts ./
COPY gradle ./gradle
# Pre-fetch dependencies (better layer caching)
RUN ./gradlew --no-daemon dependencies > /dev/null 2>&1 || true
COPY src ./src
RUN ./gradlew --no-daemon clean bootJar -x test
# bootJar is the executable jar (exclude the *-plain.jar produced by the `jar` task)
RUN cp "$(ls build/libs/*.jar | grep -v plain | head -n1)" /app/app.jar

FROM eclipse-temurin:21-jre AS run
WORKDIR /app
COPY --from=build /app/app.jar ./app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
```

`backend/.dockerignore`:
```
build/
.gradle/
.kotlin/
*.log
.env
```

- [ ] **Step 2: `frontend/Dockerfile`** (build with NEXT_PUBLIC args baked in, run `next start`)

```dockerfile
# syntax=docker/dockerfile:1
FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --no-audit --no-fund
COPY . .
# NEXT_PUBLIC_* must be present at build time (inlined into the client bundle).
# These are client-reachable values: the browser calls the host-published backend.
ARG NEXT_PUBLIC_API_URL=http://localhost:8080
ARG NEXT_PUBLIC_E2E=true
ARG NEXT_PUBLIC_STRIPE_KEY=pk_test_dummy
ARG NEXT_PUBLIC_MAPBOX_TOKEN=test-token
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_E2E=$NEXT_PUBLIC_E2E \
    NEXT_PUBLIC_STRIPE_KEY=$NEXT_PUBLIC_STRIPE_KEY \
    NEXT_PUBLIC_MAPBOX_TOKEN=$NEXT_PUBLIC_MAPBOX_TOKEN
RUN npm run build

FROM node:22-bookworm-slim AS run
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/next.config.ts ./next.config.ts
EXPOSE 3000
CMD ["npm", "run", "start"]
```

`frontend/.dockerignore`:
```
node_modules/
.next/
test-results/
playwright-report/
.env.local
```

- [ ] **Step 3: Build both images to verify they compile**

Run: `docker build -t stayhub-backend ./backend && docker build -t stayhub-frontend ./frontend`
Expected: both succeed. (If the bootJar copy glob fails, `ls backend/build/libs` inside the build and fix the pattern; if `next start` needs a different output, confirm `next.config.ts` — currently default output, so `.next` + `next start` is correct.)

- [ ] **Step 4: Commit**

```bash
git add backend/Dockerfile backend/.dockerignore frontend/Dockerfile frontend/.dockerignore
git commit -m "build(e2e): backend + frontend Dockerfiles (#<n>)"
```

---

### Task 4: `docker-compose.e2e.yml`

**Files:**
- Create: `docker-compose.e2e.yml` (repo root — overlays the base `docker-compose.yml`)

- [ ] **Step 1: Write the overlay**

```yaml
# E2E stack: base infra (postgres + mailhog from docker-compose.yml) + the app.
# Usage: docker compose -f docker-compose.yml -f docker-compose.e2e.yml up --build -d
services:
  backend:
    build: ./backend
    container_name: stayhub-backend-e2e
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      POSTGRES_HOST: postgres
      POSTGRES_PORT: 5432
      POSTGRES_DB: ${DB_NAME:-stayhub}
      POSTGRES_USER: ${DB_USER:-stayhub}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-stayhub_dev}
      MAIL_HOST: mailhog
      MAIL_PORT: 1025
      MAIL_FROM: noreply@stayhub.local
      JWT_SECRET: e2e-jwt-secret-at-least-32-characters-long-000000
      JWT_ISSUER: stayhub
      STRIPE_API_KEY: sk_test_dummy
      STRIPE_WEBHOOK_SECRET: ""
      MAPBOX_API_KEY: test-token
    ports:
      - "8080:8080"
    healthcheck:
      test: ["CMD-SHELL", "wget -q -O - http://localhost:8080/actuator/health | grep -q UP"]
      interval: 10s
      timeout: 5s
      retries: 12
      start_period: 40s

  frontend:
    build:
      context: ./frontend
      args:
        NEXT_PUBLIC_API_URL: http://localhost:8080
        NEXT_PUBLIC_E2E: "true"
        NEXT_PUBLIC_STRIPE_KEY: pk_test_dummy
        NEXT_PUBLIC_MAPBOX_TOKEN: test-token
    container_name: stayhub-frontend-e2e
    depends_on:
      backend:
        condition: service_healthy
    ports:
      - "3000:3000"
    healthcheck:
      test: ["CMD-SHELL", "wget -q -O - http://localhost:3000/search > /dev/null 2>&1 || exit 1"]
      interval: 10s
      timeout: 5s
      retries: 12
      start_period: 30s
```

- [ ] **Step 2: Bring the stack up locally and verify**

```bash
docker compose -f docker-compose.yml -f docker-compose.e2e.yml up --build -d
# wait, then:
curl -s http://localhost:8080/actuator/health     # {"status":"UP"}
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/search   # 200
curl -s "http://localhost:8080/api/v1/properties/search?sw_lat=41.3&sw_lng=2.0&ne_lat=41.5&ne_lng=2.3&check_in=2026-08-01&check_out=2026-08-04" | head -c 120
```
Expected: backend UP, frontend 200, search returns seeded results. Leave the stack running for Task 5. If a service is unhealthy, `docker compose ... logs <svc>`.

- [ ] **Step 3: Commit**

```bash
git add docker-compose.e2e.yml
git commit -m "build(e2e): docker-compose.e2e.yml full-stack overlay (#<n>)"
```

---

### Task 5: The booking-journey spec (author against the live stack via the Playwright MCP)

**Files:**
- Create: `frontend/tests/e2e/booking-journey.spec.ts`

**With the stack from Task 4 running, use the Playwright MCP to walk the journey first** (`browser_navigate` to `http://localhost:3000/register`, snapshot, fill, click, etc.) to confirm each selector and the actual navigation/timing, THEN write the spec to match what you observed. Known selectors (verified): register form `register-email`/`register-password`/`register-first-name`/`register-last-name`/`register-submit`; search `search-location`/`search-submit` (added in Task 2) + `#check-in`/`#check-out`; results `[data-testid="property-grid"]` with `[data-property-id]` cards; property `reserve-button`; checkout `pay-button` (E2E stub) + `payment-form-wrapper`; confirmation `confirmation-page`/`reference-number`.

- [ ] **Step 1: Drive the journey via the MCP** (no file yet) — register a unique user, search Barcelona with future dates, open the first result, reserve, pay (E2E button), land on confirmation. Note the exact post-register landing, how dates are entered, and any waits needed.

- [ ] **Step 2: Write `booking-journey.spec.ts`** to encode the observed journey. Skeleton (adjust selectors/waits to what the MCP showed):

```ts
import { test, expect } from '@playwright/test';

test('guest registers, searches, books a property, and reaches confirmation', async ({ page }) => {
  const email = `e2e-${Date.now()}@example.com`;

  // 1. Register → lands on /search
  await page.goto('/register');
  await page.getByTestId('register-first-name').fill('E2E');
  await page.getByTestId('register-last-name').fill('Tester');
  await page.getByTestId('register-email').fill(email);
  await page.getByTestId('register-password').fill('pass1234');
  await page.getByTestId('register-submit').click();
  await expect(page).toHaveURL(/\/search/);

  // 2. Search Barcelona with future dates (date inputs use ids)
  await page.getByTestId('search-location').fill('barcelona');
  await page.locator('#check-in').fill('2026-08-10');
  await page.locator('#check-out').fill('2026-08-13');
  await page.getByTestId('search-submit').click();

  // 3. Open the first result
  const firstCard = page.locator('[data-testid="property-grid"] [data-property-id]').first();
  await expect(firstCard).toBeVisible();
  await firstCard.click();
  await expect(page.getByTestId('property-page')).toBeVisible();

  // 4. Reserve → checkout
  await page.getByTestId('reserve-button').click();
  await expect(page.getByTestId('payment-form-wrapper')).toBeVisible();

  // 5. Pay via the E2E stub path → confirmation
  await page.getByTestId('pay-button').click();
  await expect(page.getByTestId('confirmation-page')).toBeVisible();
  await expect(page.getByTestId('reference-number')).not.toBeEmpty();
});
```

- [ ] **Step 3: Run the spec against the live stack**

Run: `cd frontend && PLAYWRIGHT_BASE_URL=http://localhost:3000 npx playwright test`
Expected: 1 passed. If a step is flaky/locator wrong, fix against what the MCP showed (proper `getByTestId`, `waitFor`, etc.) — do NOT add arbitrary sleeps; use web-first assertions. If the property page needs `check_in/check_out` query params for the reserve button to enable, navigate the card with those or set them on the property page (observe via MCP).

- [ ] **Step 4: Commit**

```bash
git add frontend/tests/e2e/booking-journey.spec.ts
git commit -m "test(e2e): booking journey register->search->book->confirm (#<n>)"
```

---

### Task 6: `frontend-e2e-playwright` project skill

**Files:**
- Create: `.claude/skills/frontend-e2e-playwright/SKILL.md`

- [ ] **Step 1: Write the skill** (our conventions, so future agents extend the E2E correctly)

```markdown
---
name: frontend-e2e-playwright
description: Use when adding or changing a StayHub user journey that must be covered by the Playwright browser E2E. Encodes how the E2E stack runs (docker-compose.e2e.yml), where specs live, the stub-payment/no-map conventions, selector strategy, and how to run it locally and in CI.
---

# StayHub E2E (Playwright) Skill

## When
Any new or changed cross-page **user journey** (per the flow-testing strategy, journeys are covered here, not chained in backend integration tests).

## Stack
- Specs: `frontend/tests/e2e/*.spec.ts`; config `frontend/playwright.config.ts`.
- The full stack runs via `docker compose -f docker-compose.yml -f docker-compose.e2e.yml up --build -d` (frontend :3000, backend :8080, Postgres/PostGIS, MailHog). Playwright targets `http://localhost:3000`.
- Run locally: bring the stack up, then `cd frontend && npx playwright test`.

## Conventions (must follow)
- **Selectors:** use `data-testid` via `page.getByTestId(...)`. If a journey element lacks one, ADD a `data-testid` to the component (small, allowed) rather than relying on text/CSS.
- **No map dependency:** the Mapbox token is a dummy — navigate via the **results list** (`[data-testid="property-grid"] [data-property-id]`), never the map.
- **Payments:** the frontend is built with `NEXT_PUBLIC_E2E=true`, so `PaymentForm` renders a stub `pay-button` that completes via the backend `StubPaymentAdapter` — no real Stripe. Keep `pay-button`/`payment-form-wrapper` testids identical across modes.
- **Client-side API calls:** `NEXT_PUBLIC_API_URL` is baked at build time and must be the **host-reachable** backend URL (`http://localhost:8080`), because calls happen in the browser.
- **No arbitrary sleeps:** use web-first assertions (`expect(locator).toBeVisible()`), `getByTestId`, and Playwright auto-waiting.
- Keep the suite **thin** — the top journeys only; per-endpoint behavior is covered by backend integration tests (`presentation/api/integration/`).

## CI
The `e2e` job (`.github/workflows/test.yml`) builds the stack, waits for health, runs Playwright, uploads the report. It is **non-blocking until stable**, then promoted to a required check.
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/frontend-e2e-playwright/SKILL.md
git commit -m "docs(skill): add frontend-e2e-playwright project skill (#<n>)"
```

---

### Task 7: CI job (non-blocking)

**Files:**
- Modify: `.github/workflows/test.yml`

- [ ] **Step 1: Add an `e2e` job** (append to the `jobs:` map). Non-blocking via `continue-on-error: true` until the suite proves stable; it still uploads its report.

```yaml
  e2e:
    name: E2E (Playwright)
    runs-on: ubuntu-latest
    continue-on-error: true   # non-blocking until stable; then remove to make required
    steps:
      - uses: actions/checkout@v4

      - name: Build & start the full stack
        run: docker compose -f docker-compose.yml -f docker-compose.e2e.yml up --build -d

      - name: Wait for frontend to be healthy
        run: |
          for i in $(seq 1 30); do
            if curl -sf http://localhost:3000/search > /dev/null; then echo "up"; exit 0; fi
            sleep 5
          done
          echo "frontend did not become healthy"; docker compose -f docker-compose.yml -f docker-compose.e2e.yml logs --tail=100; exit 1

      - name: Set up Node 22
        uses: actions/setup-node@v4
        with:
          node-version: "22"

      - name: Install frontend deps + Playwright browser
        working-directory: frontend
        run: |
          npm install --include=dev --no-package-lock --no-audit --no-fund
          npx playwright install --with-deps chromium

      - name: Run Playwright
        working-directory: frontend
        run: npx playwright test

      - name: Upload Playwright report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: frontend/playwright-report/
          if-no-files-found: warn

      - name: Tear down
        if: always()
        run: docker compose -f docker-compose.yml -f docker-compose.e2e.yml down -v
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/test.yml
git commit -m "ci(e2e): non-blocking Playwright job over the compose stack (#<n>)"
```

---

### Task 8: Verify end-to-end locally, then PR

- [ ] **Step 1: Clean-room local run**

```bash
docker compose -f docker-compose.yml -f docker-compose.e2e.yml down -v
docker compose -f docker-compose.yml -f docker-compose.e2e.yml up --build -d
# wait for health (curl :8080/actuator/health = UP, :3000/search = 200)
cd frontend && npx playwright test
docker compose -f docker-compose.yml -f docker-compose.e2e.yml down -v
```
Expected: 1 E2E test passes against a freshly built stack.

- [ ] **Step 2: Frontend unit tests + build still green** — `cd frontend && npm run test && npm run build`.

- [ ] **Step 3: Push + open the PR** from `.github/pull_request_template.md`. Tick the Flow/E2E coverage checkbox (the journey is now covered by Playwright). Note the two production changes (SearchBar testids; `NEXT_PUBLIC_E2E` stub-payment path) and that the CI job is intentionally non-blocking. Reference the design spec and the tracking issue.

- [ ] **Step 4: Report** the PR URL, the E2E result, and that the CI `e2e` job is non-blocking (to be promoted to required after a few green runs).

---

## Review notes (for the two-stage review during execution)
- **Frontend prod changes are minimal and gated:** SearchBar testids are inert; the `PaymentForm` stub branch is behind `NEXT_PUBLIC_E2E` and never affects production builds (which don't set it). Arch/quality review should confirm the production Stripe path is untouched when the flag is unset.
- **No backend changes.** The backend Dockerfile is new infra, not a code change.

## Self-review
- **Spec coverage:** Playwright runner ✓ (T1); journey owned by browser test ✓ (T5); Dockerfiles + compose ✓ (T3/T4); project skill ✓ (T6); non-blocking CI job ✓ (T7); navigate-via-list + stub-payment + host-reachable API ✓ (built into T2/T3/T4/T5). 
- **Placeholders:** `#<n>` is the tracking issue, filled at execution start. The spec's exact selectors/waits are intentionally confirmed via the MCP in T5 Step 1 before writing (live-DOM dependent) — not guessed.
- **Identifier consistency:** testids used in the spec (`register-*`, `search-location`, `search-submit`, `property-grid`/`data-property-id`, `reserve-button`, `pay-button`, `payment-form-wrapper`, `confirmation-page`, `reference-number`) match those that exist today or are added in Task 2; `NEXT_PUBLIC_E2E` is set in the frontend Docker build args (T3) and read in `PaymentForm` (T2); `NEXT_PUBLIC_API_URL=http://localhost:8080` is host-reachable and CORS-allowed (backend permits `localhost:3000`).
