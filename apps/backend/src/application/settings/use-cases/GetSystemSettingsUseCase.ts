import { ISystemSettingsRepository } from '../../../domain/settings/repositories/ISystemSettingsRepository.js';
import { SystemSettings } from '../../../domain/settings/entities/SystemSettings.js';

export class GetSystemSettingsUseCase {
  constructor(private settingsRepository: ISystemSettingsRepository) {}

  async execute(): Promise<SystemSettings> {
    return this.settingsRepository.getSettings();
  }
}
