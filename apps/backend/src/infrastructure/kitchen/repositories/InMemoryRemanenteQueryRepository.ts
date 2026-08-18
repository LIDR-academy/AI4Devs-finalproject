import {
  IRemanenteQueryRepository,
  ActiveRemanenteDTO,
} from '../../../domain/kitchen/repositories/IRemanenteQueryRepository.js';
import { InMemoryStockRepository } from '../../stock/repositories/InMemoryStockRepository.js';

export class InMemoryRemanenteQueryRepository implements IRemanenteQueryRepository {
  public remanentes: ActiveRemanenteDTO[] = [];

  constructor(private readonly stockRepo?: InMemoryStockRepository) {}

  public async findActiveRemanentes(location?: string): Promise<ActiveRemanenteDTO[]> {
    let activeItems: ActiveRemanenteDTO[] = [];

    if (this.stockRepo && this.stockRepo.remanentes.size > 0) {
      const now = new Date();
      for (const rem of Array.from(this.stockRepo.remanentes.values())) {
        if (rem.status === 'ACTIVE') {
          const insumo = this.stockRepo.insumos.get(rem.insumoId);
          const hoursRemaining = Math.max(
            0,
            Math.round(((rem.expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60)) * 10) / 10
          );

          activeItems.push({
            id: rem.id,
            insumoId: rem.insumoId,
            insumoName: insumo ? insumo.name : (rem.insumoId === 'ins-1' ? 'Queso Mozzarella' : rem.insumoId === 'ins-2' ? 'Salsa Pomodoro' : rem.insumoId === 'ins-3' ? 'Masa de Pizza' : 'Insumo Cocina'),
            unitOfMeasure: insumo ? insumo.unitOfMeasure : (rem.insumoId === 'ins-3' ? 'UNITS' : rem.insumoId === 'ins-2' ? 'L' : 'KG'),
            currentQuantity: rem.currentQuantity.toString(),
            initialQuantity: rem.initialQuantity.toString(),
            location: rem.location,
            expirationDate: rem.expirationDate,
            hoursRemaining,
            isCriticalAlert: hoursRemaining < 24,
            status: rem.status,
            createdAt: new Date(),
          });
        }
      }
    } else {
      activeItems = [...this.remanentes].filter((r) => r.status === 'ACTIVE');
    }

    if (location) {
      activeItems = activeItems.filter((r) => r.location === location);
    }

    // Ordenamiento estricto FEFO: expirationDate ASC
    return activeItems.sort((a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime());
  }

  public seedRemanente(item: ActiveRemanenteDTO): void {
    this.remanentes.push(item);
  }
}
