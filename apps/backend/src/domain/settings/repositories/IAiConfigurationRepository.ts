import { AiConfiguration } from '../entities/AiConfiguration.js';

export interface IAiConfigurationRepository {
  getConfig(): Promise<AiConfiguration>;
  saveConfig(config: AiConfiguration): Promise<void>;
}
