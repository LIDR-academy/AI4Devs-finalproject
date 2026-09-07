import { IAiConfigurationRepository } from '../../../domain/settings/repositories/IAiConfigurationRepository.js';
import { AiProviderType } from '../../../domain/settings/value-objects/AiProvider.js';
import { resolveProviderApiKey } from '../resolveProviderApiKey.js';

export interface AiConfigDTO {
  id: string;
  provider: AiProviderType;
  modelName: string;
  endpointUrl?: string | null;
  temperature: number;
  hasApiKey: boolean;
  rescueRecipesOn: boolean;
  updatedAt?: Date;
}

export class GetAiConfigUseCase {
  constructor(private readonly repository: IAiConfigurationRepository) {}

  async execute(): Promise<AiConfigDTO> {
    const config = await this.repository.getConfig();

    return {
      id: config.id,
      provider: config.provider,
      modelName: config.modelName,
      endpointUrl: config.endpointUrl,
      temperature: config.temperature,
      hasApiKey: config.hasApiKey || resolveProviderApiKey(config.provider) !== null,
      rescueRecipesOn: config.rescueRecipesOn,
      updatedAt: config.updatedAt,
    };
  }
}
