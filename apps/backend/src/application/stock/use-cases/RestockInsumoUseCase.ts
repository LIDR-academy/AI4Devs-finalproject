import { IInsumoRepository } from '../../../domain/stock/repositories/IInsumoRepository.js';
import { IRemanenteRepository } from '../../../domain/stock/repositories/IRemanenteRepository.js';
import { IStorageLocationRepository } from '../../../domain/stock/repositories/IStorageLocationRepository.js';
import { DecimalQuantity } from '../../../domain/stock/value-objects/DecimalQuantity.js';
import { EntityNotFoundException } from '../../../domain/errors/EntityNotFoundException.js';
import { UNCLASSIFIED_WAREHOUSE_LOCATION_ID } from '../../../domain/stock/entities/Insumo.js';
import { resolveWarehouseSector } from './resolveWarehouseSector.js';

export interface RestockInsumoDTO {
  insumoId: string;
  quantity: number | string;
  /** US-025: sub-sector de bodega al que se suma la cantidad recibida. */
  storageLocationId?: string;
}

export interface RestockResponseDTO {
  insumoId: string;
  insumoName: string;
  storageLocationId: string;
  quantityAdded: string;
  newSectorStock: string;
  newWarehouseStock: string;
}

export class RestockInsumoUseCase {
  constructor(
    private readonly insumoRepository: IInsumoRepository,
    private readonly remanenteRepository: IRemanenteRepository,
    private readonly locationRepository?: IStorageLocationRepository
  ) {}

  public async execute(dto: RestockInsumoDTO): Promise<RestockResponseDTO> {
    const insumo = await this.insumoRepository.findById(dto.insumoId);
    if (!insumo) {
      throw new EntityNotFoundException('Insumo', dto.insumoId);
    }

    const storageLocationId = dto.storageLocationId ?? UNCLASSIFIED_WAREHOUSE_LOCATION_ID;
    await resolveWarehouseSector(this.locationRepository, storageLocationId);

    const addedQty = new DecimalQuantity(dto.quantity);
    insumo.restockAt(addedQty, storageLocationId);
    await this.insumoRepository.save(insumo);

    // Auditoria de movimiento (mismo mecanismo que extraccion/descarte, TK-050).
    await this.remanenteRepository.recordMovement({
      id: `mov-${Date.now()}`,
      insumoId: insumo.id,
      type: 'RESTOCK',
      quantity: addedQty.toString(),
      fromLoc: 'SUPPLIER',
      toLoc: storageLocationId,
    });

    return {
      insumoId: insumo.id,
      insumoName: insumo.name,
      storageLocationId,
      quantityAdded: addedQty.toString(),
      newSectorStock: insumo.stockAt(storageLocationId).toString(),
      newWarehouseStock: insumo.warehouseStock.toString(),
    };
  }
}
