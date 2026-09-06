import { z } from "zod";

/**
 * Mensajes de validación en castellano llano — el **respaldo global** de Zod.
 *
 * El contrato RFC 9457 lleva los fallos de validación al cliente en `errors[]`, y el
 * formulario los pinta tal cual junto a su campo (ADR-0002 §2). Así que lo que escriba
 * Zod lo lee una persona. Sus mensajes por defecto están en inglés y son de programador
 * —"Too big: expected number to be <=12"—, y hasta ahora la defensa era acordarse de
 * poner un mensaje propio en cada regla: en el alta se olvidó, y el mes de caducidad de
 * la tarjeta contestaba en inglés.
 *
 * Esto lo invierte: el idioma y el tono correctos son el **defecto**, y olvidarse ya no
 * rompe nada. Un mensaje escrito en el esquema sigue mandando sobre este mapa, que es
 * justo lo que se quiere — el genérico es una red, no un techo: donde el campo pueda
 * decir algo más útil ("El mes va de 1 a 12"), que lo diga.
 *
 * **No se usa `z.locales.es()`**, que existe: traduce literalmente y deja el mismo
 * lenguaje técnico en otro idioma ("Demasiado pequeño: se esperaba que texto tuviera
 * >=2 caracteres"). El problema no era el idioma, era hablar de tipos y operadores a
 * quien solo está rellenando un formulario.
 */

/** Cómo nombrar en una frase lo que el campo esperaba. */
const TIPOS: Record<string, string> = {
  string: "un texto",
  number: "un número",
  int: "un número entero",
  bigint: "un número entero",
  boolean: "un sí o un no",
  date: "una fecha",
  array: "una lista",
  object: "unos datos",
};

const FORMATOS: Record<string, string> = {
  email: "Escribe un email válido, con arroba y dominio.",
  url: "Escribe una dirección web completa, con https:// delante.",
  uuid: "Ese identificador no tiene el formato esperado.",
  datetime: "Escribe una fecha y hora válidas.",
  date: "Escribe una fecha válida.",
};

/**
 * Traduce el fallo de Zod a una frase que se pueda leer en un formulario.
 *
 * Devuelve `undefined` solo cuando no sabe hacerlo mejor que el defecto, cosa que no
 * debería pasar: el `default` del `switch` ya cubre el resto con una frase genérica.
 */
export function mensajeDeValidacion(issue: z.core.$ZodRawIssue): string {
  switch (issue.code) {
    case "invalid_type": {
      // Zod no distingue "falta el dato" de "el dato es de otro tipo": los dos son
      // `invalid_type`. Los separa el valor recibido, y para quien rellena el
      // formulario no son el mismo problema ni tienen la misma solución.
      const vacio = issue.input === undefined || issue.input === null || issue.input === "";
      if (vacio) return "Este dato es obligatorio.";
      const esperado = TIPOS[String(issue.expected)];
      return esperado ? `Aquí va ${esperado}.` : "El valor no es válido.";
    }

    case "too_small": {
      const minimo = Number(issue.minimum);
      if (issue.origin === "string") {
        if (minimo <= 1) return "Este dato es obligatorio.";
        return `Escribe al menos ${minimo} caracteres.`;
      }
      if (issue.origin === "array") {
        return minimo <= 1 ? "Elige al menos una opción." : `Elige al menos ${minimo}.`;
      }
      return issue.inclusive
        ? `Tiene que ser ${minimo} o más.`
        : `Tiene que ser mayor que ${minimo}.`;
    }

    case "too_big": {
      const maximo = Number(issue.maximum);
      if (issue.origin === "string") return `No puede pasar de ${maximo} caracteres.`;
      if (issue.origin === "array") return `Elige como mucho ${maximo}.`;
      return issue.inclusive
        ? `Tiene que ser ${maximo} o menos.`
        : `Tiene que ser menor que ${maximo}.`;
    }

    case "invalid_format":
      return FORMATOS[String(issue.format)] ?? "El formato no es válido.";

    // Enum, literal y valores fijos. Cubre también la casilla que hay que marcar:
    // `z.literal(true)` sin mensaje propio caería aquí.
    case "invalid_value":
      return "Elige una de las opciones disponibles.";

    case "not_multiple_of":
      return `Tiene que ser múltiplo de ${issue.divisor}.`;

    case "unrecognized_keys":
      return "Se han enviado datos que no se esperaban.";

    case "invalid_union":
      return "El valor no encaja con ninguna de las formas admitidas.";

    default:
      return "El valor no es válido.";
  }
}

/**
 * Instala el mapa como defecto **de todo el proceso**. Se ejecuta al importar el
 * módulo, y lo importa `parse-body.ts` —por donde pasa toda la validación de
 * peticiones— para que no dependa de que cada Route Handler se acuerde.
 */
z.config({ customError: mensajeDeValidacion });
