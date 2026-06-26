import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/global-setup.ts',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: /users\.spec\.ts|clients\.spec\.ts|vehicles\.spec\.ts/,
    },
    {
      name: 'chromium-admin',
      testMatch: /users\.spec\.ts/,
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/admin.json',
      },
    },
    {
      name: 'chromium-clients',
      testMatch: /clients\.spec\.ts/,
      dependencies: ['setup', 'setup-mechanic'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/admin.json',
      },
    },
    {
      name: 'chromium-vehicles',
      testMatch: /vehicles\.spec\.ts/,
      dependencies: ['setup', 'setup-mechanic'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/admin.json',
      },
    },
    {
      name: 'chromium-work-orders',
      testMatch: /work-orders\.spec\.ts/,
      dependencies: ['setup', 'setup-mechanic'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/admin.json',
      },
    },
    {
      name: 'chromium-work-order-tasks',
      testMatch: /work-order-tasks\.spec\.ts/,
      dependencies: ['setup', 'setup-mechanic'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/admin.json',
      },
    },
    {
      name: 'chromium-technical-notes',
      testMatch: /technical-notes\.spec\.ts/,
      dependencies: ['setup', 'setup-mechanic'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/admin.json',
      },
    },
    {
      name: 'chromium-delivery-panel',
      testMatch: /delivery-panel\.spec\.ts/,
      dependencies: ['setup', 'setup-mechanic'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/admin.json',
      },
    },
    {
      name: 'chromium-history',
      testMatch: /history\.spec\.ts/,
      dependencies: ['setup', 'setup-mechanic'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/admin.json',
      },
    },
    {
      name: 'setup-mechanic',
      testMatch: /auth-mechanic\.setup\.ts/,
      dependencies: ['setup'],
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
