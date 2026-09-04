import { PrismaClient, Prisma } from '../../../generated/prisma/client.js';
import { WasteSummary } from '../../../domain/reports/entities/WasteSummary.js';
import { DecimalQuantity } from '../../../domain/stock/value-objects/DecimalQuantity.js';
import {
  IReportRepository,
  PreparationWasteRecord,
  RecipeConsumptionRecord,
  RemanenteRotationRecord,
} from '../../../domain/reports/repositories/IReportRepository.js';

interface WasteAccumulator {
  insumoId: string;
  insumoName: string;
  unitOfMeasure: string;
  reason: string;
  total: DecimalQuantity;
  unitCost: DecimalQuantity | undefined;
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
        unitCost: movement.insumo.unitCost !== null ? new DecimalQuantity(movement.insumo.unitCost.toString()) : undefined,
      });
    }

    // US-019: unitCost se transporta tal cual (sin multiplicar) — el calculo de
    // totalDiscardedCost es una regla de negocio y vive en GetWasteReportUseCase
    // (capa Application), no en este adaptador de infraestructura.
    return Array.from(summaryByKey.values()).map(
      (accumulator) =>
        new WasteSummary({
          insumoId: accumulator.insumoId,
          insumoName: accumulator.insumoName,
          unitOfMeasure: accumulator.unitOfMeasure,
          totalDiscardedQuantity: accumulator.total,
          reason: accumulator.reason,
          unitCost: accumulator.unitCost,
        })
    );
  }

  /**
   * US-029 / TK-105: `RecipePreparationItem` de preparaciones `CLOSED` cerradas en el
   * rango, con la receta (y sus ingredientes, para el consumo teórico) precargada.
   * `RecipePreparationItem.insumoId` no tiene relación Prisma declarada (evita una
   * migración solo para el reporte) — el nombre/costo del insumo se resuelve con una
   * segunda consulta (`loadInsumoMap`).
   */
  private async findClosedPreparationItems(startDate: Date, endDate: Date) {
    return this.prisma.recipePreparationItem.findMany({
      where: { preparation: { status: 'CLOSED', closedAt: { gte: startDate, lte: endDate } } },
      include: { preparation: { include: { recipe: { include: { ingredients: true } } } } },
    });
  }

  private async loadInsumoMap(insumoIds: string[]) {
    const unique = Array.from(new Set(insumoIds));
    if (unique.length === 0) return new Map<string, { name: string; unitOfMeasure: string; unitCost: Prisma.Decimal | null }>();
    const insumos = await this.prisma.insumo.findMany({ where: { id: { in: unique } } });
    return new Map(insumos.map((i) => [i.id, { name: i.name, unitOfMeasure: i.unitOfMeasure, unitCost: i.unitCost }]));
  }

  public async getPreparationWasteRecords(startDate: Date, endDate: Date): Promise<PreparationWasteRecord[]> {
    const items = (await this.findClosedPreparationItems(startDate, endDate)).filter(
      (i) => i.wasteReason && new DecimalQuantity(i.wastedQty.toString()).toDecimal().greaterThan(0)
    );
    const insumoMap = await this.loadInsumoMap(items.map((i) => i.insumoId));

    return items.map((i) => {
      const insumo = insumoMap.get(i.insumoId);
      return {
        recipeId: i.preparation.recipeId,
        recipeName: i.preparation.recipe.name,
        insumoId: i.insumoId,
        insumoName: insumo?.name ?? i.insumoId,
        unitOfMeasure: insumo?.unitOfMeasure ?? '',
        wasteReason: i.wasteReason as string,
        extractedQty: new DecimalQuantity(i.extractedQty.toString()),
        wastedQty: new DecimalQuantity(i.wastedQty.toString()),
        unitCost: insumo?.unitCost != null ? new DecimalQuantity(insumo.unitCost.toString()) : undefined,
      };
    });
  }

  public async getRecipeConsumptionRecords(startDate: Date, endDate: Date): Promise<RecipeConsumptionRecord[]> {
    const items = await this.findClosedPreparationItems(startDate, endDate);
    const insumoMap = await this.loadInsumoMap(items.map((i) => i.insumoId));

    return items.map((i) => {
      const insumo = insumoMap.get(i.insumoId);
      const ingredient = i.preparation.recipe.ingredients.find((ing) => ing.insumoId === i.insumoId);
      return {
        recipeId: i.preparation.recipeId,
        recipeName: i.preparation.recipe.name,
        insumoId: i.insumoId,
        insumoName: insumo?.name ?? i.insumoId,
        unitOfMeasure: insumo?.unitOfMeasure ?? '',
        theoreticalUnitQty: new DecimalQuantity(ingredient ? ingredient.quantity.toString() : '0'),
        actualPortions: i.preparation.actualPortions ?? 0,
        consumedQty: new DecimalQuantity(i.consumedQty.toString()),
      };
    });
  }

  public async getTerminalRemanentes(startDate: Date, endDate: Date): Promise<RemanenteRotationRecord[]> {
    // US-020: EXHAUSTED (consumo total) y DISCARDED cuentan ambos como estado terminal —
    // decision de negocio confirmada, el TRR mide el ciclo de vida completo del remanente.
    // Remanentes preexistentes a esta migracion pueden tener el status terminal pero
    // terminalAt null (nunca se registro la transicion): se excluyen explicitamente, no
    // se infieren desde updatedAt (que muta por razones no terminales, ver getWasteReport).
    const remanentes = await this.prisma.remanente.findMany({
      where: {
        status: { in: ['EXHAUSTED', 'DISCARDED'] },
        terminalAt: { not: null, gte: startDate, lte: endDate },
      },
      select: { createdAt: true, terminalAt: true },
    });

    return remanentes
      .filter((r): r is { createdAt: Date; terminalAt: Date } => r.terminalAt !== null)
      .map((r) => ({ createdAt: r.createdAt, terminalAt: r.terminalAt }));
  }
}
