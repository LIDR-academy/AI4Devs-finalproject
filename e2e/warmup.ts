import type { FullConfig } from "@playwright/test";

/**
 * Calentamiento previo al E2E.
 *
 * `next dev` **compila cada ruta en su primera petición**. Con `fullyParallel` había
 * varios workers pidiendo rutas frías a la vez, y en esa avalancha la primera
 * navegación llegaba a agotar los 30 s de la prueba: fallaban `/` y `/catalogo`, que
 * son las primeras que se tocan, con un timeout que no tiene nada que ver con lo que
 * la prueba comprueba. El síntoma era intermitente, que es la peor clase de rojo.
 *
 * Se pide cada ruta pública **en serie** antes de empezar, para que la compilación
 * ocurra una vez y fuera del reloj de ninguna prueba. Contra el build de producción
 * —el objetivo por defecto— no hay nada que compilar, pero el paseo cuesta
 * milisegundos y sirve de comprobación de que la aplicación responde antes de
 * culpar a una prueba.
 */

/** Rutas públicas: las protegidas las corta el proxy antes de compilar la página. */
const ROUTES = ["/api/health", "/", "/catalogo", "/planes", "/registro", "/login"];

async function waitForServer(base: string): Promise<void> {
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      const response = await fetch(`${base}/api/health`);
      if (response.ok) return;
    } catch {
      // El servidor todavía no escucha; se reintenta.
    }
    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }
  throw new Error(`El servidor no respondió en 60 s (${base})`);
}

export default async function globalSetup(config: FullConfig): Promise<void> {
  // La URL sale de la configuración, no de una constante: el objetivo cambia de
  // puerto según se pruebe el build de producción (3100) o `next dev` (3000).
  const base = config.projects[0]?.use?.baseURL ?? "http://localhost:3100";
  await waitForServer(base);
  for (const route of ROUTES) {
    await fetch(`${base}${route}`).catch(() => undefined);
  }
}
