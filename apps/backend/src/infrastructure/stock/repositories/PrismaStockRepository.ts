import { PrismaClient } from '@prisma/client';
import { Insumo } from '../../../domain/stock/entities/Insumo.js';
import { Remanente, RemanenteStatusType } from '../../../domain/stock/entities/Remanente.js';
import { DecimalQuantity } from '../../../domain/stock/value-objects/DecimalQuantity.js';
import { IInsumoRepository } from '../../../domain/stock/repositories/IInsumoRepository.js';
import { IRemanenteRepository, StockMovementRecord } from '../../../domain/stock/repositories/IRemanenteRepository.js';

export class PrismaStockRepository implements IInsumoRepository, IRemanenteRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async findById(id: string): Promise<Insumo | null> {
    const raw = await this.prisma.insumo.findUnique({
      where: { id },
      include: { warehouseStocks: true },
    });
    if (!raw) return null;

    const mainStock = raw.warehouseStocks.find((s) => s.location === 'MAIN_WAREHOUSE');
    const quantity = mainStock ? mainStock.quantity.toString() : '0';

    return new Insumo({
      id: raw.id,
      name: raw.name,
      unitOfMeasure: raw.unitOfMeasure,
      warehouseStock: new DecimalQuantity(quantity),
    });
  }

  public async findByName(name: string): Promise<Insumo | null> {
    const raw = await this.prisma.insumo.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
      include: { warehouseStocks: true },
    });
    if (!raw) return null;

    const mainStock = raw.warehouseStocks.find((s) => s.location === 'MAIN_WAREHOUSE');
    const quantity = mainStock ? mainStock.quantity.toString() : '0';

    return new Insumo({
      id: raw.id,
      name: raw.name,
      unitOfMeasure: raw.unitOfMeasure,
      warehouseStock: new DecimalQuantity(quantity),
    });
  }

  public async findAll(): Promise<Insumo[]> {
    const list = await this.prisma.insumo.findMany({ include: { warehouseStocks: true } });

    return list.map((raw) => {
      const mainStock = raw.warehouseStocks.find((s) => s.location === 'MAIN_WAREHOUSE');
      const quantity = mainStock ? mainStock.quantity.toString() : '0';

      return new Insumo({
        id: raw.id,
        name: raw.name,
        unitOfMeasure: raw.unitOfMeasure,
        warehouseStock: new DecimalQuantity(quantity),
      });
    });
  }

  public async findRemanenteById(id: string): Promise<Remanente | null> {
    const raw = await this.prisma.remanente.findUnique({
      where: { id },
    });
    if (!raw) return null;

    return new Remanente({
      id: raw.id,
      insumoId: raw.insumoId,
      currentQuantity: new DecimalQuantity(raw.currentQuantity.toString()),
      initialQuantity: new DecimalQuantity(raw.initialQuantity.toString()),
      location: raw.location,
      status: raw.status as RemanenteStatusType,
      expirationDate: raw.expirationDate,
      createdAt: raw.createdAt,
    });
  }

  public async findActiveRemanentesByInsumoId(insumoId: string): Promise<Remanente[]> {
    const list = await this.prisma.remanente.findMany({
      where: {
        insumoId,
        status: 'ACTIVE',
      },
      orderBy: {
        expirationDate: 'asc',
      },
    });

    return list.map(
      (raw) =>
        new Remanente({
          id: raw.id,
          insumoId: raw.insumoId,
          currentQuantity: new DecimalQuantity(raw.currentQuantity.toString()),
          initialQuantity: new DecimalQuantity(raw.initialQuantity.toString()),
          location: raw.location,
          status: raw.status as RemanenteStatusType,
          expirationDate: raw.expirationDate,
          createdAt: raw.createdAt,
        })
    );
  }

  public async save(insumo: Insumo): Promise<void> {
    const stockQty = insumo.warehouseStock.toDecimal();

    await this.prisma.insumo.upsert({
      where: { id: insumo.id },
      update: {
        name: insumo.name,
        unitOfMeasure: insumo.unitOfMeasure,
        warehouseStocks: {
          upsert: {
            where: { id: `${insumo.id}_MAIN_WAREHOUSE` },
            update: { quantity: stockQty },
            create: {
              id: `${insumo.id}_MAIN_WAREHOUSE`,
              location: 'MAIN_WAREHOUSE',
              quantity: stockQty,
            },
          },
        },
      },
      create: {
        id: insumo.id,
        name: insumo.name,
        unitOfMeasure: insumo.unitOfMeasure,
        warehouseStocks: {
          create: {
            id: `${insumo.id}_MAIN_WAREHOUSE`,
            location: 'MAIN_WAREHOUSE',
            quantity: stockQty,
          },
        },
      },
    });
  }

  public async saveRemanente(remanente: Remanente): Promise<void> {
    await this.prisma.remanente.upsert({
      where: { id: remanente.id },
      update: {
        currentQuantity: remanente.currentQuantity.toDecimal(),
        status: remanente.status as RemanenteStatusType,
      },
      create: {
        id: remanente.id,
        insumoId: remanente.insumoId,
        currentQuantity: remanente.currentQuantity.toDecimal(),
        initialQuantity: remanente.initialQuantity.toDecimal(),
        location: remanente.location,
        status: remanente.status as RemanenteStatusType,
        expirationDate: remanente.expirationDate,
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
      },
    });
  }
}
