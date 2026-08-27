import { ISystemSettingsRepository } from '../../../domain/settings/repositories/ISystemSettingsRepository.js';
import { SystemSettings } from '../../../domain/settings/entities/SystemSettings.js';

export interface UpdateSystemSettingsCommand {
  restaurantName?: string;
  taxId?: string;
  currencySymbol?: string;
  criticalAlertHours?: number;
  defaultRemanenteHours?: number;
  varianceTolerancePercent?: number;
}

export class UpdateSystemSettingsUseCase {
  constructor(private settingsRepository: ISystemSettingsRepository) {}

  async execute(command: UpdateSystemSettingsCommand): Promise<SystemSettings> {
    const current = await this.settingsRepository.getSettings();

    const updated = new SystemSettings({
      id: current.id,
      restaurantName: command.restaurantName !== undefined ? command.restaurantName : current.restaurantName,
      taxId: command.taxId !== undefined ? command.taxId : current.taxId,
      currencySymbol: command.currencySymbol !== undefined ? command.currencySymbol : current.currencySymbol,
      criticalAlertHours: command.criticalAlertHours !== undefined ? command.criticalAlertHours : current.criticalAlertHours,
      defaultRemanenteHours: command.defaultRemanenteHours !== undefined ? command.defaultRemanenteHours : current.defaultRemanenteHours,
      varianceTolerancePercent: command.varianceTolerancePercent !== undefined ? command.varianceTolerancePercent : current.varianceTolerancePercent,
    });

    await this.settingsRepository.saveSettings(updated);
    return updated;
  }
}
