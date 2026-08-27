import { SystemSettings } from '../entities/SystemSettings.js';

export interface ISystemSettingsRepository {
  getSettings(): Promise<SystemSettings>;
  saveSettings(settings: SystemSettings): Promise<void>;
}
