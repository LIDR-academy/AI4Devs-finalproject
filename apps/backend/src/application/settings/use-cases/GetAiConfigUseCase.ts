import { IAiConfigurationRepository } from '../../../domain/settings/repositories/IAiConfigurationRepository.js';
import { AiProviderType } from '../../../domain/settings/value-objects/AiProvider.js';

export interface AiConfigDTO {
  id: string;
  provider: AiProviderType;
  modelName: string;
  endpointUrl?: string | null;
  temperature: number;
  hasApiKey: boolean;
  replenishmentOn: boolean;
  rescueRecipesOn: boolean;
  anomalyAuditOn: boolean;
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
      hasApiKey: config.hasApiKey || Boolean(process.env.AI_API_KEY && process.env.AI_API_KEY.trim().length > 0),
      replenishmentOn: config.replenishmentOn,
      rescueRecipesOn: config.rescueRecipesOn,
      anomalyAuditOn: config.anomalyAuditOn,
      updatedAt: config.updatedAt,
    };
  }
}
