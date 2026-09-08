import { ValidationError } from "@/domain/errors";

/**
 * Reglas de negocio del Set (spec `catalog-inventory`).
 */

/** Datos mínimos que necesita la regla de publicación. */
export interface PublishableSet {
  /** Decimal como cadena; `null` mientras el Set no esté tasado. */
  referenceValue: string | null;
}

export function isPublishable(set: PublishableSet): boolean {
  if (set.referenceValue === null) return false;
  const value = Number(set.referenceValue);
  return Number.isFinite(value) && value > 0;
}

/**
 * Un Set **no puede publicarse sin valor de referencia**.
 *
 * No es burocracia: ese valor es la base con la que se calcula el precio del alquiler
 * puntual (D9) y el respaldo documental de cualquier reclamación por pérdida o daño.
 * Publicar sin él dejaría el catálogo con sets que no se pueden ni cobrar ni reclamar.
 *
 * Se rechaza como error de **validación** (422) señalando el campo que falta, porque
 * es accionable: quien publica sabe exactamente qué completar.
 */
export function assertPublishable(set: PublishableSet): void {
  if (isPublishable(set)) return;

  throw new ValidationError(
    [
      {
        field: "referenceValue",
        issue: "El set necesita un valor de referencia mayor que cero para publicarse.",
      },
    ],
    "No se puede publicar el set."
  );
}
