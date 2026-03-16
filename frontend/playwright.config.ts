import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: "http://127.0.0.1:3101",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run start -- --port 3101 --hostname 127.0.0.1",
    port: 3101,
    cwd: __dirname,
    reuseExistingServer: false,
  },
});
