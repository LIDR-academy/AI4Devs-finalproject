import { IAiConfigurationRepository } from '../../../domain/settings/repositories/IAiConfigurationRepository.js';
import { AiConfiguration } from '../../../domain/settings/entities/AiConfiguration.js';

export class InMemoryAiConfigurationRepository implements IAiConfigurationRepository {
  private config: AiConfiguration;

  constructor(initialConfig?: AiConfiguration) {
    this.config = initialConfig ?? AiConfiguration.createDefault();
  }

  async getConfig(): Promise<AiConfiguration> {
    return this.config;
  }

  async saveConfig(config: AiConfiguration): Promise<void> {
    this.config = config;
  }
}
