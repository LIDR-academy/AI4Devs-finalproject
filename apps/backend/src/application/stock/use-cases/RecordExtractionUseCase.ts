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
  operatorId?: string;
  purpose?: 'KITCHEN_STOCK' | 'RECIPE' | 'DIRECT_DISCARD';
  reason?: string;
  recipeId?: string;
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

    const purpose = dto.purpose || 'KITCHEN_STOCK';

    if (purpose === 'DIRECT_DISCARD') {
      return this.handleDirectDiscard(insumo, requestedQty, dto);
    }

    // Debitar stock de bodega para uso en cocina o receta
    insumo.deductStock(requestedQty);
    await this.insumoRepository.save(insumo);

    // Crear remanente activo FEFO en cocina
    const remanenteId = `rem-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const location = dto.toLocation || 'KITCHEN_FRIDGE';
    const remanente = Remanente.createNew(remanenteId, insumo.id, requestedQty, location, 24);

    await this.remanenteRepository.saveRemanente(remanente);

    const movementType = purpose === 'RECIPE' ? 'EXTRACTION_RECIPE' : 'EXTRACTION';

    // Auditoría de movimiento
    await this.remanenteRepository.recordMovement({
      id: `mov-${Date.now()}`,
      insumoId: insumo.id,
      type: movementType,
      quantity: requestedQty.toString(),
      fromLoc: 'MAIN_WAREHOUSE',
      toLoc: location,
      operatorId: dto.operatorId,
      purpose,
      reason: dto.reason,
      recipeId: dto.recipeId,
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

  private async handleDirectDiscard(
    insumo: { id: string; name: string; warehouseStock: DecimalQuantity; deductStock(q: DecimalQuantity): void },
    requestedQty: DecimalQuantity,
    dto: RecordExtractionDTO
  ): Promise<ExtractionResponseDTO> {
    if (!dto.reason || dto.reason.trim().length === 0) {
      throw new Error('El motivo es obligatorio para descarte directo desde bodega.');
    }

    insumo.deductStock(requestedQty);
    await this.insumoRepository.save(insumo as unknown as Parameters<IInsumoRepository['save']>[0]);

    await this.remanenteRepository.recordMovement({
      id: `mov-${Date.now()}`,
      insumoId: insumo.id,
      type: 'DISCARD_DIRECT',
      quantity: requestedQty.toString(),
      fromLoc: 'MAIN_WAREHOUSE',
      toLoc: 'WASTE_BIN',
      operatorId: dto.operatorId,
      purpose: 'DIRECT_DISCARD',
      reason: dto.reason,
    });

    return {
      remanenteId: '',
      insumoId: insumo.id,
      insumoName: insumo.name,
      quantityExtracted: requestedQty.toString(),
      remainingWarehouseStock: insumo.warehouseStock.toString(),
      location: 'WASTE_BIN',
      expirationDate: new Date().toISOString(),
      status: 'DISCARDED',
    };
  }
}
