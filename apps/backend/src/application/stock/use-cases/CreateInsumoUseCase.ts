import { IInsumoRepository } from '../../../domain/stock/repositories/IInsumoRepository.js';
import { IStorageLocationRepository } from '../../../domain/stock/repositories/IStorageLocationRepository.js';
import { Insumo, UNCLASSIFIED_WAREHOUSE_LOCATION_ID } from '../../../domain/stock/entities/Insumo.js';
import { DecimalQuantity } from '../../../domain/stock/value-objects/DecimalQuantity.js';
import { InsumoAlreadyExistsException } from '../../../domain/stock/errors/InsumoAlreadyExistsException.js';
import { resolveWarehouseSector } from './resolveWarehouseSector.js';
import crypto from 'crypto';

export interface CreateInsumoInputDTO {
  name: string;
  unitOfMeasure: string;
  initialWarehouseStock?: string;
  unitCost?: string;
  /** US-025: sub-sector de bodega donde queda depositado el stock inicial. */
  storageLocationId?: string;
}

// knip-ignore — consumida por InsumoOutputDTO.stockByLocation (interface pública del mismo archivo)
export interface StockByLocationDTO {
  storageLocationId: string;
  storageLocationName: string;
  quantity: string;
}

export interface InsumoOutputDTO {
  id: string;
  name: string;
  unitOfMeasure: string;
  warehouseStock: string;
  stockByLocation: StockByLocationDTO[];
  unitCost: string | null;
}

export class CreateInsumoUseCase {
  constructor(
    private readonly insumoRepository: IInsumoRepository,
    private readonly locationRepository?: IStorageLocationRepository
  ) {}

  public async execute(input: CreateInsumoInputDTO): Promise<InsumoOutputDTO> {
    const trimmedName = input.name.trim();

    const existing = await this.insumoRepository.findByName(trimmedName);
    if (existing) {
      throw new InsumoAlreadyExistsException(`El insumo '${trimmedName}' ya esta registrado en el catalogo.`);
    }

    const storageLocationId = input.storageLocationId ?? UNCLASSIFIED_WAREHOUSE_LOCATION_ID;
    const sector = await resolveWarehouseSector(this.locationRepository, storageLocationId);

    const initialQty = new DecimalQuantity(input.initialWarehouseStock ?? '0');
    const insumo = new Insumo({
      id: `ins-${crypto.randomBytes(4).toString('hex')}`,
      name: trimmedName,
      unitOfMeasure: input.unitOfMeasure.toUpperCase(),
      unitCost: input.unitCost !== undefined ? new DecimalQuantity(input.unitCost) : undefined,
      stockLines: initialQty.toDecimal().isZero()
        ? []
        : [{ storageLocationId, quantity: initialQty }],
    });

    await this.insumoRepository.save(insumo);

    return this.toOutput(insumo, sector.name, storageLocationId);
  }

  private toOutput(insumo: Insumo, sectorName: string, storageLocationId: string): InsumoOutputDTO {
    const stockByLocation: StockByLocationDTO[] = insumo.stockLines.map((line) => ({
      storageLocationId: line.storageLocationId,
      storageLocationName: line.storageLocationId === storageLocationId ? sectorName : line.storageLocationId,
      quantity: line.quantity.toString(),
    }));

    return {
      id: insumo.id,
      name: insumo.name,
      unitOfMeasure: insumo.unitOfMeasure,
      warehouseStock: insumo.warehouseStock.toString(),
      stockByLocation,
      unitCost: insumo.unitCost ? insumo.unitCost.toDecimal().toFixed(2) : null,
    };
  }
}
