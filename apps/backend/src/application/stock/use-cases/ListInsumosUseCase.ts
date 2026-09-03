import { IInsumoRepository } from '../../../domain/stock/repositories/IInsumoRepository.js';
import { IStorageLocationRepository } from '../../../domain/stock/repositories/IStorageLocationRepository.js';
import { WarehouseStockLine } from '../../../domain/stock/entities/Insumo.js';
import { InsumoOutputDTO, StockByLocationDTO } from './CreateInsumoUseCase.js';

export class ListInsumosUseCase {
  constructor(
    private readonly insumoRepository: IInsumoRepository,
    private readonly locationRepository?: IStorageLocationRepository
  ) {}

  public async execute(): Promise<InsumoOutputDTO[]> {
    const [list, locationNames] = await Promise.all([
      this.insumoRepository.findAll(),
      this.buildLocationNameMap(),
    ]);

    return list.map((insumo) => ({
      id: insumo.id,
      name: insumo.name,
      unitOfMeasure: insumo.unitOfMeasure,
      warehouseStock: insumo.warehouseStock.toString(),
      stockByLocation: insumo.stockLines.map(
        (line: WarehouseStockLine): StockByLocationDTO => ({
          storageLocationId: line.storageLocationId,
          storageLocationName: locationNames.get(line.storageLocationId) ?? line.storageLocationId,
          quantity: line.quantity.toString(),
        })
      ),
      unitCost: insumo.unitCost ? insumo.unitCost.toDecimal().toFixed(2) : null,
    }));
  }

  private async buildLocationNameMap(): Promise<Map<string, string>> {
    const map = new Map<string, string>();
    if (!this.locationRepository) {
      return map;
    }
    const locations = await this.locationRepository.findAllLocations();
    for (const loc of locations) {
      map.set(loc.id, loc.name);
    }
    return map;
  }
}
