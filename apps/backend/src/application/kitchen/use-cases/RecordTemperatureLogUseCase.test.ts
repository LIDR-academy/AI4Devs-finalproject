import { describe, it, expect, beforeEach } from 'vitest';
import { RecordTemperatureLogUseCase } from './RecordTemperatureLogUseCase.js';
import { InMemoryTemperatureLogRepository } from '../../../infrastructure/kitchen/repositories/InMemoryTemperatureLogRepository.js';
import { InMemoryLocationRepository } from '../../../infrastructure/stock/repositories/InMemoryLocationRepository.js';
import { EntityNotFoundException } from '../../../domain/errors/EntityNotFoundException.js';
import { cryptoIdGenerator } from '../../../infrastructure/shared/cryptoIdGenerator.js';
import { systemClock } from '../../../infrastructure/shared/systemClock.js';

describe('RecordTemperatureLogUseCase (TK-120 / US-033)', () => {
  let repository: InMemoryTemperatureLogRepository;
  let locationRepository: InMemoryLocationRepository;
  let useCase: RecordTemperatureLogUseCase;

  beforeEach(() => {
    repository = new InMemoryTemperatureLogRepository();
    locationRepository = new InMemoryLocationRepository();
    useCase = new RecordTemperatureLogUseCase(repository, locationRepository, cryptoIdGenerator, systemClock);
  });

  it('Criterio 1: registra dentro de rango seguro (REFRIGERATOR <= 4.00°C)', async () => {
    const result = await useCase.execute({
      storageLocationId: 'loc-1',
      unitType: 'REFRIGERATOR',
      temperatureCelsius: '3.5',
      recordedByUserId: 'usr-staff-1',
    });

    expect(result.isWithinSafeRange).toBe(true);
    expect(result.temperatureCelsius).toBe('3.50');
  });

  it('Criterio 2: registra fuera de rango SIN bloquear (nunca 400/422 por el valor en sí)', async () => {
    const result = await useCase.execute({
      storageLocationId: 'loc-1',
      unitType: 'REFRIGERATOR',
      temperatureCelsius: '7.2',
      recordedByUserId: 'usr-staff-1',
    });

    expect(result.isWithinSafeRange).toBe(false);
  });

  it('FREEZER dentro de rango (<= -18.00°C), incluida una lectura muy negativa', async () => {
    const result = await useCase.execute({
      storageLocationId: 'loc-1',
      unitType: 'FREEZER',
      temperatureCelsius: '-20.5',
      recordedByUserId: 'usr-staff-1',
    });

    expect(result.isWithinSafeRange).toBe(true);
  });

  it('FREEZER fuera de rango (más caliente que -18.00°C, ej. -10°C)', async () => {
    const result = await useCase.execute({
      storageLocationId: 'loc-1',
      unitType: 'FREEZER',
      temperatureCelsius: '-10.0',
      recordedByUserId: 'usr-staff-1',
    });

    expect(result.isWithinSafeRange).toBe(false);
  });

  it('lanza EntityNotFoundException si storageLocationId no existe', async () => {
    await expect(
      useCase.execute({
        storageLocationId: 'loc-inexistente',
        unitType: 'REFRIGERATOR',
        temperatureCelsius: '3.0',
        recordedByUserId: 'usr-staff-1',
      })
    ).rejects.toThrow(EntityNotFoundException);
  });

  it('persiste el registro para que quede disponible en el histórico', async () => {
    await useCase.execute({
      storageLocationId: 'loc-1',
      unitType: 'REFRIGERATOR',
      temperatureCelsius: '3.0',
      recordedByUserId: 'usr-staff-1',
    });

    const all = await repository.findAll();
    expect(all).toHaveLength(1);
    expect(all[0].storageLocationId).toBe('loc-1');
  });
});
