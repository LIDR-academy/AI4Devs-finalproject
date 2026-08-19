import { defineConfig, devices } from "@playwright/test";

/**
 * E2E con Playwright. Levanta la app Next en dev y prueba contra ella. Los recorridos
 * completos (suscriptor + back-office, tareas 5.7/8.4) se añaden con sus capabilities.
 */
export default defineConfig({
  testDir: "./e2e",
  // Compila las rutas públicas antes de arrancar; ver `e2e/warmup.ts`.
  globalSetup: "./e2e/warmup.ts",
  fullyParallel: true,
  // 30 s (el defecto) se quedan cortos cuando la primera navegación de una prueba
  // dispara además la compilación de la ruta en `next dev`. Red de seguridad del
  // calentamiento, no sustituto suyo.
  timeout: 60_000,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    // Móvil: objetivo mobile-first (ADR-0001) — **solo el smoke** en un viewport
    // pequeño. El recorrido completo se queda fuera a propósito: comparte estado con
    // la base sembrada (busca un set con una única copia y se la queda), así que
    // ejecutarlo en dos proyectos a la vez es una carrera — uno alquila la copia y
    // al otro le responden "no quedan". Lo que aporta el móvil es el viewport, no
    // repetir el circuito.
    {
      name: "mobile",
      use: { ...devices["Pixel 7"] },
      testMatch: /smoke\.spec\.ts/,
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
