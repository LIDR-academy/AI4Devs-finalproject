import { describe, it, expect, beforeEach } from 'vitest';
import { GetPreparationWasteReportUseCase } from './GetPreparationWasteReportUseCase.js';
import { InMemoryReportRepository } from '../../../infrastructure/reports/repositories/InMemoryReportRepository.js';
import { InMemorySettingsRepository } from '../../../infrastructure/settings/repositories/InMemorySettingsRepository.js';
import { PreparationWasteRecord, RecipeConsumptionRecord } from '../../../domain/reports/repositories/IReportRepository.js';
import { DecimalQuantity } from '../../../domain/stock/value-objects/DecimalQuantity.js';
import { SystemSettings } from '../../../domain/settings/entities/SystemSettings.js';

async function setWasteAlertThreshold(settingsRepo: InMemorySettingsRepository, percent: number): Promise<void> {
  const current = await settingsRepo.getSettings();
  await settingsRepo.saveSettings(
    new SystemSettings({
      id: current.id,
      restaurantName: current.restaurantName,
      taxId: current.taxId,
      currencySymbol: current.currencySymbol,
      criticalAlertHours: current.criticalAlertHours,
      defaultRemanenteHours: current.defaultRemanenteHours,
      varianceTolerancePercent: current.varianceTolerancePercent,
      idleTimeoutMinutes: current.idleTimeoutMinutes,
      preparationWasteAlertPercent: percent,
    })
  );
}

function wasteRecord(overrides: Partial<PreparationWasteRecord> = {}): PreparationWasteRecord {
  return {
    recipeId: 'rec-pizza',
    recipeName: 'Pizza Margarita',
    insumoId: 'ins-queso',
    insumoName: 'Queso Mozzarella',
    unitOfMeasure: 'KG',
    wasteReason: 'recorte no aprovechable',
    extractedQty: new DecimalQuantity('2.000'),
    wastedQty: new DecimalQuantity('0.100'),
    unitCost: new DecimalQuantity('4.00'),
    ...overrides,
  };
}

function consumptionRecord(overrides: Partial<RecipeConsumptionRecord> = {}): RecipeConsumptionRecord {
  return {
    recipeId: 'rec-pizza',
    recipeName: 'Pizza Margarita',
    insumoId: 'ins-queso',
    insumoName: 'Queso Mozzarella',
    unitOfMeasure: 'KG',
    theoreticalUnitQty: new DecimalQuantity('0.150'),
    actualPortions: 8,
    consumedQty: new DecimalQuantity('1.300'),
    ...overrides,
  };
}

