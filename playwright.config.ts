import { defineConfig, devices } from "@playwright/test";

/**
 * E2E con Playwright. Levanta la app Next en dev y prueba contra ella. Los recorridos
 * completos (suscriptor + back-office, tareas 5.7/8.4) se añaden con sus capabilities.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    // Móvil: objetivo mobile-first (ADR-0001) — smoke en un viewport pequeño.
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
