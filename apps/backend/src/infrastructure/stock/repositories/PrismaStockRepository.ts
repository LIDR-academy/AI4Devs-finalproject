import { PrismaClient, Prisma } from '../../../generated/prisma/client.js';
import { Insumo } from '../../../domain/stock/entities/Insumo.js';
import { Remanente, RemanenteStatusType } from '../../../domain/stock/entities/Remanente.js';
import { DecimalQuantity } from '../../../domain/stock/value-objects/DecimalQuantity.js';
import { IInsumoRepository } from '../../../domain/stock/repositories/IInsumoRepository.js';
import { IRemanenteRepository, StockMovementRecord } from '../../../domain/stock/repositories/IRemanenteRepository.js';
import {
  AdhocConsumptionUnitOfWork,
  ExtractionUnitOfWork,
  IStockUnitOfWork,
  PreparationCloseUnitOfWork,
  WarehouseBalancesAfterDeduction,
} from '../../../domain/stock/repositories/IStockUnitOfWork.js';
import { RecipePreparation } from '../../../domain/kitchen/entities/RecipePreparation.js';
import { RecipePreparationItem } from '../../../domain/kitchen/entities/RecipePreparationItem.js';
import { recipePreparationUpsertArgs } from '../../kitchen/repositories/PrismaRecipePreparationRepository.js';
import { InsufficientStockException } from '../../../domain/stock/errors/InsufficientStockException.js';
import { InsumoAlreadyExistsException } from '../../../domain/stock/errors/InsumoAlreadyExistsException.js';

type RawInsumo = {
  id: string;
  name: string;
  unitOfMeasure: string;
  unitCost: { toString(): string } | null;
  barcode: string | null;
  warehouseStocks: { storageLocationId: string; quantity: { toString(): string } }[];
};

/** Cliente Prisma o cliente de transacción — los métodos de escritura aceptan cualquiera. */
type StockDbClient = Prisma.TransactionClient;

function toInsumo(raw: RawInsumo): Insumo {
  return new Insumo({
    id: raw.id,
    name: raw.name,
    unitOfMeasure: raw.unitOfMeasure,
    unitCost: raw.unitCost !== null ? new DecimalQuantity(raw.unitCost.toString()) : undefined,
    barcode: raw.barcode ?? undefined,
    stockLines: raw.warehouseStocks.map((s) => ({
      storageLocationId: s.storageLocationId,
      quantity: new DecimalQuantity(s.quantity.toString()),
    })),
  });
}

export class PrismaStockRepository implements IInsumoRepository, IRemanenteRepository, IStockUnitOfWork {
  constructor(private readonly prisma: PrismaClient) {}

  public async findById(id: string): Promise<Insumo | null> {
    const raw = await this.prisma.insumo.findUnique({ where: { id }, include: { warehouseStocks: true } });
    return raw ? toInsumo(raw) : null;
  }