describe('GetPreparationWasteReportUseCase (US-029 Escenarios 1-3)', () => {
  let reportRepo: InMemoryReportRepository;
  let settingsRepo: InMemorySettingsRepository;
  let useCase: GetPreparationWasteReportUseCase;
  const RANGE = { startDate: '2026-09-01T00:00:00.000Z', endDate: '2026-09-07T23:59:59.999Z' };

  beforeEach(() => {
    reportRepo = new InMemoryReportRepository();
    settingsRepo = new InMemorySettingsRepository();
    useCase = new GetPreparationWasteReportUseCase(reportRepo, settingsRepo);
  });

  it('Escenario 1: agrupa merma por receta → ingrediente → motivo, con valorización y % sobre lo extraído', async () => {
    reportRepo.seedPreparationWasteRecord(wasteRecord());
    reportRepo.seedPreparationWasteRecord(
      wasteRecord({ extractedQty: new DecimalQuantity('1.000'), wastedQty: new DecimalQuantity('0.050') })
    );
    // otro motivo del mismo ingrediente → línea aparte
    reportRepo.seedPreparationWasteRecord(wasteRecord({ wasteReason: 'caído al piso', wastedQty: new DecimalQuantity('0.020') }));

    const result = await useCase.execute(RANGE);

    expect(result.wasteByReason).toHaveLength(2);
    const recorteLine = result.wasteByReason.find((l) => l.wasteReason === 'recorte no aprovechable')!;
    expect(recorteLine.totalWastedQty).toBe('0.150'); // 0.100 + 0.050
    expect(recorteLine.totalExtractedQty).toBe('3.000'); // 2.000 + 1.000
    expect(recorteLine.wastePercent).toBe('5.00'); // 0.150 / 3.000 * 100
    expect(recorteLine.wastedCost).toBe('0.60'); // 0.150 * 4.00
  });

  it('Escenario 1 (US-019): wastedCost es null (no "0.00") si el insumo no tiene unitCost', async () => {
    reportRepo.seedPreparationWasteRecord(wasteRecord({ unitCost: undefined }));
    const result = await useCase.execute(RANGE);
    expect(result.wasteByReason[0].wastedCost).toBeNull();
  });

  it('Escenario 3: una línea con % de merma sobre el umbral se marca overThreshold, sin notificación', async () => {
    // umbral 5% (default); merma del 12% debe superarlo
    reportRepo.seedPreparationWasteRecord(
      wasteRecord({ extractedQty: new DecimalQuantity('1.000'), wastedQty: new DecimalQuantity('0.120') })
    );
    const result = await useCase.execute(RANGE);
    expect(result.wasteAlertThresholdPercent).toBe(5);
    expect(result.wasteByReason[0].wastePercent).toBe('12.00');
    expect(result.wasteByReason[0].overThreshold).toBe(true);
  });

  it('Escenario 3: una línea bajo el umbral NO se marca overThreshold', async () => {
    reportRepo.seedPreparationWasteRecord(
      wasteRecord({ extractedQty: new DecimalQuantity('1.000'), wastedQty: new DecimalQuantity('0.030') })
    );
    const result = await useCase.execute(RANGE);
    expect(result.wasteByReason[0].overThreshold).toBe(false);
  });

  it('Escenario 3: respeta un umbral configurado distinto del default', async () => {
    await setWasteAlertThreshold(settingsRepo, 20);
    reportRepo.seedPreparationWasteRecord(
      wasteRecord({ extractedQty: new DecimalQuantity('1.000'), wastedQty: new DecimalQuantity('0.120') })
    );
    const result = await useCase.execute(RANGE);
    expect(result.wasteAlertThresholdPercent).toBe(20);
    expect(result.wasteByReason[0].overThreshold).toBe(false); // 12% < 20%
  });

  it('Escenario 2: agrupa consumo real vs. teórico por receta → ingrediente, con la diferencia', async () => {
    // 2 preparaciones cerradas de la misma receta/ingrediente: 6 y 8 porciones reales.
    reportRepo.seedRecipeConsumptionRecord(consumptionRecord({ actualPortions: 6, consumedQty: new DecimalQuantity('1.000') }));
    reportRepo.seedRecipeConsumptionRecord(consumptionRecord({ actualPortions: 8, consumedQty: new DecimalQuantity('1.300') }));

    const result = await useCase.execute(RANGE);

    expect(result.consumptionVsTheoretical).toHaveLength(1);
    const line = result.consumptionVsTheoretical[0];
    // teórico = 0.150*6 + 0.150*8 = 0.900 + 1.200 = 2.100 ; real = 1.000 + 1.300 = 2.300
    expect(line.theoreticalQty).toBe('2.100');
    expect(line.actualQty).toBe('2.300');
    expect(line.differenceQty).toBe('0.200');
  });

  it('sin datos en el rango → reporte vacío pero con el umbral configurado', async () => {
    const result = await useCase.execute(RANGE);
    expect(result.wasteByReason).toEqual([]);
    expect(result.consumptionVsTheoretical).toEqual([]);
    expect(result.wasteAlertThresholdPercent).toBe(5);
  });

  it('rechaza un rango de fechas invertido', async () => {
    await expect(
      useCase.execute({ startDate: '2026-09-07T00:00:00.000Z', endDate: '2026-09-01T00:00:00.000Z' })
    ).rejects.toThrow(/no puede ser posterior/i);
  });
});
