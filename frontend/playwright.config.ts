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
