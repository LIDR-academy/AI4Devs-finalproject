import {
  IRemanenteQueryRepository,
  ActiveRemanenteDTO,
} from '../../../domain/kitchen/repositories/IRemanenteQueryRepository.js';
import { InMemoryStockRepository } from '../../stock/repositories/InMemoryStockRepository.js';
import { Remanente } from '../../../domain/stock/entities/Remanente.js';
import { Insumo } from '../../../domain/stock/entities/Insumo.js';

// Fallback de nombre/unidad para fixtures sintéticas sin catálogo maestro cargado
// (dev/demo sin seed de Insumo completo). Nunca aplica cuando el insumo real existe.
const FALLBACK_INSUMO_DISPLAY: Record<string, { name: string; unitOfMeasure: string }> = {
  'ins-1': { name: 'Queso Mozzarella', unitOfMeasure: 'KG' },
  'ins-2': { name: 'Salsa Pomodoro', unitOfMeasure: 'L' },
  'ins-3': { name: 'Masa de Pizza', unitOfMeasure: 'UNITS' },
};
const DEFAULT_INSUMO_DISPLAY = { name: 'Insumo Cocina', unitOfMeasure: 'KG' };

function toActiveDTO(rem: Remanente, insumo: Insumo | undefined, now: Date): ActiveRemanenteDTO {
  const fallback = FALLBACK_INSUMO_DISPLAY[rem.insumoId] ?? DEFAULT_INSUMO_DISPLAY;
  const hoursRemaining = Math.max(
    0,
    Math.round(((rem.expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60)) * 10) / 10
  );

  return {
    id: rem.id,
    insumoId: rem.insumoId,
    insumoName: insumo ? insumo.name : fallback.name,
    unitOfMeasure: insumo ? insumo.unitOfMeasure : fallback.unitOfMeasure,
    currentQuantity: rem.currentQuantity.toString(),
    initialQuantity: rem.initialQuantity.toString(),
    location: rem.location,
    storageLocationId: rem.storageLocationId,
    recipePreparationId: rem.recipePreparationId,
    isPristine: rem.isPristine,
    storageLocationName: rem.location,
    expirationDate: rem.expirationDate,
    hoursRemaining,
    isCriticalAlert: hoursRemaining < 24,
    status: rem.status,
    createdAt: new Date(),
  };
}

export class InMemoryRemanenteQueryRepository implements IRemanenteQueryRepository {
  public remanentes: ActiveRemanenteDTO[] = [];

  constructor(private readonly stockRepo?: InMemoryStockRepository) {}

  public async findActiveRemanentes(
    storageLocationId?: string,
    insumoId?: string
  ): Promise<ActiveRemanenteDTO[]> {
    let activeItems: ActiveRemanenteDTO[] = [];

    if (this.stockRepo && this.stockRepo.remanentes.size > 0) {
      const now = new Date();
      activeItems = Array.from(this.stockRepo.remanentes.values())
        .filter((rem) => rem.status === 'ACTIVE')
        .map((rem) => toActiveDTO(rem, this.stockRepo!.insumos.get(rem.insumoId), now));
    } else {
      activeItems = [...this.remanentes].filter((r) => r.status === 'ACTIVE');
    }

    // TK-080: insumoId busca en cualquier ubicacion de cocina, no se combina con location (US-021).
    if (insumoId) {
      return activeItems
        .filter((r) => r.insumoId === insumoId)
        .sort((a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime());
    }

    if (storageLocationId) {
      // US-026: acepta la FK del área o un literal legado en `location`.
      activeItems = activeItems.filter(
        (r) => r.storageLocationId === storageLocationId || r.location === storageLocationId
      );
    }

    // Ordenamiento estricto FEFO: expirationDate ASC
    return activeItems.sort((a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime());
  }

  public seedRemanente(item: ActiveRemanenteDTO): void {
    this.remanentes.push(item);
  }
}
