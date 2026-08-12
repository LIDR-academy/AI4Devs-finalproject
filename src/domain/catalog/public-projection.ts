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

/**
 * Proyección **autenticada**: lo mismo que ve el visitante **más** la disponibilidad
 * y la situación de la cola (spec `catalog-inventory`).
 *
 * Sigue sin exponer el estado de cada `Copy` una por una —eso es back-office—: al
 * suscriptor le sirve saber *cuántas* hay libres, no cuál está en higienización.
 */
export interface AuthenticatedSet extends PublicSet {
  /** Copias listas para prestar ahora mismo. */
  availableCopies: number;
  /** Copias en circulación (sin contar las dadas de baja). */
  totalCopies: number;
  /** Cuánta gente espera por este set. */
  queueLength: number;
  /**
   * Posición de quien pregunta en la cola, empezando en 1; `null` si no está
   * encolado. Nunca revela quién ocupa las demás posiciones.
   */
  queuePosition: number | null;
  /** Si el set exige antigüedad mínima de suscripción (D7). */
  restricted: boolean;
}
