import { defineConfig, devices } from "@playwright/test";

/**
 * E2E con Playwright.
 *
 * **Por defecto prueba contra el build de producción** (`next build` + `next start`),
 * no contra `next dev`. La razón no es el realismo sino la estabilidad: `next dev`
 * compila bajo demanda con un *pool* de workers propio que, con cinco Chromium y la
 * base de datos en la misma máquina, se quedaba sin memoria y moría
 * (`Jest worker encountered 2 child process exceptions, exceeding retry limit`).
 * A partir de ahí el servidor queda degradado: unas rutas cuelgan esperando el evento
 * `load` y otras devuelven un 500 en HTML, con timeouts intermitentes que no tienen
 * nada que ver con lo que la prueba comprueba. El build de producción no usa ese pool.
 *
 * El servidor que se levanta es el **artefacto de despliegue**: el paquete autónomo
 * (`output: "standalone"`, ADR-0001 §5) con sus estáticos copiados, no `next start`.
 * Así el E2E cubre también el empaquetado que va a la VM.
 *
 * Para iterar sobre una pantalla mientras se escribe, `E2E_DEV=1` apunta al servidor
 * de desarrollo de siempre (puerto 3000, un solo worker).
 */
const DEV = !!process.env.E2E_DEV;

/**
 * Puerto propio para el build de producción. Separarlo del 3000 evita la trampa
 * clásica: con un `next dev` abierto, `reuseExistingServer` daba por bueno ese
 * servidor y el E2E probaba otra cosa de la que creía.
 */
const PORT = DEV ? 3000 : 3100;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  // Compila las rutas públicas antes de arrancar cuando el objetivo es `next dev`;
  // contra el build de producción solo espera a que el servidor escuche.
  globalSetup: "./e2e/warmup.ts",
  fullyParallel: true,
  // 30 s (el defecto) se quedan cortos cuando la primera navegación de una prueba
  // dispara además la compilación de la ruta en `next dev`. Red de seguridad del
  // calentamiento, no sustituto suyo.
  timeout: 60_000,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // En desarrollo, en serie: es la única configuración en la que el pool de `next dev`
  // aguanta el recorrido completo. Contra el build de producción vale el defecto.
  workers: DEV ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: BASE_URL,
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
    command: DEV
      ? "npm run dev"
      : `npm run build && npm run start:standalone -- --port ${PORT}`,
    url: `${BASE_URL}/api/health`,
    // Contra el build de producción **nunca** se reutiliza lo que haya escuchando:
    // un `next start` viejo serviría un build anterior y los fallos no tendrían
    // sentido. Si el puerto está ocupado, que falle en voz alta.
    reuseExistingServer: DEV && !process.env.CI,
    // El build entra dentro de este reloj.
    timeout: 300_000,
    stdout: "pipe",
  },
});
