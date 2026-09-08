import type { AuthenticatedSet, PublicSet } from "@/domain/catalog/public-projection";

/** Puerto de lectura del catálogo (capability `catalog-inventory`). */

export interface PublicPlan {
  code: "BASIC" | "PREMIUM";
  name: string;
  /** En euros, como cadena: el precio es decimal exacto, no un `number` binario. */
  monthlyPrice: string;
  maxSimultaneousSets: number;
  /** Días de ventaja en la cola de reservas (D4). */
  queueBonusDays: number;
}

export interface CatalogRepository {
  /**
   * Sets **publicados**, en la proyección pública. El filtro y la selección de
   * columnas van en la consulta, no en un filtrado posterior: así es imposible que
   * un campo interno viaje hasta la capa HTTP y se escape por descuido.
   */
  listPublicSets(input?: { limit?: number; offset?: number }): Promise<{
    sets: readonly PublicSet[];
    total: number;
  }>;

  findPublicSetById(id: string): Promise<PublicSet | null>;

  /**
   * Igual que `findPublicSetById` pero con disponibilidad y cola, para quien tiene
   * sesión. Recibe el usuario porque la **posición en cola es suya**: es el único dato
   * de la proyección que depende de quién pregunta.
   */
  findAuthenticatedSetById(input: {
    setId: string;
    userId: string;
  }): Promise<AuthenticatedSet | null>;

  /** Planes activos con sus condiciones, visibles sin sesión. */
  listPublicPlans(): Promise<readonly PublicPlan[]>;
}
