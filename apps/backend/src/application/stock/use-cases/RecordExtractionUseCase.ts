import { IInsumoRepository } from '../../../domain/stock/repositories/IInsumoRepository.js';
import { IStorageLocationRepository } from '../../../domain/stock/repositories/IStorageLocationRepository.js';
import {
  ExtractionUnitOfWork,
  IStockUnitOfWork,
  WarehouseBalancesAfterDeduction,
} from '../../../domain/stock/repositories/IStockUnitOfWork.js';
import { DecimalQuantity } from '../../../domain/stock/value-objects/DecimalQuantity.js';
import { Remanente } from '../../../domain/stock/entities/Remanente.js';
import { Insumo, UNCLASSIFIED_WAREHOUSE_LOCATION_ID } from '../../../domain/stock/entities/Insumo.js';
import { EntityNotFoundException } from '../../../domain/errors/EntityNotFoundException.js';
import { InsufficientStockException } from '../../../domain/stock/errors/InsufficientStockException.js';
import { resolveWarehouseSector } from './resolveWarehouseSector.js';

export interface RecordExtractionDTO {
  insumoId: string;
  quantity: number | string;
  toLocation?: string;
  /** US-025: sub-sector de bodega del que sale el stock. */
  fromStorageLocationId?: string;
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
  fromStorageLocationId: string;
  remainingSectorStock: string;
  remainingWarehouseStock: string;
  location: string;
  expirationDate: string;
  status: string;
}

export class RecordExtractionUseCase {
  constructor(
    private readonly insumoRepository: IInsumoRepository,
    private readonly unitOfWork: IStockUnitOfWork,
    private readonly locationRepository?: IStorageLocationRepository
  ) {}

  public async execute(dto: RecordExtractionDTO): Promise<ExtractionResponseDTO> {
    const insumo = await this.insumoRepository.findById(dto.insumoId);
    if (!insumo) {
      throw new EntityNotFoundException('Insumo', dto.insumoId);
    }

    const fromStorageLocationId = dto.fromStorageLocationId ?? UNCLASSIFIED_WAREHOUSE_LOCATION_ID;
    const sector = await resolveWarehouseSector(this.locationRepository, fromStorageLocationId);

    const requestedQty = new DecimalQuantity(dto.quantity);
    // Fail-fast opcional (C-DEV-006-2): mensaje temprano sin abrir transacción. La
    // barrera real contra la sobreventa por concurrencia es el UPDATE condicional
    // atómico dentro de `unitOfWork.runExtraction`.
    if (!insumo.hasSufficientStockAt(requestedQty, fromStorageLocationId)) {
      throw new InsufficientStockException(
        insumo.name,
        requestedQty.toString(),
        insumo.stockAt(fromStorageLocationId).toString()
      );
    }

    const purpose = dto.purpose || 'KITCHEN_STOCK';

    if (purpose === 'DIRECT_DISCARD') {
      return this.handleDirectDiscard(insumo, requestedQty, fromStorageLocationId, sector.name, dto);
    }

    return this.handleStockExtraction(insumo, requestedQty, fromStorageLocationId, sector.name, purpose, dto);
  }

  private async handleStockExtraction(
    insumo: Insumo,
    requestedQty: DecimalQuantity,
    fromStorageLocationId: string,
    sectorName: string,
    purpose: 'KITCHEN_STOCK' | 'RECIPE',
    dto: RecordExtractionDTO
  ): Promise<ExtractionResponseDTO> {
    const location = dto.toLocation || 'KITCHEN_FRIDGE';
    const remanenteId = `rem-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const remanente = Remanente.createNew(remanenteId, insumo.id, requestedQty, location, 24);
    const movementType = purpose === 'RECIPE' ? 'EXTRACTION_RECIPE' : 'EXTRACTION';

    const balances = await this.unitOfWork.runExtraction(async (uow: ExtractionUnitOfWork) => {
      const after = await uow.deductStockAtAtomically(
        insumo.id,
        insumo.name,
        fromStorageLocationId,
        requestedQty
      );
      await uow.saveRemanente(remanente);
      await uow.recordMovement({
        id: `mov-${Date.now()}`,
        insumoId: insumo.id,
        type: movementType,
        quantity: requestedQty.toString(),
        fromLoc: sectorName,
        toLoc: location,
        operatorId: dto.operatorId,
        purpose,
        reason: dto.reason,
        recipeId: dto.recipeId,
      });
      return after;
    });

    return {
      remanenteId: remanente.id,
      insumoId: insumo.id,
      insumoName: insumo.name,
      quantityExtracted: requestedQty.toString(),
      fromStorageLocationId,
      remainingSectorStock: balances.remainingSectorStock.toString(),
      remainingWarehouseStock: balances.remainingWarehouseStock.toString(),
      location: remanente.location,
      expirationDate: remanente.expirationDate.toISOString(),
      status: remanente.status,
    };
  }

  private async handleDirectDiscard(
    insumo: Insumo,
    requestedQty: DecimalQuantity,
    fromStorageLocationId: string,
    sectorName: string,
    dto: RecordExtractionDTO
  ): Promise<ExtractionResponseDTO> {
    if (!dto.reason || dto.reason.trim().length === 0) {
      throw new Error('El motivo es obligatorio para descarte directo desde bodega.');
    }

    const balances: WarehouseBalancesAfterDeduction = await this.unitOfWork.runExtraction(async (uow) => {
      const after = await uow.deductStockAtAtomically(
        insumo.id,
        insumo.name,
        fromStorageLocationId,
        requestedQty
      );
      await uow.recordMovement({
        id: `mov-${Date.now()}`,
        insumoId: insumo.id,
        type: 'DISCARD_DIRECT',
        quantity: requestedQty.toString(),
        fromLoc: sectorName,
        toLoc: 'WASTE_BIN',
        operatorId: dto.operatorId,
        purpose: 'DIRECT_DISCARD',
        reason: dto.reason,
      });
      return after;
    });

    return {
      remanenteId: '',
      insumoId: insumo.id,
      insumoName: insumo.name,
      quantityExtracted: requestedQty.toString(),
      fromStorageLocationId,
      remainingSectorStock: balances.remainingSectorStock.toString(),
      remainingWarehouseStock: balances.remainingWarehouseStock.toString(),
      location: 'WASTE_BIN',
      expirationDate: new Date().toISOString(),
      status: 'DISCARDED',
    };
  }
}
