/**
 * Calentamiento previo al E2E.
 *
 * `next dev` **compila cada ruta en su primera petición**. Con `fullyParallel` hay
 * cinco workers pidiendo rutas frías a la vez, y en esa avalancha la primera
 * navegación llegaba a agotar los 30 s de la prueba: fallaban `/` y `/catalogo`, que
 * son las primeras que se tocan, con un timeout que no tiene nada que ver con lo que
 * la prueba comprueba. El síntoma era intermitente, que es la peor clase de rojo.
 *
 * Se pide cada ruta pública **en serie** antes de empezar, para que la compilación
 * ocurra una vez y fuera del reloj de ninguna prueba.
 */

const BASE = "http://localhost:3000";

/** Rutas públicas: las protegidas las corta el proxy antes de compilar la página. */
const ROUTES = ["/api/health", "/", "/catalogo", "/planes", "/registro", "/login"];

async function waitForServer(): Promise<void> {
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      const response = await fetch(`${BASE}/api/health`);
      if (response.ok) return;
    } catch {
      // El servidor todavía no escucha; se reintenta.
    }
    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }
  throw new Error("El servidor de desarrollo no respondió en 60 s");
}

export default async function globalSetup(): Promise<void> {
  await waitForServer();
  for (const route of ROUTES) {
    await fetch(`${BASE}${route}`).catch(() => undefined);
  }
}
