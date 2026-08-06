import { IStockRepository } from '../../../domain/stock/repositories/IStockRepository.js';
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
  constructor(private readonly stockRepository: IStockRepository) {}

  public async execute(dto: RecordExtractionDTO): Promise<ExtractionResponseDTO> {
    const insumo = await this.stockRepository.findInsumoById(dto.insumoId);
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
    await this.stockRepository.saveInsumo(insumo);

    // Crear remanente activo FEFO en cocina
    const remanenteId = `rem-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const location = dto.toLocation || 'KITCHEN_FRIDGE';
    const remanente = Remanente.createNew(remanenteId, insumo.id, requestedQty, location, 24);

    await this.stockRepository.saveRemanente(remanente);

    // Auditoría de movimiento
    await this.stockRepository.recordMovement({
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
