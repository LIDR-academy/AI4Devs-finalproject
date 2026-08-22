import { IInsumoRepository } from '../../../domain/stock/repositories/IInsumoRepository.js';
import { IRemanenteRepository } from '../../../domain/stock/repositories/IRemanenteRepository.js';
import { DecimalQuantity } from '../../../domain/stock/value-objects/DecimalQuantity.js';
import { Remanente } from '../../../domain/stock/entities/Remanente.js';
import { EntityNotFoundException } from '../../../domain/errors/EntityNotFoundException.js';
import { InsufficientStockException } from '../../../domain/stock/errors/InsufficientStockException.js';

export interface RecordExtractionDTO {
  insumoId: string;
  quantity: number | string;
  toLocation?: string;
}

export interface ExtractionResponseDTO {
  remanenteId: string;
  insumoId: string;
  insumoName: string;
  quantityExtracted: string;
  remainingWarehouseStock: string;
  location: string;
  expirationDate: string;
  status: string;
}

export class RecordExtractionUseCase {
  constructor(
    private readonly insumoRepository: IInsumoRepository,
    private readonly remanenteRepository: IRemanenteRepository
  ) {}

  public async execute(dto: RecordExtractionDTO): Promise<ExtractionResponseDTO> {
    const insumo = await this.insumoRepository.findById(dto.insumoId);
    if (!insumo) {
      throw new EntityNotFoundException('Insumo', dto.insumoId);
    }

    const requestedQty = new DecimalQuantity(dto.quantity);

    if (!insumo.hasSufficientStock(requestedQty)) {
      throw new InsufficientStockException(
        insumo.name,
        requestedQty.toString(),
        insumo.warehouseStock.toString()
      );
    }

    // Debitar stock de bodega
    insumo.deductStock(requestedQty);
    await this.insumoRepository.save(insumo);

    // Crear remanente activo FEFO en cocina
    const remanenteId = `rem-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const location = dto.toLocation || 'KITCHEN_FRIDGE';
    const remanente = Remanente.createNew(remanenteId, insumo.id, requestedQty, location, 24);

    await this.remanenteRepository.saveRemanente(remanente);

    // Auditoría de movimiento
    await this.remanenteRepository.recordMovement({
      id: `mov-${Date.now()}`,
      insumoId: insumo.id,
      type: 'EXTRACTION',
      quantity: requestedQty.toString(),
      fromLoc: 'MAIN_WAREHOUSE',
      toLoc: location,
    });

    return {
      remanenteId: remanente.id,
      insumoId: insumo.id,
      insumoName: insumo.name,
      quantityExtracted: requestedQty.toString(),
      remainingWarehouseStock: insumo.warehouseStock.toString(),
      location: remanente.location,
      expirationDate: remanente.expirationDate.toISOString(),
      status: remanente.status,
    };
  }
}
