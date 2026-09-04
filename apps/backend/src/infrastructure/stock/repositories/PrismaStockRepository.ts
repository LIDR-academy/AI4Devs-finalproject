import { PrismaClient, Prisma } from '../../../generated/prisma/client.js';
import { Insumo } from '../../../domain/stock/entities/Insumo.js';
import { Remanente, RemanenteStatusType } from '../../../domain/stock/entities/Remanente.js';
import { DecimalQuantity } from '../../../domain/stock/value-objects/DecimalQuantity.js';
import { IInsumoRepository } from '../../../domain/stock/repositories/IInsumoRepository.js';
import { IRemanenteRepository, StockMovementRecord } from '../../../domain/stock/repositories/IRemanenteRepository.js';
import {
  ExtractionUnitOfWork,
  IStockUnitOfWork,
  WarehouseBalancesAfterDeduction,
} from '../../../domain/stock/repositories/IStockUnitOfWork.js';
import { RecipePreparation } from '../../../domain/kitchen/entities/RecipePreparation.js';
import { recipePreparationUpsertArgs } from '../../kitchen/repositories/PrismaRecipePreparationRepository.js';
import { InsufficientStockException } from '../../../domain/stock/errors/InsufficientStockException.js';

type RawInsumo = {
  id: string;
  name: string;
  unitOfMeasure: string;
  unitCost: { toString(): string } | null;
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

    await this.prisma.$transaction(async (tx) => {
      await tx.insumo.upsert({
        where: { id: insumo.id },
        update: { name: insumo.name, unitOfMeasure: insumo.unitOfMeasure, unitCost },
        create: { id: insumo.id, name: insumo.name, unitOfMeasure: insumo.unitOfMeasure, unitCost },
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
        storageLocationId: remanente.storageLocationId ?? null,
        recipePreparationId: remanente.recipePreparationId ?? null,
      },
      create: {
        id: remanente.id,
        insumoId: remanente.insumoId,
        currentQuantity: remanente.currentQuantity.toDecimal(),
        initialQuantity: remanente.initialQuantity.toDecimal(),
        location: remanente.location,
        storageLocationId: remanente.storageLocationId ?? null,
        recipePreparationId: remanente.recipePreparationId ?? null,
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
        toLoc: movement.toLoc,
        operatorId: movement.operatorId,
        purpose: movement.purpose,
        reason: movement.reason,
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
      status: raw.status as RemanenteStatusType,
      expirationDate: raw.expirationDate,
      createdAt: raw.createdAt,
      terminalAt: raw.terminalAt ?? undefined,
    });
  }
}
