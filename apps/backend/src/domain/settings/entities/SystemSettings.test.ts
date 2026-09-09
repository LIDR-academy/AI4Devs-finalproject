import { describe, it, expect } from 'vitest';
import { SystemSettings } from './SystemSettings.js';

describe('SystemSettings (US-029 / TK-105: preparationWasteAlertPercent)', () => {
  it('expone todos los campos vía getters', () => {
    const updatedAt = new Date('2026-09-04T12:00:00.000Z');
    const settings = new SystemSettings({
      id: 'default',
      restaurantName: 'RestoStock Kitchen',
      taxId: 'RUT-12345678-9',
      currencySymbol: '$',
      criticalAlertHours: 24,
      defaultRemanenteHours: 24,
      varianceTolerancePercent: 5,
      idleTimeoutMinutes: 15,
      preparationWasteAlertPercent: 5,
      updatedAt,
    });

    expect(settings.id).toBe('default');
    expect(settings.restaurantName).toBe('RestoStock Kitchen');
    expect(settings.taxId).toBe('RUT-12345678-9');
    expect(settings.currencySymbol).toBe('$');
    expect(settings.criticalAlertHours).toBe(24);
    expect(settings.defaultRemanenteHours).toBe(24);
    expect(settings.varianceTolerancePercent).toBe(5);
    expect(settings.idleTimeoutMinutes).toBe(15);
    expect(settings.preparationWasteAlertPercent).toBe(5);
  });

  it('taxId es opcional (undefined cuando no viene)', () => {
    const settings = new SystemSettings({
      id: 'default',
      restaurantName: 'RestoStock Kitchen',
      currencySymbol: '$',
      criticalAlertHours: 24,
      defaultRemanenteHours: 24,
      varianceTolerancePercent: 5,
      idleTimeoutMinutes: 15,
      preparationWasteAlertPercent: 5,
    });
    expect(settings.taxId).toBeUndefined();
  });

  it('preparationWasteAlertPercent distingue valores distintos del default (no hardcodeado)', () => {
    const settings = new SystemSettings({
      id: 'default',
      restaurantName: 'RestoStock Kitchen',
      currencySymbol: '$',
      criticalAlertHours: 24,
      defaultRemanenteHours: 24,
      varianceTolerancePercent: 5,
      idleTimeoutMinutes: 15,
      preparationWasteAlertPercent: 20,
    });
    expect(settings.preparationWasteAlertPercent).toBe(20);
  });
});
