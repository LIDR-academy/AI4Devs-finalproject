import { PrismaClient } from '../../../generated/prisma/client.js';
import { ISystemSettingsRepository } from '../../../domain/settings/repositories/ISystemSettingsRepository.js';
import { SystemSettings } from '../../../domain/settings/entities/SystemSettings.js';

export class PrismaSettingsRepository implements ISystemSettingsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getSettings(): Promise<SystemSettings> {
    let s = await this.prisma.systemSettings.findUnique({ where: { id: 'default' } });
    if (!s) {
      s = await this.prisma.systemSettings.create({
        data: {
          id: 'default',
          restaurantName: 'RestoStock Kitchen',
          taxId: 'RUT-12345678-9',
          currencySymbol: '$',
          criticalAlertHours: 24,
          defaultRemanenteHours: 24,
          varianceTolerancePercent: 5.0,
          idleTimeoutMinutes: 15,
          preparationWasteAlertPercent: 5,
        },
      });
    }

    return new SystemSettings({
      id: s.id,
      restaurantName: s.restaurantName,
      taxId: s.taxId || undefined,
      currencySymbol: s.currencySymbol,
      criticalAlertHours: s.criticalAlertHours,
      defaultRemanenteHours: s.defaultRemanenteHours,
      varianceTolerancePercent: Number(s.varianceTolerancePercent),
      idleTimeoutMinutes: s.idleTimeoutMinutes ?? 15,
      preparationWasteAlertPercent: s.preparationWasteAlertPercent ?? 5,
      updatedAt: s.updatedAt,
    });
  }

  async saveSettings(settings: SystemSettings): Promise<void> {
    const fields = {
      restaurantName: settings.restaurantName,
      taxId: settings.taxId,
      currencySymbol: settings.currencySymbol,
      criticalAlertHours: settings.criticalAlertHours,
      defaultRemanenteHours: settings.defaultRemanenteHours,
      varianceTolerancePercent: settings.varianceTolerancePercent,
      idleTimeoutMinutes: settings.idleTimeoutMinutes,
      preparationWasteAlertPercent: settings.preparationWasteAlertPercent,
    };
    // Fila única `id: 'default'` — create y update comparten exactamente los mismos
    // campos (solo create agrega el id), así que se arman a partir del mismo objeto.
    await this.prisma.systemSettings.upsert({
      where: { id: 'default' },
      create: { id: 'default', ...fields },
      update: fields,
    });
  }
}
