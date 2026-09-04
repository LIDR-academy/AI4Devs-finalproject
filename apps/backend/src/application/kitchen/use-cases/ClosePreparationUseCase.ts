import { IRecipePreparationRepository } from '../../../domain/kitchen/repositories/IRecipePreparationRepository.js';
import { IStorageLocationRepository } from '../../../domain/stock/repositories/IStorageLocationRepository.js';
import {
  IStockUnitOfWork,
  PreparationCloseUnitOfWork,
} from '../../../domain/stock/repositories/IStockUnitOfWork.js';
import { StockMovementRecord } from '../../../domain/stock/repositories/IRemanenteRepository.js';
import { Clock } from '../../../domain/shared/Clock.js';
import { IdGenerator } from '../../../domain/shared/IdGenerator.js';
import { Remanente } from '../../../domain/stock/entities/Remanente.js';
import { DecimalQuantity } from '../../../domain/stock/value-objects/DecimalQuantity.js';
import { RecipePreparation } from '../../../domain/kitchen/entities/RecipePreparation.js';
import { RecipePreparationItem } from '../../../domain/kitchen/entities/RecipePreparationItem.js';
import { EntityNotFoundException } from '../../../domain/errors/EntityNotFoundException.js';
import { PreparationBalanceMismatchException } from '../../../domain/kitchen/errors/PreparationBalanceMismatchException.js';
import { withOpenPreparation } from './loadOpenPreparation.js';

export interface CloseItemInput {
  insumoId: string;
  leftoverQty: string;
  leftoverLocationId?: string;
  markedUnopened?: boolean;
  wastedQty: string;
  wasteReason?: string;
}

export interface ClosePreparationCommand {
  preparationId: string;
  actualPortions: number;
  closedByOperatorId?: string;
  items: CloseItemInput[];
}

interface ClosePreparationItemResultDTO {
  insumoId: string;
  extractedQty: string;
  consumedQty: string;
  leftoverQty: string;
  leftoverLocationId: string | null;
  wastedQty: string;
  wasteReason: string | null;
}

export interface ClosePreparationResultDTO {
  id: string;
  recipeId: string;
  status: 'CLOSED';
  actualPortions: number;
  closedByOperatorId: string | null;
  closedAt: string;
  items: ClosePreparationItemResultDTO[];
}

interface LeftoverDestination {
  locationId?: string;
  locationName: string;
  goesToWarehouse: boolean;
}

interface ReconcileContext {
  uow: PreparationCloseUnitOfWork;
  recipeId: string;
  operatorId?: string;
  remanente: Remanente;
  item: RecipePreparationItem;
  destination: LeftoverDestination;
  now: Date;
}

const MOVEMENT = {
  CONSUMPTION_RECIPE: 'CONSUMPTION_RECIPE',
  DISCARD_RECIPE_PREP: 'DISCARD_RECIPE_PREP',
  RETURN_TO_WAREHOUSE: 'RETURN_TO_WAREHOUSE',
  TRANSFER_KITCHEN: 'TRANSFER_KITCHEN',
} as const;

/**
 * US-028 / ADR-003 §3.1–§3.5: cierra y concilia una preparación de receta. Por cada
 * remanente vinculado deriva `consumido = extraído − sobrante − merma`, registra los
 * `StockMovement` correspondientes, reubica o devuelve el sobrante y materializa el
 * `RecipePreparationItem`. Todo dentro de una única frontera transaccional (C-DEV-006-1).
 */
export class ClosePreparationUseCase {
  constructor(
    private readonly preparationRepository: IRecipePreparationRepository,
    private readonly locationRepository: IStorageLocationRepository,
    private readonly unitOfWork: IStockUnitOfWork,
    private readonly clock: Clock,
    private readonly idGenerator: IdGenerator
  ) {}

  async execute(command: ClosePreparationCommand): Promise<ClosePreparationResultDTO> {
    const now = this.clock.now();
    return withOpenPreparation(
      {
        repository: this.preparationRepository,
        unitOfWork: this.unitOfWork,
        preparationId: command.preparationId,
      },
      async ({ preparation, remanentes, uow }) => {
        const items: RecipePreparationItem[] = [];
        for (const remanente of remanentes) {
          items.push(await this.reconcileRemanente(uow, preparation, remanente, command, now));
        }

        preparation.close(command.actualPortions, command.closedByOperatorId, now);
        await uow.saveRecipePreparation(preparation);

        return this.buildResult(preparation, items);
      }
    );
  }

  private async reconcileRemanente(
    uow: PreparationCloseUnitOfWork,
    preparation: RecipePreparation,
    remanente: Remanente,
    command: ClosePreparationCommand,
    now: Date
  ): Promise<RecipePreparationItem> {
    const input = this.resolveItemInput(command, remanente.insumoId);
    const leftoverQty = new DecimalQuantity(input.leftoverQty);
    const wastedQty = new DecimalQuantity(input.wastedQty);
    const destination = await this.resolveLeftoverDestination(input, remanente, leftoverQty);

    const item = RecipePreparationItem.reconcile({
      id: this.idGenerator.next('rpi'),
      preparationId: preparation.id,
      remanente,
      leftoverQty,
      leftoverLocationId: destination.locationId,
      markedUnopened: input.markedUnopened === true,
      wastedQty,
      wasteReason: input.wasteReason,
      leftoverGoesToWarehouse: destination.goesToWarehouse,
    });

    // El operario del cierre se toma del comando (aún no se llamó `preparation.close`).
    const ctx: ReconcileContext = {
      uow,
      recipeId: preparation.recipeId,
      operatorId: command.closedByOperatorId,
      remanente,
      item,
      destination,
      now,
    };
    await this.applyReconciliation(ctx);
    await uow.saveRemanente(remanente);
    await uow.saveRecipePreparationItem(item);
    return item;
  }

