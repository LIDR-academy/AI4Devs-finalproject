import { IStorageLocationRepository } from '../../../domain/stock/repositories/IStorageLocationRepository.js';
import { IInsumoRepository } from '../../../domain/stock/repositories/IInsumoRepository.js';
import { IRemanenteRepository } from '../../../domain/stock/repositories/IRemanenteRepository.js';

export interface StorageLocationDTO {
  id: string;
  name: string;
  type: string;
  description?: string;
  isActive: boolean;
  /**
   * `true` si el sector no puede borrarse/desactivarse: bodega con saldo `> 0`
   * (US-025) o área de cocina con un remanente `ACTIVE` (US-026, Invariante 5).
   */
  hasStock: boolean;
}

export class GetLocationsUseCase {
  constructor(
    private locationRepository: IStorageLocationRepository,
    private stockRepository?: IInsumoRepository & Partial<IRemanenteRepository>
  ) {}

  private async isBlocked(l: { id: string; name: string; type: string }): Promise<boolean> {
    if (!this.stockRepository) return false;
    if (l.type === 'WAREHOUSE') {
      return this.stockRepository.existsStockAtLocation(l.id);
    }
    if (l.type === 'KITCHEN' && this.stockRepository.existsActiveRemanenteAtLocation) {
      return this.stockRepository.existsActiveRemanenteAtLocation(l.id, l.name);
    }
    return false;
  }

  async execute(): Promise<StorageLocationDTO[]> {
    const locations = await this.locationRepository.findAllLocations();
    return Promise.all(
      locations.map(async (l) => ({
        id: l.id,
        name: l.name,
        type: l.type,
        description: l.description,
        isActive: l.isActive,
        hasStock: await this.isBlocked(l),
      }))
    );
  }
}
