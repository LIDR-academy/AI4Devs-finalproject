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
    command: "PORT=3101 HOSTNAME=127.0.0.1 node .next/standalone/server.js",
    port: 3101,
    cwd: ".",
    reuseExistingServer: false,
  },
});
