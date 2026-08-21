import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * El modo de salida del build, que no es una preferencia sino dos artefactos distintos.
 *
 * Se prueba porque el fallo es de los que no se ven venir: con `output: "standalone"`,
 * Next se lleva el trazado a `.next/standalone/` y no emite
 * `.next/next-server.js.nft.json`; el build de Vercel compila entero y muere al final
 * con un `ENOENT` sobre ese fichero que no menciona la palabra "standalone" por ningún
 * lado. Costó un despliegue fallido averiguarlo.
 *
 * `vi.resetModules()` antes de cada importación: la condición se resuelve al cargar el
 * módulo, así que sin eso la segunda prueba leería la decisión de la primera.
 */
async function loadConfig() {
  vi.resetModules();
  // La variable no se llama `module`: la regla `no-assign-module-variable` de Next lo
  // toma por el `module` de CommonJS.
  const cargado = await import("../next.config");
  return cargado.default;
}

describe("next.config", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("fuera de Vercel construye el paquete autónomo, que es lo que despliega la VM", async () => {
    vi.stubEnv("VERCEL", undefined);
    expect((await loadConfig()).output).toBe("standalone");
  });

  it("en Vercel no, o su paso final no encuentra el trazado del servidor", async () => {
    vi.stubEnv("VERCEL", "1");
    expect((await loadConfig()).output).toBeUndefined();
  });

  /**
   * El adaptador de Prisma queda fuera del bundle del servidor: es un paquete con
   * binario y empaquetarlo lo rompe.
   */
  it("mantiene Prisma como paquete externo del servidor", async () => {
    const config = await loadConfig();
    expect(config.serverExternalPackages).toContain("@prisma/client");
    expect(config.serverExternalPackages).toContain("@prisma/adapter-pg");
  });
});
