import { describe, it, expect, beforeEach } from 'vitest';
import { UpdateSystemSettingsUseCase } from './UpdateSystemSettingsUseCase.js';
import { InMemorySettingsRepository } from '../../../infrastructure/settings/repositories/InMemorySettingsRepository.js';

describe('UpdateSystemSettingsUseCase (US-029 / TK-105: preparationWasteAlertPercent)', () => {
  let repo: InMemorySettingsRepository;
  let useCase: UpdateSystemSettingsUseCase;

  beforeEach(() => {
    repo = new InMemorySettingsRepository();
    useCase = new UpdateSystemSettingsUseCase(repo);
  });

  it('actualiza solo preparationWasteAlertPercent, sin tocar el resto de los campos', async () => {
    const before = await repo.getSettings();
    const updated = await useCase.execute({ preparationWasteAlertPercent: 20 });

    expect(updated.preparationWasteAlertPercent).toBe(20);
    expect(updated.restaurantName).toBe(before.restaurantName);
    expect(updated.currencySymbol).toBe(before.currencySymbol);
    expect(updated.criticalAlertHours).toBe(before.criticalAlertHours);
    expect(updated.defaultRemanenteHours).toBe(before.defaultRemanenteHours);
    expect(updated.varianceTolerancePercent).toBe(before.varianceTolerancePercent);
    expect(updated.idleTimeoutMinutes).toBe(before.idleTimeoutMinutes);
    expect(updated.id).toBe(before.id);
  });

  it('sin preparationWasteAlertPercent en el comando, conserva el valor actual', async () => {
    await useCase.execute({ preparationWasteAlertPercent: 30 });
    const updated = await useCase.execute({ restaurantName: 'Otro Nombre' });
    expect(updated.preparationWasteAlertPercent).toBe(30);
    expect(updated.restaurantName).toBe('Otro Nombre');
  });

  it('persiste el resultado — una lectura posterior devuelve el valor actualizado', async () => {
    await useCase.execute({ preparationWasteAlertPercent: 12 });
    const persisted = await repo.getSettings();
    expect(persisted.preparationWasteAlertPercent).toBe(12);
  });

  it('actualiza todos los campos a la vez', async () => {
    const updated = await useCase.execute({
      restaurantName: 'Bistró',
      taxId: 'RUT-1',
      currencySymbol: '€',
      criticalAlertHours: 12,
      defaultRemanenteHours: 12,
      varianceTolerancePercent: 10,
      idleTimeoutMinutes: 30,
      preparationWasteAlertPercent: 8,
    });
    expect(updated).toMatchObject({
      restaurantName: 'Bistró',
      taxId: 'RUT-1',
      currencySymbol: '€',
      criticalAlertHours: 12,
      defaultRemanenteHours: 12,
      varianceTolerancePercent: 10,
      idleTimeoutMinutes: 30,
      preparationWasteAlertPercent: 8,
    });
  });
});
