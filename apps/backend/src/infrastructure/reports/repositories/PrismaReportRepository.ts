import { PrismaClient } from '../../../generated/prisma/client.js';
import { WasteSummary } from '../../../domain/reports/entities/WasteSummary.js';
import { DecimalQuantity } from '../../../domain/stock/value-objects/DecimalQuantity.js';
import { IReportRepository } from '../../../domain/reports/repositories/IReportRepository.js';

interface WasteAccumulator {
  insumoId: string;
  insumoName: string;
  unitOfMeasure: string;
  reason: string;
  total: DecimalQuantity;
}

// El motivo de descarte no vive en una columna propia (StockMovement no tiene `reason` en el
// schema actual, ver TK-048): DiscardRemanenteUseCase lo codifica dentro de `type` como
// `DISCARD_<reason>` (ej. "DISCARD_EXPIRATION"), y el auto-descarte de PerformShiftReconciliation
// UseCase usa el literal `DISCARD` sin sufijo — se agrupa como EXPIRATION porque solo dispara
// sobre remanentes ya vencidos.
function extractDiscardReason(movementType: string): string {
  if (movementType === 'DISCARD') {
    return 'EXPIRATION';
  }
  return movementType.replace(/^DISCARD_/, '');
}

export class PrismaReportRepository implements IReportRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async getWasteReport(startDate: Date, endDate: Date): Promise<WasteSummary[]> {
    const movements = await this.prisma.stockMovement.findMany({
      where: {
        type: { startsWith: 'DISCARD' },
        createdAt: { gte: startDate, lte: endDate },
      },
      include: { insumo: true },
    });

    const summaryByKey = new Map<string, WasteAccumulator>();

    for (const movement of movements) {
      const reason = extractDiscardReason(movement.type);
      const key = `${movement.insumoId}::${reason}`;
      const quantity = new DecimalQuantity(movement.quantity.toString());

      const existing = summaryByKey.get(key);
      if (existing) {
        existing.total = existing.total.add(quantity);
        continue;
      }

      summaryByKey.set(key, {
        insumoId: movement.insumoId,
        insumoName: movement.insumo.name,
        unitOfMeasure: movement.insumo.unitOfMeasure,
        reason,
        total: quantity,
      });
    }

    return Array.from(summaryByKey.values()).map(
      (accumulator) =>
        new WasteSummary({
          insumoId: accumulator.insumoId,
          insumoName: accumulator.insumoName,
          unitOfMeasure: accumulator.unitOfMeasure,
          totalDiscardedQuantity: accumulator.total,
          reason: accumulator.reason,
        })
    );
  }
}
