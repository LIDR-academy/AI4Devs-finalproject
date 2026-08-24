import { IInsumoRepository } from '../../../domain/stock/repositories/IInsumoRepository.js';
import { IRemanenteRepository } from '../../../domain/stock/repositories/IRemanenteRepository.js';
import { DecimalQuantity } from '../../../domain/stock/value-objects/DecimalQuantity.js';
import { EntityNotFoundException } from '../../../domain/errors/EntityNotFoundException.js';

export interface RestockInsumoDTO {
  insumoId: string;
  quantity: number | string;
}

export interface RestockResponseDTO {
  insumoId: string;
  insumoName: string;
  quantityAdded: string;
  newWarehouseStock: string;
}

export class RestockInsumoUseCase {
  constructor(
    private readonly insumoRepository: IInsumoRepository,
    private readonly remanenteRepository: IRemanenteRepository
  ) {}

  public async execute(dto: RestockInsumoDTO): Promise<RestockResponseDTO> {
    const insumo = await this.insumoRepository.findById(dto.insumoId);
    if (!insumo) {
      throw new EntityNotFoundException('Insumo', dto.insumoId);
    }

    const addedQty = new DecimalQuantity(dto.quantity);

    insumo.increaseStock(addedQty);
    await this.insumoRepository.save(insumo);

    // Auditoria de movimiento (mismo mecanismo que extraccion/descarte, TK-050) — sin
    // proveedor/referencia por decision de alcance de US-013, quien/cuando ya quedan
    // registrados via createdAt + el propio insumoId.
    await this.remanenteRepository.recordMovement({
      id: `mov-${Date.now()}`,
      insumoId: insumo.id,
      type: 'RESTOCK',
      quantity: addedQty.toString(),
      fromLoc: 'SUPPLIER',
      toLoc: 'MAIN_WAREHOUSE',
    });

    return {
      insumoId: insumo.id,
      insumoName: insumo.name,
      quantityAdded: addedQty.toString(),
      newWarehouseStock: insumo.warehouseStock.toString(),
    };
  }
}
