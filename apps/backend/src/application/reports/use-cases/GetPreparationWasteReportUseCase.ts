import { IReportRepository, PreparationWasteRecord, RecipeConsumptionRecord } from '../../../domain/reports/repositories/IReportRepository.js';
import { ISystemSettingsRepository } from '../../../domain/settings/repositories/ISystemSettingsRepository.js';
import { DecimalQuantity } from '../../../domain/stock/value-objects/DecimalQuantity.js';
import { DateRangeInput, parseDateRange } from '../parseDateRange.js';

export type GetPreparationWasteReportInput = DateRangeInput;

interface PreparationWasteLineDTO {
  recipeId: string;
  recipeName: string;
  insumoId: string;
  insumoName: string;
  unitOfMeasure: string;
  wasteReason: string;
  totalWastedQty: string;
  totalExtractedQty: string;
  /** US-029: `wastedQty / extractedQty × 100`, con 2 decimales. */
  wastePercent: string;
  /** US-019: `null` (no "0.00") cuando el insumo no tiene `unitCost` registrado. */
  wastedCost: string | null;
  /** US-029 Escenario 3: `wastePercent > SystemSettings.preparationWasteAlertPercent`. Sin notificación (#12, diferido). */
  overThreshold: boolean;
}

interface RecipeConsumptionLineDTO {
  recipeId: string;
  recipeName: string;
  insumoId: string;
  insumoName: string;
  unitOfMeasure: string;
  theoreticalQty: string;
  actualQty: string;
  /** `actualQty − theoreticalQty`; positivo = la receta consume sistemáticamente más de lo especificado. */
  differenceQty: string;
}

export interface PreparationWasteReportDTO {
  wasteByReason: PreparationWasteLineDTO[];
  consumptionVsTheoretical: RecipeConsumptionLineDTO[];
  wasteAlertThresholdPercent: number;
}

interface WasteAccumulator {
  record: PreparationWasteRecord;
  totalWasted: DecimalQuantity;
  totalExtracted: DecimalQuantity;
}

interface ConsumptionAccumulator {
  record: RecipeConsumptionRecord;
  theoreticalTotal: DecimalQuantity;
  actualTotal: DecimalQuantity;
}

function groupWasteRecords(records: PreparationWasteRecord[]): Map<string, WasteAccumulator> {
  const byKey = new Map<string, WasteAccumulator>();
  for (const record of records) {
    const key = `${record.recipeId}::${record.insumoId}::${record.wasteReason}`;
    const existing = byKey.get(key);
    if (existing) {
      existing.totalWasted = existing.totalWasted.add(record.wastedQty);
      existing.totalExtracted = existing.totalExtracted.add(record.extractedQty);
      continue;
    }
    byKey.set(key, { record, totalWasted: record.wastedQty, totalExtracted: record.extractedQty });
  }
  return byKey;
}

function toWasteLine(acc: WasteAccumulator, thresholdPercent: number): PreparationWasteLineDTO {
  const { record, totalWasted, totalExtracted } = acc;
  const wastePercentValue = totalExtracted.toDecimal().isZero()
    ? totalExtracted.toDecimal()
    : totalWasted.toDecimal().div(totalExtracted.toDecimal()).mul(100);

  return {
    recipeId: record.recipeId,
    recipeName: record.recipeName,
    insumoId: record.insumoId,
    insumoName: record.insumoName,
    unitOfMeasure: record.unitOfMeasure,
    wasteReason: record.wasteReason,
    totalWastedQty: totalWasted.toString(),
    totalExtractedQty: totalExtracted.toString(),
    wastePercent: wastePercentValue.toFixed(2),
    wastedCost: record.unitCost ? totalWasted.toDecimal().times(record.unitCost.toDecimal()).toFixed(2) : null,
    overThreshold: wastePercentValue.greaterThan(thresholdPercent),
  };
}

function groupConsumptionRecords(records: RecipeConsumptionRecord[]): Map<string, ConsumptionAccumulator> {
  const byKey = new Map<string, ConsumptionAccumulator>();
  for (const record of records) {
    const key = `${record.recipeId}::${record.insumoId}`;
    const theoretical = new DecimalQuantity(record.theoreticalUnitQty.toDecimal().mul(record.actualPortions));
    const existing = byKey.get(key);
    if (existing) {
      existing.theoreticalTotal = existing.theoreticalTotal.add(theoretical);
      existing.actualTotal = existing.actualTotal.add(record.consumedQty);
      continue;
    }
    byKey.set(key, { record, theoreticalTotal: theoretical, actualTotal: record.consumedQty });
  }
  return byKey;
}

function toConsumptionLine(acc: ConsumptionAccumulator): RecipeConsumptionLineDTO {
  const { record, theoreticalTotal, actualTotal } = acc;
  return {
    recipeId: record.recipeId,
    recipeName: record.recipeName,
    insumoId: record.insumoId,
    insumoName: record.insumoName,
    unitOfMeasure: record.unitOfMeasure,
    theoreticalQty: theoreticalTotal.toString(),
    actualQty: actualTotal.toString(),
    differenceQty: actualTotal.toDecimal().minus(theoreticalTotal.toDecimal()).toFixed(3),
  };
}

/**
 * US-029 Escenarios 1-3: agrega `RecipePreparationItem` (preparaciones `CLOSED` en el
 * rango) por receta → ingrediente → motivo (merma + valorización + % sobre lo extraído,
 * destacando las líneas sobre `SystemSettings.preparationWasteAlertPercent` — sin
 * notificación, #12 diferido) y por receta → ingrediente (consumo real vs. teórico).
 */
export class GetPreparationWasteReportUseCase {
  constructor(
    private readonly reportRepository: IReportRepository,
    private readonly settingsRepository: ISystemSettingsRepository
  ) {}

  public async execute(input: GetPreparationWasteReportInput): Promise<PreparationWasteReportDTO> {
    const { start, end } = parseDateRange(input);
    const settings = await this.settingsRepository.getSettings();

    const wasteRecords = await this.reportRepository.getPreparationWasteRecords(start, end);
    const consumptionRecords = await this.reportRepository.getRecipeConsumptionRecords(start, end);

    return {
      wasteByReason: Array.from(groupWasteRecords(wasteRecords).values()).map((acc) =>
        toWasteLine(acc, settings.preparationWasteAlertPercent)
      ),
      consumptionVsTheoretical: Array.from(groupConsumptionRecords(consumptionRecords).values()).map(toConsumptionLine),
      wasteAlertThresholdPercent: settings.preparationWasteAlertPercent,
    };
  }
}