  public async findByName(name: string): Promise<Insumo | null> {
    const raw = await this.prisma.insumo.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
      include: { warehouseStocks: true },
    });
    return raw ? toInsumo(raw) : null;
  }

  public async findAll(): Promise<Insumo[]> {
    const list = await this.prisma.insumo.findMany({ include: { warehouseStocks: true } });
    return list.map(toInsumo);
  }

  public async findByBarcode(barcode: string): Promise<Insumo | null> {
    const raw = await this.prisma.insumo.findUnique({ where: { barcode }, include: { warehouseStocks: true } });
    return raw ? toInsumo(raw) : null;
  }

  public async existsStockAtLocation(storageLocationId: string): Promise<boolean> {
    const count = await this.prisma.warehouseStock.count({
      where: { storageLocationId, quantity: { gt: 0 } },
    });
    return count > 0;
  }

  public async findRemanenteById(id: string): Promise<Remanente | null> {
    const raw = await this.prisma.remanente.findUnique({ where: { id } });
    if (!raw) return null;
    return this.toRemanente(raw);
  }

  public async findActiveRemanentesByInsumoId(insumoId: string): Promise<Remanente[]> {
    const list = await this.prisma.remanente.findMany({
      where: { insumoId, status: 'ACTIVE' },
      orderBy: { expirationDate: 'asc' },
    });
    return list.map((raw) => this.toRemanente(raw));
  }

  public async save(insumo: Insumo): Promise<void> {
    const unitCost = insumo.unitCost ? insumo.unitCost.toDecimal() : null;

    try {
      await this.prisma.$transaction(async (tx) => {
        const barcode = insumo.barcode ?? null;
        await tx.insumo.upsert({
          where: { id: insumo.id },
          update: { name: insumo.name, unitOfMeasure: insumo.unitOfMeasure, unitCost, barcode },
          create: { id: insumo.id, name: insumo.name, unitOfMeasure: insumo.unitOfMeasure, unitCost, barcode },
        });

        for (const line of insumo.stockLines) {
          const quantity = line.quantity.toDecimal();
          await tx.warehouseStock.upsert({
            where: {
              insumoId_storageLocationId: {
                insumoId: insumo.id,
                storageLocationId: line.storageLocationId,
              },
            },
            update: { quantity },
            create: { insumoId: insumo.id, storageLocationId: line.storageLocationId, quantity },
          });
        }
      });
    } catch (error) {
      // FASE 4.B (revisor adversarial, TK-119): condición de carrera real entre el
      // check-then-write de unicidad de barcode en CreateInsumoUseCase y esta escritura —
      // 2 requests concurrentes pueden pasar ambos el check antes de que cualquiera
      // persista. `name` NO tiene constraint único a nivel de BD (solo check-then-write
      // en la capa de aplicación, sin índice — ver schema.prisma) así que P2002 en este
      // modelo solo puede originarse en `Insumo_barcode_key`; el mensaje coincide con el
      // que ya usa CreateInsumoUseCase para el mismo caso, para no atribuir el conflicto
      // al campo equivocado.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002' &&
        (error.meta?.target as string[] | undefined)?.some((t) => t.includes('barcode'))
      ) {
        throw new InsumoAlreadyExistsException('Ya existe un insumo registrado con ese código de barras.');
      }
      throw error;
    }
  }

  public async saveRemanente(remanente: Remanente): Promise<void> {
    await this.saveRemanenteOn(this.prisma, remanente);
  }

  public async existsActiveRemanenteAtLocation(
    storageLocationId: string,
    locationName: string
  ): Promise<boolean> {
    const count = await this.prisma.remanente.count({
      where: {
        status: 'ACTIVE',
        OR: [{ storageLocationId }, { location: locationName }],
      },
    });
    return count > 0;
  }

  public async recordMovement(movement: StockMovementRecord): Promise<void> {
    await this.recordMovementOn(this.prisma, movement);
  }

  /**
   * AUDIT-DEV-006 F-1/F-2: frontera transaccional de la extracción de bodega.
   * Todas las escrituras (`deductStockAtAtomically` + `saveRemanente` + `recordMovement`)
   * corren dentro de una única `$transaction` — cualquier excepción revierte por completo.
   */
  public async runExtraction<T>(work: (uow: ExtractionUnitOfWork) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(async (tx) => {
      const uow: ExtractionUnitOfWork = {
        deductStockAtAtomically: (insumoId, insumoName, storageLocationId, quantity) =>
          this.deductStockAtAtomicallyOn(tx, insumoId, insumoName, storageLocationId, quantity),
        saveRemanente: (remanente) => this.saveRemanenteOn(tx, remanente),
        recordMovement: (movement) => this.recordMovementOn(tx, movement),
        saveRecipePreparation: (preparation) => this.saveRecipePreparationOn(tx, preparation),
      };
      return work(uow);
    });
  }

  /**
   * US-028 / ADR-003 §3.5: frontera transaccional del cierre / abandono de una
   * preparación. Todas las escrituras (varios `Remanente`, `RecipePreparation`,
   * `RecipePreparationItem[]`, `StockMovement[]`, `WarehouseStock`) corren dentro de
   * una única `$transaction` — cualquier excepción revierte por completo.
   */
  public async runPreparationClose<T>(
    work: (uow: PreparationCloseUnitOfWork) => Promise<T>
  ): Promise<T> {
    return this.prisma.$transaction(async (tx) => {
      const uow: PreparationCloseUnitOfWork = {
        findRemanentesByPreparation: (preparationId) =>
          this.findActiveRemanentesOn(tx, { recipePreparationId: preparationId }),
        saveRemanente: (remanente) => this.saveRemanenteOn(tx, remanente),
        recordMovement: (movement) => this.recordMovementOn(tx, movement),
        incrementWarehouseStock: (insumoId, storageLocationId, quantity) =>
          this.incrementWarehouseStockOn(tx, insumoId, storageLocationId, quantity),
        saveRecipePreparation: (preparation) => this.saveRecipePreparationOn(tx, preparation),
        saveRecipePreparationItem: (item) => this.saveRecipePreparationItemOn(tx, item),
      };
      return work(uow);
    });
  }

  /**
   * US-029 / ADR-003 §4: frontera transaccional del consumo ad-hoc de una receta
   * (`ConsumeRecipeUseCase`). Cierra la deuda de `TK-008` — antes descontaba remanentes
   * en escrituras sueltas, sin transacción ni `StockMovement`.
   */
  public async runAdhocConsumption<T>(
    work: (uow: AdhocConsumptionUnitOfWork) => Promise<T>
  ): Promise<T> {
    return this.prisma.$transaction(async (tx) => {
      const uow: AdhocConsumptionUnitOfWork = {
        findActiveRemanentesByInsumoId: (insumoId) => this.findActiveRemanentesOn(tx, { insumoId }),
        saveRemanente: (remanente) => this.saveRemanenteOn(tx, remanente),
        recordMovement: (movement) => this.recordMovementOn(tx, movement),
      };
      return work(uow);
    });
  }

  /** `ACTIVE` únicamente, orden FEFO — filtro adicional según el llamador (por insumo o por preparación). */
  private async findActiveRemanentesOn(
    client: StockDbClient,
    where: { insumoId: string } | { recipePreparationId: string }
  ): Promise<Remanente[]> {
    const list = await client.remanente.findMany({
      where: { ...where, status: 'ACTIVE' },
      orderBy: { expirationDate: 'asc' },
    });
    return list.map((raw) => this.toRemanente(raw));
  }

  private async incrementWarehouseStockOn(
    client: StockDbClient,
    insumoId: string,
    storageLocationId: string,
    quantity: DecimalQuantity
  ): Promise<void> {
    const q = quantity.toDecimal();
    await client.warehouseStock.upsert({
      where: { insumoId_storageLocationId: { insumoId, storageLocationId } },
      update: { quantity: { increment: q } },
      create: { insumoId, storageLocationId, quantity: q },
    });
  }

  private async saveRecipePreparationItemOn(
    client: StockDbClient,
    item: RecipePreparationItem
  ): Promise<void> {
    await client.recipePreparationItem.create({
      data: {
        id: item.id,
        preparationId: item.preparationId,
        insumoId: item.insumoId,
        extractedQty: item.extractedQty.toDecimal(),
        consumedQty: item.consumedQty.toDecimal(),
        leftoverQty: item.leftoverQty.toDecimal(),
        leftoverLocationId: item.leftoverLocationId ?? null,
        leftoverRemanenteId: item.remanenteId,
        wastedQty: item.wastedQty.toDecimal(),
        wasteReason: item.wasteReason ?? null,
      },
    });
  }

  // US-027: cross-cut stock↔kitchen dentro de la transacción de extracción.
  private async saveRecipePreparationOn(client: StockDbClient, preparation: RecipePreparation): Promise<void> {
    await client.recipePreparation.upsert(recipePreparationUpsertArgs(preparation));
  }

  private async deductStockAtAtomicallyOn(
    client: StockDbClient,
    insumoId: string,
    insumoName: string,
    storageLocationId: string,
    quantity: DecimalQuantity
  ): Promise<WarehouseBalancesAfterDeduction> {
    const q = quantity.toDecimal();

    // C-DEV-006-2: UPDATE condicional atómico — sin read-check-then-write.
    const updated = await client.warehouseStock.updateMany({
      where: { insumoId, storageLocationId, quantity: { gte: q } },
      data: { quantity: { decrement: q } },
    });

    if (updated.count === 0) {
      const line = await client.warehouseStock.findUnique({
        where: { insumoId_storageLocationId: { insumoId, storageLocationId } },
      });
      const available = line ? new DecimalQuantity(line.quantity.toString()) : new DecimalQuantity('0');
      throw new InsufficientStockException(insumoName, quantity.toString(), available.toString());
    }

    const [sectorLine, allLines] = await Promise.all([
      client.warehouseStock.findUnique({
        where: { insumoId_storageLocationId: { insumoId, storageLocationId } },
      }),
      client.warehouseStock.findMany({ where: { insumoId } }),
    ]);

    const remainingSectorStock = new DecimalQuantity((sectorLine?.quantity ?? 0).toString());
    const remainingWarehouseStock = allLines.reduce(
      (acc, l) => acc.add(new DecimalQuantity(l.quantity.toString())),
      new DecimalQuantity('0')
    );

    return { remainingSectorStock, remainingWarehouseStock };
  }

  private async saveRemanenteOn(client: StockDbClient, remanente: Remanente): Promise<void> {
    await client.remanente.upsert({
      where: { id: remanente.id },
      update: {
        currentQuantity: remanente.currentQuantity.toDecimal(),
        status: remanente.status as RemanenteStatusType,
        terminalAt: remanente.terminalAt ?? null,
        location: remanente.location,
        storageLocationId: remanente.storageLocationId ?? null,
        recipePreparationId: remanente.recipePreparationId ?? null,
        isPristine: remanente.isPristine,
      },
      create: {
        id: remanente.id,
        insumoId: remanente.insumoId,
        currentQuantity: remanente.currentQuantity.toDecimal(),
        initialQuantity: remanente.initialQuantity.toDecimal(),
        location: remanente.location,
        storageLocationId: remanente.storageLocationId ?? null,
        recipePreparationId: remanente.recipePreparationId ?? null,
        isPristine: remanente.isPristine,
        status: remanente.status as RemanenteStatusType,
        expirationDate: remanente.expirationDate,
        terminalAt: remanente.terminalAt ?? null,
      },
    });
  }

  private async recordMovementOn(client: StockDbClient, movement: StockMovementRecord): Promise<void> {
    await client.stockMovement.create({
      data: {
        id: movement.id,
        insumoId: movement.insumoId,
        type: movement.type,
        quantity: movement.quantity,
        fromLoc: movement.fromLoc,
        fromStorageLocationId: movement.fromStorageLocationId,
        toLoc: movement.toLoc,
        operatorId: movement.operatorId,
        purpose: movement.purpose,
        reason: movement.reason,
        reasonId: movement.reasonId,
        recipeId: movement.recipeId,
      },
    });
  }

  private toRemanente(raw: {
    id: string;
    insumoId: string;
    currentQuantity: { toString(): string };
    initialQuantity: { toString(): string };
    location: string;
    storageLocationId: string | null;
    recipePreparationId: string | null;
    isPristine: boolean;
    status: string;
    expirationDate: Date;
    createdAt: Date;
    terminalAt: Date | null;
  }): Remanente {
    return new Remanente({
      id: raw.id,
      insumoId: raw.insumoId,
      currentQuantity: new DecimalQuantity(raw.currentQuantity.toString()),
      initialQuantity: new DecimalQuantity(raw.initialQuantity.toString()),
      location: raw.location,
      storageLocationId: raw.storageLocationId ?? undefined,
      recipePreparationId: raw.recipePreparationId ?? undefined,
      isPristine: raw.isPristine,
      status: raw.status as RemanenteStatusType,
      expirationDate: raw.expirationDate,
      createdAt: raw.createdAt,
      terminalAt: raw.terminalAt ?? undefined,
    });
  }
}
