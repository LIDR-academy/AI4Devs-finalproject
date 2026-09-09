import { IInsumoRepository } from '../../../domain/stock/repositories/IInsumoRepository.js';
import { IStorageLocationRepository } from '../../../domain/stock/repositories/IStorageLocationRepository.js';
import { Insumo, UNCLASSIFIED_WAREHOUSE_LOCATION_ID } from '../../../domain/stock/entities/Insumo.js';
import { DecimalQuantity } from '../../../domain/stock/value-objects/DecimalQuantity.js';
import { InsumoAlreadyExistsException } from '../../../domain/stock/errors/InsumoAlreadyExistsException.js';
import { resolveWarehouseSector } from './resolveWarehouseSector.js';
import { InsumoOutputDTO, mapInsumoToOutputDTO } from '../mappers/insumoOutputMapper.js';
import crypto from 'crypto';

export interface CreateInsumoInputDTO {
  name: string;
  unitOfMeasure: string;
  initialWarehouseStock?: string;
  unitCost?: string;
  /** US-032: código de barras opcional, capturado por escaneo o alta manual. */
  barcode?: string;
  /** US-025: sub-sector de bodega donde queda depositado el stock inicial. */
  storageLocationId?: string;
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

    // US-032: mismo trim que `name` arriba — sin esto, un espacio incidental al tipear
    // a mano ("  7791234567890") persistiría distinto del valor limpio que decodifica
    // un escaneo real, rompiendo silenciosamente el match exacto que es todo el punto
    // de esta historia (FASE 4.B, revisor adversarial). Unicidad verificada en la capa
    // de aplicación (mismo patrón check-then-write que el nombre) + P2002 como red de
    // seguridad ante condición de carrera (PrismaStockRepository.save()).
    const trimmedBarcode = input.barcode?.trim() || undefined;
    if (trimmedBarcode) {
      const existingByBarcode = await this.insumoRepository.findByBarcode(trimmedBarcode);
      if (existingByBarcode) {
        throw new InsumoAlreadyExistsException('Ya existe un insumo registrado con ese código de barras.');
      }
    }

    const storageLocationId = input.storageLocationId ?? UNCLASSIFIED_WAREHOUSE_LOCATION_ID;
    const sector = await resolveWarehouseSector(this.locationRepository, storageLocationId);

    const initialQty = new DecimalQuantity(input.initialWarehouseStock ?? '0');
    const insumo = new Insumo({
      id: `ins-${crypto.randomBytes(4).toString('hex')}`,
      name: trimmedName,
      unitOfMeasure: input.unitOfMeasure.toUpperCase(),
      unitCost: input.unitCost !== undefined ? new DecimalQuantity(input.unitCost) : undefined,
      barcode: trimmedBarcode,
      stockLines: initialQty.toDecimal().isZero()
        ? []
        : [{ storageLocationId, quantity: initialQty }],
    });

    await this.insumoRepository.save(insumo);

    return mapInsumoToOutputDTO(insumo, (id) => (id === storageLocationId ? sector.name : id));
  }
}
