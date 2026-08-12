/**
 * Proyección **pública** del catálogo (D13 / spec `catalog-inventory`).
 *
 * Es la vista que ve el visitante sin sesión: atributos de catálogo de los Sets
 * publicados y **nada más**. Quedan fuera, deliberadamente:
 *
 *  - la **disponibilidad** y cualquier dato de nivel `Copy` (el inventario en vivo no
 *    se expone),
 *  - la **cola de reservas** (posición y estado exigen login),
 *  - el **valor de referencia**, que es el coste de reposición: información interna
 *    de negocio, no un atributo de catálogo.
 *
 * La frontera se traza aquí, en la forma de los datos, y no en el catálogo entero:
 * eso da descubribilidad y SEO sin enseñar el inventario.
 */
export interface PublicSet {
  id: string;
  /** Referencia de Rebrickable, útil para que el visitante busque el set fuera. */
  setNum: string | null;
  name: string;
  year: number | null;
  pieceCount: number;
  theme: string;
  recommendedAge: string | null;
  difficulty: string | null;
  boxPhotoUrl: string | null;
}

/** Campos del modelo `Set` que la proyección pública puede leer. */
export const PUBLIC_SET_FIELDS = [
  "id",
  "setNum",
  "name",
  "year",
  "pieceCount",
  "recommendedAge",
  "difficulty",
  "boxPhotoUrl",
] as const;

/**
 * Campos que **nunca** salen en la proyección pública. Existe para que los tests
 * puedan afirmarlo explícitamente: una fuga aquí es un fallo de la spec, no un
 * detalle estético.
 */
export const NON_PUBLIC_SET_FIELDS = ["referenceValue", "published", "restricted"] as const;
