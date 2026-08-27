import { ISystemSettingsRepository } from '../../../domain/settings/repositories/ISystemSettingsRepository.js';
import { SystemSettings } from '../../../domain/settings/entities/SystemSettings.js';

export class InMemorySettingsRepository implements ISystemSettingsRepository {
  private settings: SystemSettings = new SystemSettings({
    id: 'default',
    restaurantName: 'RestoStock Kitchen',
    taxId: 'RUT-12345678-9',
    currencySymbol: '$',
    criticalAlertHours: 24,
    defaultRemanenteHours: 24,
    varianceTolerancePercent: 5.0,
  });

  async getSettings(): Promise<SystemSettings> {
    return this.settings;
  }

  async saveSettings(settings: SystemSettings): Promise<void> {
    this.settings = settings;
  }
}
