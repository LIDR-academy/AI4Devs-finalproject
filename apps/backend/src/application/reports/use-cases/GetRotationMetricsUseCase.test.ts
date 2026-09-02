import { describe, it, expect, beforeEach } from 'vitest';
import { GetRotationMetricsUseCase } from './GetRotationMetricsUseCase.js';
import { InMemoryReportRepository } from '../../../infrastructure/reports/repositories/InMemoryReportRepository.js';

describe('TK-079: GetRotationMetricsUseCase — TRR Real (US-020)', () => {
  let reportRepo: InMemoryReportRepository;
  let useCase: GetRotationMetricsUseCase;

  beforeEach(() => {
    reportRepo = new InMemoryReportRepository();
    useCase = new GetRotationMetricsUseCase(reportRepo);
  });

  it('debe calcular el promedio de horas transcurridas entre createdAt y terminalAt de cada remanente (US-020 Escenario 1)', async () => {
    reportRepo.seedTerminalRemanente({
      createdAt: new Date('2026-08-01T00:00:00.000Z'),
      terminalAt: new Date('2026-08-02T00:00:00.000Z'), // 24h
    });
    reportRepo.seedTerminalRemanente({
      createdAt: new Date('2026-08-01T00:00:00.000Z'),
      terminalAt: new Date('2026-08-03T00:00:00.000Z'), // 48h
    });
    reportRepo.seedTerminalRemanente({
      createdAt: new Date('2026-08-01T00:00:00.000Z'),
      terminalAt: new Date('2026-08-05T00:00:00.000Z'), // 96h
    });

    const result = await useCase.execute({
      startDate: '2026-08-01T00:00:00.000Z',
      endDate: '2026-08-06T00:00:00.000Z',
    });

    // (24 + 48 + 96) / 3 = 56
    expect(result.averageTrrHours).toBe(56);
    expect(result.sampleSize).toBe(3);
    expect(result.targetTrrHours).toBe(72);
  });

  it('debe incluir el tiempo hasta el descarte de un remanente en el promedio, no solo el consumo exitoso (decision de negocio US-020)', async () => {
    reportRepo.seedTerminalRemanente({
      createdAt: new Date('2026-08-01T00:00:00.000Z'),
      terminalAt: new Date('2026-08-01T10:00:00.000Z'), // 10h, sea cual sea el motivo terminal
    });

    const result = await useCase.execute({
      startDate: '2026-08-01T00:00:00.000Z',
      endDate: '2026-08-02T00:00:00.000Z',
    });

    expect(result.averageTrrHours).toBe(10);
  });

  it('debe retornar averageTrrHours null y sampleSize 0 cuando ningun remanente alcanzo estado terminal en el rango (US-020 Escenario 2)', async () => {
    const result = await useCase.execute({
      startDate: '2026-08-01T00:00:00.000Z',
      endDate: '2026-08-02T00:00:00.000Z',
    });

    expect(result.sampleSize).toBe(0);
    expect(result.averageTrrHours).toBeNull();
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
});
