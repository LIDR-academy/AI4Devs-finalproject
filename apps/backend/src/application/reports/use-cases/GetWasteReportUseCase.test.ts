import { describe, it, expect, beforeEach } from 'vitest';
import { GetWasteReportUseCase } from './GetWasteReportUseCase.js';
import { InMemoryReportRepository } from '../../../infrastructure/reports/repositories/InMemoryReportRepository.js';
import { WasteSummary } from '../../../domain/reports/entities/WasteSummary.js';
import { DecimalQuantity } from '../../../domain/stock/value-objects/DecimalQuantity.js';

describe('TK-010: GetWasteReportUseCase TDD Suite', () => {
  let reportRepo: InMemoryReportRepository;
  let useCase: GetWasteReportUseCase;

  beforeEach(() => {
    reportRepo = new InMemoryReportRepository();
    useCase = new GetWasteReportUseCase(reportRepo);
  });

  it('debe retornar el consolidado de mermas serializando cantidades como cadenas de texto', async () => {
    const result = await useCase.execute({
      startDate: '2026-08-01T00:00:00.000Z',
      endDate: '2026-08-05T23:59:59.000Z',
    });

    expect(result.length).toBeGreaterThan(0);
    expect(typeof result[0].totalDiscardedQuantity).toBe('string');
    expect(result[0].totalDiscardedQuantity).toBe('3.500');
  });

  it('debe rechazar la consulta si startDate es posterior a endDate', async () => {
    await expect(
      useCase.execute({
        startDate: '2026-08-10T00:00:00.000Z',
        endDate: '2026-08-05T23:59:59.000Z',
      })
    ).rejects.toThrow(/no puede ser posterior/i);
  });

  it('debe aceptar la consulta cuando startDate y endDate son el mismo instante (limite inclusivo)', async () => {
    await expect(
      useCase.execute({
        startDate: '2026-08-05T00:00:00.000Z',
        endDate: '2026-08-05T00:00:00.000Z',
      })
    ).resolves.not.toThrow();
  });

  it('debe rechazar la consulta si startDate no es una fecha ISO 8601 valida', async () => {
    await expect(
      useCase.execute({
        startDate: 'fecha-invalida',
        endDate: '2026-08-05T23:59:59.000Z',
      })
    ).rejects.toThrow(/fechas deben ser cadenas ISO 8601 validas/i);
  });

  it('debe calcular totalDiscardedCost multiplicando la cantidad descartada por el unitCost del insumo (US-019 Escenario 1)', async () => {
    reportRepo.seedWasteSummary(
      new WasteSummary({
        insumoId: 'ins-queso-1',
        insumoName: 'Queso Mozzarella',
        unitOfMeasure: 'KG',
        totalDiscardedQuantity: new DecimalQuantity('3.500'),
        reason: 'EXPIRATION',
        unitCost: new DecimalQuantity('1800.00'),
      })
    );

    const result = await useCase.execute({
      startDate: '2026-08-01T00:00:00.000Z',
      endDate: '2026-08-05T23:59:59.000Z',
    });

    expect(result[0].totalDiscardedCost).toBe('6300.00');
  });

  it('debe retornar totalDiscardedCost null cuando el insumo no tiene unitCost registrado (US-019 Escenario 2)', async () => {
    reportRepo.seedWasteSummary(
      new WasteSummary({
        insumoId: 'ins-tomate-1',
        insumoName: 'Salsa de Tomate',
        unitOfMeasure: 'L',
        totalDiscardedQuantity: new DecimalQuantity('1.000'),
        reason: 'DAMAGE_OR_DROP',
      })
    );

    const result = await useCase.execute({
      startDate: '2026-08-01T00:00:00.000Z',
      endDate: '2026-08-05T23:59:59.000Z',
    });

    expect(result[0].totalDiscardedCost).toBeNull();
  });
});
