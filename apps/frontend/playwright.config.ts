import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';

// process.execPath = absolute path to the node binary running Playwright right now
// (e.g. /Users/foo/.nvm/versions/node/v22.x.x/bin/node).
// We prepend its directory to PATH so that every child process spawned by
// Playwright (webServer, helpers…) can find `node` and `npm` even in a
// non-interactive shell that hasn't sourced nvm.
const nodeBinDir = path.dirname(process.execPath);
const childEnv = {
  ...process.env,
  PATH: `${nodeBinDir}${path.delimiter}${process.env.PATH ?? ''}`,
};

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  expect: {
    timeout: 10_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // Only the Nuxt frontend is started automatically.
  // The backend API (http://localhost:4000) must be running before running tests.
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000/login',
    reuseExistingServer: !process.env.CI,
    env: childEnv,
    stdout: 'pipe',
    stderr: 'pipe',
    timeout: 120 * 1000,
  },
});
