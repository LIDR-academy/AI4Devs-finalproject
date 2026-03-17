import { resolve } from 'path';
import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for E2E and API tests.
 * Bundle-driven tests read from data/*.json and validate oracles.
 * global-setup seeds AUTH_TOKEN, TEST_TRIP_ID, TEST_EXPENSE_ID so no env is required.
 */
export default defineConfig({
  testDir: 'tests',
  globalSetup: resolve(process.cwd(), 'tests', 'e2e', 'global-setup.ts'),
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'api',
      use: {
        baseURL: (process.env.API_BASE_URL ?? 'http://localhost:3000/api').replace(/\/?$/, '/'),
      },
      testMatch: 'api/**/*.spec.ts',
    },
    {
      name: 'e2e',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:5173',
      },
      testMatch: 'e2e/**/*.spec.ts',
    },
  ],
});