  private resolveItemInput(command: ClosePreparationCommand, insumoId: string): CloseItemInput {
    const matches = command.items.filter((i) => i.insumoId === insumoId);
    if (matches.length > 1) {
      throw new PreparationBalanceMismatchException(insumoId, '—', '—', '—');
    }
    return matches[0] ?? { insumoId, leftoverQty: '0', wastedQty: '0' };
  }

  private async resolveLeftoverDestination(
    input: CloseItemInput,
    remanente: Remanente,
    leftoverQty: DecimalQuantity
  ): Promise<LeftoverDestination> {
    if (leftoverQty.toDecimal().isZero()) {
      // Sin sobrante: no hay destino que registrar.
      return { locationId: undefined, locationName: remanente.location, goesToWarehouse: false };
    }
    if (!input.leftoverLocationId) {
      // Sobrante sin destino explícito: se queda donde está (misma área, desvinculado).
      return { locationId: remanente.storageLocationId, locationName: remanente.location, goesToWarehouse: false };
    }
    const location = await this.locationRepository.findLocationById(input.leftoverLocationId);
    if (!location || !location.isActive) {
      throw new EntityNotFoundException('StorageLocation', input.leftoverLocationId);
    }
    return {
      locationId: location.id,
      locationName: location.name,
      goesToWarehouse: location.type === 'WAREHOUSE',
    };
  }

  private async applyReconciliation(ctx: ReconcileContext): Promise<void> {
    const removed = ctx.item.consumedQty.add(ctx.item.wastedQty);
    if (removed.toDecimal().greaterThan(0)) {
      ctx.remanente.consumeQuantity(removed);
    }
    await this.emitConsumptionAndWaste(ctx);
    await this.placeLeftover(ctx);
  }

  private movementBase(ctx: ReconcileContext): Omit<StockMovementRecord, 'type' | 'quantity' | 'toLoc'> {
    return {
      id: this.idGenerator.next('mov'),
      insumoId: ctx.item.insumoId,
      fromLoc: ctx.remanente.location,
      operatorId: ctx.operatorId,
      recipeId: ctx.recipeId,
      createdAt: ctx.now,
    };
  }

  private async emitConsumptionAndWaste(ctx: ReconcileContext): Promise<void> {
    const { item } = ctx;
    if (item.consumedQty.toDecimal().greaterThan(0)) {
      await ctx.uow.recordMovement({
        ...this.movementBase(ctx),
        type: MOVEMENT.CONSUMPTION_RECIPE,
        quantity: item.consumedQty.toString(),
        toLoc: `RECIPE:${ctx.recipeId}`,
      });
    }
    if (item.wastedQty.toDecimal().greaterThan(0)) {
      await ctx.uow.recordMovement({
        ...this.movementBase(ctx),
        type: MOVEMENT.DISCARD_RECIPE_PREP,
        quantity: item.wastedQty.toString(),
        toLoc: 'MERMA',
        reason: item.wasteReason,
      });
    }
  }

  private async placeLeftover(ctx: ReconcileContext): Promise<void> {
    const { item, remanente, destination } = ctx;
    if (item.leftoverQty.toDecimal().isZero()) {
      return;
    }
    if (destination.goesToWarehouse && destination.locationId) {
      const returned = remanente.returnToWarehouse();
      await ctx.uow.incrementWarehouseStock(item.insumoId, destination.locationId, returned);
      await ctx.uow.recordMovement({
        ...this.movementBase(ctx),
        type: MOVEMENT.RETURN_TO_WAREHOUSE,
        quantity: returned.toString(),
        toLoc: destination.locationName,
      });
      return;
    }
    const changedArea =
      destination.locationId !== undefined && destination.locationId !== remanente.storageLocationId;
    if (changedArea && destination.locationId) {
      const base = this.movementBase(ctx); // fromLoc = área ORIGINAL, antes de reubicar
      remanente.relocateLeftover(destination.locationId, destination.locationName);
      await ctx.uow.recordMovement({
        ...base,
        type: MOVEMENT.TRANSFER_KITCHEN,
        quantity: item.leftoverQty.toString(),
        toLoc: destination.locationName,
      });
    } else {
      remanente.unlinkFromPreparation();
    }
  }

  private buildResult(
    preparation: RecipePreparation,
    items: RecipePreparationItem[]
  ): ClosePreparationResultDTO {
    return {
      id: preparation.id,
      recipeId: preparation.recipeId,
      status: 'CLOSED',
      actualPortions: preparation.actualPortions ?? 0,
      closedByOperatorId: preparation.closedByOperatorId ?? null,
      closedAt: (preparation.closedAt ?? new Date()).toISOString(),
      items: items.map((i) => ({
        insumoId: i.insumoId,
        extractedQty: i.extractedQty.toString(),
        consumedQty: i.consumedQty.toString(),
        leftoverQty: i.leftoverQty.toString(),
        leftoverLocationId: i.leftoverLocationId ?? null,
        wastedQty: i.wastedQty.toString(),
        wasteReason: i.wasteReason ?? null,
      })),
    };
  }
}
