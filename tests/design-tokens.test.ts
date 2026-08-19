import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * El contraste de la paleta se **mide**, no se promete.
 *
 * `documents/design-system.md` §3 publica una tabla de ratios; esta prueba es la que
 * la mantiene cierta. Sin ella, cualquiera puede subir la luminosidad de un token
 * "para que se vea mejor" y romper el AA sin que nada se queje: el navegador pinta
 * igual de contento un 3:1 que un 7:1.
 *
 * Las matemáticas viven aquí y no en `lib/`: convertir OKLCH a sRGB no le hace falta
 * a la aplicación en tiempo de ejecución, solo a esta comprobación.
 */

const CSS = readFileSync(resolve(process.cwd(), "app/globals.css"), "utf8");

type Oklch = [L: number, C: number, h: number];

function tokens(from: string, to: string): Record<string, Oklch> {
  const slice = CSS.slice(CSS.indexOf(from), CSS.indexOf(to));
  const out: Record<string, Oklch> = {};
  for (const line of slice.split("\n")) {
    const m = /--([a-z-]+):\s*oklch\(([\d.]+) ([\d.]+) ([\d.]+)\)/.exec(line);
    if (m) out[m[1]] = [Number(m[2]), Number(m[3]), Number(m[4])];
  }
  return out;
}

const LIGHT = tokens(":root {", ".dark {");
const DARK = tokens(".dark {", "@theme inline");

/** OKLCH → sRGB lineal (Björn Ottosson). */
function linearSrgb([L, C, hDeg]: Oklch): [number, number, number] {
  const h = (hDeg * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

/** Luminancia relativa WCAG. */
function luminance(color: Oklch): number {
  const [r, g, b] = linearSrgb(color).map((c) => Math.min(1, Math.max(0, c)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: Oklch, b: Oklch): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Un color fuera de gamut lo recorta el navegador, y el recorte cambia el ratio. */
function inGamut(color: Oklch): boolean {
  return linearSrgb(color).every((c) => c >= -0.001 && c <= 1.001);
}

const TEXT = 4.5; // WCAG 2.1 AA, 1.4.3 (texto normal).
const UI = 3; // WCAG 2.1 AA, 1.4.11 (bordes de control y foco).

const PAIRS: ReadonlyArray<readonly [string, string, number]> = [
  ["foreground", "background", TEXT],
  ["foreground", "card", TEXT],
  ["muted-foreground", "background", TEXT],
  ["muted-foreground", "muted", TEXT],
  ["primary-foreground", "primary", TEXT],
  ["primary", "background", TEXT],
  ["secondary-foreground", "secondary", TEXT],
  ["accent-foreground", "accent", TEXT],
  ["highlight-foreground", "highlight", TEXT],
  ["destructive", "background", TEXT],
  // El botón destructivo. Con `text-white` fijo —como venía de shadcn— el tema
  // oscuro se quedaba en 3.13:1, porque allí el rojo es mucho más claro.
  ["destructive-foreground", "destructive", TEXT],
  ["input", "background", UI],
  ["ring", "background", UI],
  ...(["neutral", "info", "success", "warning", "danger"] as const).flatMap(
    (tone) =>
      [
        [`tone-${tone}-foreground`, `tone-${tone}`, TEXT],
        // También sobre el fondo de la página: los tonos se usan como texto suelto,
        // no solo dentro de la píldora.
        [`tone-${tone}-foreground`, "background", TEXT],
      ] as const
  ),
];

describe.each([
  ["claro", LIGHT],
  ["oscuro", DARK],
])("Tokens de color — tema %s", (_theme, palette) => {
  it("se han leído los tokens del CSS", () => {
    expect(Object.keys(palette).length).toBeGreaterThan(20);
  });

  it("todos los colores caben en sRGB sin que el navegador los recorte", () => {
    const outside = Object.entries(palette).filter(([, color]) => !inGamut(color));
    expect(outside.map(([name]) => name)).toEqual([]);
  });

  it.each(PAIRS)("`%s` sobre `%s` llega a %s:1", (fg, bg, min) => {
    expect(palette[fg], `falta --${fg}`).toBeDefined();
    expect(palette[bg], `falta --${bg}`).toBeDefined();
    expect(contrast(palette[fg], palette[bg])).toBeGreaterThanOrEqual(min);
  });
});

describe("Tokens de color — los dos temas van a la par", () => {
  it("ningún token del claro se queda sin su versión oscura", () => {
    // Un token sin override en `.dark` hereda el valor claro y el modo oscuro se
    // rompe justo en ese punto, que además es el más difícil de ver revisando.
    const missing = Object.keys(LIGHT).filter((name) => !(name in DARK));
    expect(missing).toEqual([]);
  });
});
