import { describe, it, expect, beforeEach } from 'vitest';
import { GetWasteReportUseCase } from './GetWasteReportUseCase.js';
import { InMemoryReportRepository } from '../../../infrastructure/reports/repositories/InMemoryReportRepository.js';

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
});
