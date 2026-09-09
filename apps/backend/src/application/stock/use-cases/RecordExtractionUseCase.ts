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
import { DiscardReasonRequiredException } from '../../../domain/stock/errors/DiscardReasonRequiredException.js';
import { Clock } from '../../../domain/shared/Clock.js';
import { IdGenerator } from '../../../domain/shared/IdGenerator.js';
import { RecipePreparation } from '../../../domain/kitchen/entities/RecipePreparation.js';
import { IRecipePreparationRepository } from '../../../domain/kitchen/repositories/IRecipePreparationRepository.js';
import { resolveWarehouseSector } from './resolveWarehouseSector.js';
import { resolveKitchenArea } from './resolveKitchenArea.js';

export interface RecordExtractionDTO {
  insumoId: string;
  quantity: number | string;
  /** US-026: área de cocina de destino (`StorageLocation type = KITCHEN`) o literal legado. */
  toStorageLocationId?: string;
  /** US-025: sub-sector de bodega del que sale el stock. */
  fromStorageLocationId?: string;
  operatorId?: string;
  purpose?: 'KITCHEN_STOCK' | 'RECIPE' | 'DIRECT_DISCARD';
  reason?: string;
  recipeId?: string;
  /** US-027: porciones que el operario planea preparar (modo RECIPE). */
  plannedPortions?: number;
  /** US-027: id de una preparación abierta a la que añadir esta extracción (modo RECIPE). */
  recipePreparationId?: string;
}

export interface ExtractionResponseDTO {
  /** `null` en `DIRECT_DISCARD` — el descarte no crea remanente en cocina (AUDIT-DEV-006 F-9). */
  remanenteId: string | null;
  /** US-027: id de la preparación de receta abierta/reutilizada (solo modo RECIPE). */
  recipePreparationId?: string;
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
    private readonly clock: Clock,
    private readonly idGenerator: IdGenerator,
    private readonly locationRepository?: IStorageLocationRepository,
    private readonly recipePreparationRepository?: IRecipePreparationRepository
  ) {}

  /**
   * US-027: resuelve la `RecipePreparation` de una extracción `purpose = RECIPE`.
   * Si el DTO trae `recipePreparationId` de una preparación `OPEN` de la misma receta
   * se reutiliza; si no, se abre una nueva. Devuelve `undefined` si no se puede
   * resolver un repositorio (tests de unidad puros) — la extracción sigue siendo
   * consistente aunque la preparación no se persista.
   */
  private async resolveRecipePreparation(dto: RecordExtractionDTO): Promise<RecipePreparation | undefined> {
    if (!this.recipePreparationRepository || !dto.recipeId) return undefined;

    if (dto.recipePreparationId) {
      const existing = await this.recipePreparationRepository.findById(dto.recipePreparationId);
      if (existing && existing.isOpen && existing.recipeId === dto.recipeId) {
        return existing;
      }
      throw new EntityNotFoundException('Preparación de receta abierta', dto.recipePreparationId);
    }

    return RecipePreparation.openNew(
      this.idGenerator.next('prep'),
      dto.recipeId,
      dto.plannedPortions && dto.plannedPortions > 0 ? Math.trunc(dto.plannedPortions) : 1,
      dto.operatorId,
      this.clock.now()
    );
  }

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

  /** Escrituras de la extracción KITCHEN_STOCK/RECIPE, todas dentro de la transacción. */
  private async persistExtraction(
    uow: ExtractionUnitOfWork,
    ctx: {
      insumo: Insumo;
      requestedQty: DecimalQuantity;
      fromStorageLocationId: string;
      sectorName: string;
      location: string;
      purpose: 'KITCHEN_STOCK' | 'RECIPE';
      remanente: Remanente;
      preparation?: RecipePreparation;
      dto: RecordExtractionDTO;
    }
  ): Promise<WarehouseBalancesAfterDeduction> {
    const after = await uow.deductStockAtAtomically(
      ctx.insumo.id,
      ctx.insumo.name,
      ctx.fromStorageLocationId,
      ctx.requestedQty
    );
    // La preparación se guarda ANTES del remanente: la FK Remanente.recipePreparationId
    // exige que exista. Un `save` idempotente sobre una preparación reutilizada es no-op.
    if (ctx.preparation) {
      await uow.saveRecipePreparation(ctx.preparation);
    }
    await uow.saveRemanente(ctx.remanente);
    await uow.recordMovement({
      id: this.idGenerator.next('mov'),
      insumoId: ctx.insumo.id,
      type: ctx.purpose === 'RECIPE' ? 'EXTRACTION_RECIPE' : 'EXTRACTION',
      quantity: ctx.requestedQty.toString(),
      fromLoc: ctx.sectorName,
      fromStorageLocationId: ctx.fromStorageLocationId,
      toLoc: ctx.location,
      operatorId: ctx.dto.operatorId,
      purpose: ctx.purpose,
      reason: ctx.dto.reason,
      recipeId: ctx.dto.recipeId,
    });
    return after;
  }

  private async handleStockExtraction(
    insumo: Insumo,
    requestedQty: DecimalQuantity,
    fromStorageLocationId: string,
    sectorName: string,
    purpose: 'KITCHEN_STOCK' | 'RECIPE',
    dto: RecordExtractionDTO
  ): Promise<ExtractionResponseDTO> {
    const area = await resolveKitchenArea(this.locationRepository, dto.toStorageLocationId);
    const location = area.name;
    const preparation = purpose === 'RECIPE' ? await this.resolveRecipePreparation(dto) : undefined;
    const remanente = Remanente.createNew(
      this.idGenerator.next('rem'),
      insumo.id,
      requestedQty,
      location,
      24,
      this.clock.now(),
      area.id
    );
    if (preparation) {
      remanente.linkToRecipePreparation(preparation.id);
    }

    const balances = await this.unitOfWork.runExtraction((uow) =>
      this.persistExtraction(uow, { insumo, requestedQty, fromStorageLocationId, sectorName, location, purpose, remanente, preparation, dto })
    );

    return {
      remanenteId: remanente.id,
      recipePreparationId: preparation?.id,
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
      throw new DiscardReasonRequiredException();
    }

    const balances: WarehouseBalancesAfterDeduction = await this.unitOfWork.runExtraction(async (uow) => {
      const after = await uow.deductStockAtAtomically(
        insumo.id,
        insumo.name,
        fromStorageLocationId,
        requestedQty
      );
      await uow.recordMovement({
        id: this.idGenerator.next('mov'),
        insumoId: insumo.id,
        type: 'DISCARD_DIRECT',
        quantity: requestedQty.toString(),
        fromLoc: sectorName,
        fromStorageLocationId,
        toLoc: 'WASTE_BIN',
        operatorId: dto.operatorId,
        purpose: 'DIRECT_DISCARD',
        reason: dto.reason,
      });
      return after;
    });

    return {
      remanenteId: null,
      insumoId: insumo.id,
      insumoName: insumo.name,
      quantityExtracted: requestedQty.toString(),
      fromStorageLocationId,
      remainingSectorStock: balances.remainingSectorStock.toString(),
      remainingWarehouseStock: balances.remainingWarehouseStock.toString(),
      location: 'WASTE_BIN',
      expirationDate: this.clock.now().toISOString(),
      status: 'DISCARDED',
    };
  }
}
