import { PrismaClient } from '../../../generated/prisma/client.js';
import { Insumo } from '../../../domain/stock/entities/Insumo.js';
import { Remanente, RemanenteStatusType } from '../../../domain/stock/entities/Remanente.js';
import { DecimalQuantity } from '../../../domain/stock/value-objects/DecimalQuantity.js';
import { IInsumoRepository } from '../../../domain/stock/repositories/IInsumoRepository.js';
import { IRemanenteRepository, StockMovementRecord } from '../../../domain/stock/repositories/IRemanenteRepository.js';

type RawInsumo = {
  id: string;
  name: string;
  unitOfMeasure: string;
  unitCost: { toString(): string } | null;
  warehouseStocks: { storageLocationId: string; quantity: { toString(): string } }[];
};

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

export class PrismaStockRepository implements IInsumoRepository, IRemanenteRepository {
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
    await this.prisma.remanente.upsert({
      where: { id: remanente.id },
      update: {
        currentQuantity: remanente.currentQuantity.toDecimal(),
        status: remanente.status as RemanenteStatusType,
        terminalAt: remanente.terminalAt ?? null,
      },
      create: {
        id: remanente.id,
        insumoId: remanente.insumoId,
        currentQuantity: remanente.currentQuantity.toDecimal(),
        initialQuantity: remanente.initialQuantity.toDecimal(),
        location: remanente.location,
        status: remanente.status as RemanenteStatusType,
        expirationDate: remanente.expirationDate,
        terminalAt: remanente.terminalAt ?? null,
      },
    });
  }

  public async recordMovement(movement: StockMovementRecord): Promise<void> {
    await this.prisma.stockMovement.create({
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
      status: raw.status as RemanenteStatusType,
      expirationDate: raw.expirationDate,
      createdAt: raw.createdAt,
      terminalAt: raw.terminalAt ?? undefined,
    });
  }
}
