import { describe, expect, it } from "vitest";
import { z } from "zod";

// Importarlo instala el mapa como defecto global de Zod, que es justo lo que se prueba.
import "@/http/validation-messages";
import { numericField, optionalNumericField } from "@/lib/form-values";

/** Primer mensaje que devuelve el esquema para ese valor. */
function mensaje(schema: z.ZodType, value: unknown): string {
  const result = schema.safeParse(value);
  if (result.success) throw new Error("Se esperaba un fallo de validación.");
  return result.error.issues[0].message;
}

describe("mensajes de validación", () => {
  /**
   * Los dos que reportó el usuario, tal cual salían: son de la tarjeta del alta, donde
   * el esquema no traía mensaje propio y Zod contestaba en inglés y en jerga.
   */
  const caducidad = z.number().int().min(1).max(12);

  it("un número fuera de rango se explica sin hablar de operadores", () => {
    expect(mensaje(caducidad, 13)).toBe("Tiene que ser 12 o menos.");
    expect(mensaje(caducidad, 0)).toBe("Tiene que ser 1 o más.");
  });

  it("un campo sin rellenar se llama obligatorio, no «invalid input»", () => {
    // `null` es lo que llega de verdad: `JSON.stringify` convierte `NaN` en `null`.
    expect(mensaje(caducidad, null)).toBe("Este dato es obligatorio.");
    expect(mensaje(z.string(), undefined)).toBe("Este dato es obligatorio.");
    expect(mensaje(z.string().min(1), "")).toBe("Este dato es obligatorio.");
  });

  it("un texto donde va un número dice qué se espera, no qué tipo se recibió", () => {
    expect(mensaje(z.number(), "trece")).toBe("Aquí va un número.");
    expect(mensaje(z.number().int(), 3.5)).toBe("Aquí va un número entero.");
  });

  it("las longitudes de texto se cuentan en caracteres", () => {
    expect(mensaje(z.string().min(8), "corta")).toBe("Escribe al menos 8 caracteres.");
    expect(mensaje(z.string().max(4), "demasiado larga")).toBe(
      "No puede pasar de 4 caracteres."
    );
  });

  it("los formatos dicen cómo se escribe el dato, con un ejemplo cuando ayuda", () => {
    expect(mensaje(z.email(), "sin-arroba")).toBe(
      "Escribe un email válido, con arroba y dominio."
    );
    expect(mensaje(z.url(), "clickoteca")).toBe(
      "Escribe una dirección web completa, con https:// delante."
    );
    expect(mensaje(z.string().regex(/^\d{4}$/), "ab")).toBe("El formato no es válido.");
  });

  it("elegir mal entre opciones no menciona enums ni literales", () => {
    expect(mensaje(z.enum(["BASIC", "PREMIUM"]), "GOLD")).toBe(
      "Elige una de las opciones disponibles."
    );
    expect(mensaje(z.literal(true), false)).toBe("Elige una de las opciones disponibles.");
  });

  /**
   * El mapa es una red, no un techo: donde el campo puede decir algo más útil que el
   * genérico, lo dice. Si el global ganara, poner mensajes propios no serviría de nada.
   */
  it("el mensaje propio del esquema manda sobre el genérico", () => {
    const mes = z
      .number("Indica el mes de caducidad de la tarjeta.")
      .max(12, "El mes va del 1 (enero) al 12 (diciembre).");

    expect(mensaje(mes, 13)).toBe("El mes va del 1 (enero) al 12 (diciembre).");
    expect(mensaje(mes, null)).toBe("Indica el mes de caducidad de la tarjeta.");
  });

  it("ningún mensaje se cuela en inglés ni con jerga de tipos", () => {
    const casos: Array<[z.ZodType, unknown]> = [
      [z.number(), null],
      [z.number().int(), 1.5],
      [z.number().min(3), 1],
      [z.number().max(3), 9],
      [z.string(), 42],
      [z.string().min(2), "a"],
      [z.string().max(2), "abc"],
      [z.email(), "x"],
      [z.url(), "x"],
      [z.uuid(), "x"],
      [z.boolean(), "sí"],
      [z.enum(["A", "B"]), "C"],
      [z.array(z.string()).min(1), []],
      [z.object({ a: z.string() }).strict(), { a: "x", b: 1 }],
    ];

    for (const [schema, valor] of casos) {
      const texto = mensaje(schema, valor);
      // La firma de los mensajes de Zod: palabras inglesas y sintaxis de comparación.
      expect(texto, `valor ${JSON.stringify(valor)}`).not.toMatch(
        /invalid|expected|received|too (big|small)|[<>]=/i
      );
      expect(texto.endsWith(".")).toBe(true);
    }
  });
});

describe("números que salen de un formulario", () => {
  it("un campo vacío viaja como «no hay dato», no como cero", () => {
    // `Number("")` es 0, y un cero es un valor válido: el servidor no podría saber que
    // en realidad no se rellenó nada.
    expect(numericField("")).toBeNull();
    expect(numericField("   ")).toBeNull();
    expect(numericField(null)).toBeNull();
  });

  it("lo que no es un número viaja como el texto escrito", () => {
    // Enviarlo como `NaN` no serviría: `JSON.stringify` lo convierte en `null` y el
    // servidor vería lo mismo que si el campo estuviera vacío.
    expect(numericField("trece")).toBe("trece");
    expect(numericField("12/26")).toBe("12/26");
    expect(numericField("Infinity")).toBe("Infinity");
  });

  it("un número llega como número, sin espacios de más", () => {
    expect(numericField(" 12 ")).toBe(12);
    expect(numericField("0")).toBe(0);
    expect(numericField("-3")).toBe(-3);
    expect(numericField("14.99")).toBe(14.99);
  });

  it("en un campo opcional, vacío significa cosas distintas al crear y al editar", () => {
    // Al crear, el campo no se manda; al editar, `null` borra lo que hubiera.
    expect(optionalNumericField("", { editing: false })).toBeUndefined();
    expect(optionalNumericField("", { editing: true })).toBeNull();
    expect(optionalNumericField("1999", { editing: false })).toBe(1999);
  });
});
