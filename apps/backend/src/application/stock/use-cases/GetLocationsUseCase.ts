import { IStorageLocationRepository } from '../../../domain/stock/repositories/IStorageLocationRepository.js';
import { IInsumoRepository } from '../../../domain/stock/repositories/IInsumoRepository.js';

export interface StorageLocationDTO {
  id: string;
  name: string;
  type: string;
  description?: string;
  isActive: boolean;
  /** US-025: `true` si algún insumo tiene saldo `> 0` en este sub-sector (bloquea baja/desactivación). */
  hasStock: boolean;
}

export class GetLocationsUseCase {
  constructor(
    private locationRepository: IStorageLocationRepository,
    private insumoRepository?: IInsumoRepository
  ) {}

  async execute(): Promise<StorageLocationDTO[]> {
    const locations = await this.locationRepository.findAllLocations();
    return Promise.all(
      locations.map(async (l) => ({
        id: l.id,
        name: l.name,
        type: l.type,
        description: l.description,
        isActive: l.isActive,
        hasStock: this.insumoRepository ? await this.insumoRepository.existsStockAtLocation(l.id) : false,
      }))
    );
  }
}
