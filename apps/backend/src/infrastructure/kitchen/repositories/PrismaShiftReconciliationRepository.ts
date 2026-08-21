import { PrismaClient, Prisma } from '@prisma/client';
import Decimal from 'decimal.js';
import { ShiftReconciliation } from '../../../domain/kitchen/entities/ShiftReconciliation.js';
import { DecimalQuantity } from '../../../domain/stock/value-objects/DecimalQuantity.js';
import { IShiftReconciliationRepository } from '../../../domain/kitchen/repositories/IShiftReconciliationRepository.js';

type ReconciliationWithItems = Prisma.ShiftReconciliationGetPayload<{ include: { items: true } }>;

export class PrismaShiftReconciliationRepository implements IShiftReconciliationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async save(reconciliation: ShiftReconciliation): Promise<void> {
    await this.prisma.shiftReconciliation.upsert({
      where: { id: reconciliation.id },
      update: {
        shiftDate: reconciliation.shiftDate,
        operatorId: reconciliation.operatorId,
        notes: reconciliation.notes,
      },
      create: {
        id: reconciliation.id,
        shiftDate: reconciliation.shiftDate,
        operatorId: reconciliation.operatorId,
        notes: reconciliation.notes,
        items: {
          create: reconciliation.items.map((item) => ({
            remanenteId: item.remanenteId,
            insumoId: item.insumoId,
            physicalQuantity: item.physicalQuantity.toDecimal(),
            theoreticalQuantity: item.theoreticalQuantity.toDecimal(),
            variance: item.variance,
          })),
        },
      },
    });
  }

  public async findAll(): Promise<ShiftReconciliation[]> {
    const list = await this.prisma.shiftReconciliation.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
    return list.map((raw) => this.toDomain(raw));
  }

  private toDomain(raw: ReconciliationWithItems): ShiftReconciliation {
    return new ShiftReconciliation({
      id: raw.id,
      shiftDate: raw.shiftDate,
      operatorId: raw.operatorId,
      notes: raw.notes ?? undefined,
      createdAt: raw.createdAt,
      items: raw.items.map((item) => ({
        remanenteId: item.remanenteId,
        insumoId: item.insumoId,
        physicalQuantity: new DecimalQuantity(item.physicalQuantity.toString()),
        theoreticalQuantity: new DecimalQuantity(item.theoreticalQuantity.toString()),
        variance: new Decimal(item.variance.toString()),
      })),
    });
  }
}
