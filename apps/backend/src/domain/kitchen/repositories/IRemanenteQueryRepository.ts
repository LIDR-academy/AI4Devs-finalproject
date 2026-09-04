export interface ActiveRemanenteDTO {
  id: string;
  insumoId: string;
  insumoName: string;
  unitOfMeasure: string;
  currentQuantity: string;
  initialQuantity: string;
  /** US-026: caché de display (= `name` del área o literal legado). */
  location: string;
  /** US-026: FK al área de cocina del catálogo (undefined en remanentes históricos). */
  storageLocationId?: string;
  /** US-026: nombre resuelto del área (join); cae a `location` si no hay FK. */
  storageLocationName?: string;
  /** US-027: preparación de receta que originó el remanente. */
  recipePreparationId?: string;
  /** US-028: `true` mientras no se haya consumido nada — habilita "devolver a bodega". */
  isPristine?: boolean;
  expirationDate: Date;
  status: string;
  createdAt: Date;
  hoursRemaining?: number;
  isCriticalAlert?: boolean;
}

export interface IRemanenteQueryRepository {
  /** `storageLocationId` filtra por área de cocina (US-026); acepta también un literal legado. */
  findActiveRemanentes(storageLocationId?: string, insumoId?: string): Promise<ActiveRemanenteDTO[]>;
}
