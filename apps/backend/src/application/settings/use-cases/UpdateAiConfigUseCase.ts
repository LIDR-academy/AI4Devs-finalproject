import { IAiConfigurationRepository } from '../../../domain/settings/repositories/IAiConfigurationRepository.js';
import { AiConfiguration } from '../../../domain/settings/entities/AiConfiguration.js';
import { AiProviderType } from '../../../domain/settings/value-objects/AiProvider.js';
import { CredentialEncryptionService } from '../../../infrastructure/security/CredentialEncryptionService.js';
import { AiConfigDTO } from './GetAiConfigUseCase.js';

export interface UpdateAiConfigRequest {
  provider: AiProviderType;
  modelName: string;
  apiKey?: string | null;
  endpointUrl?: string | null;
  temperature: number;
  replenishmentOn?: boolean;
  rescueRecipesOn?: boolean;
  anomalyAuditOn?: boolean;
  updatedBy?: string | null;
}

export class UpdateAiConfigUseCase {
  constructor(
    private readonly repository: IAiConfigurationRepository,
    private readonly encryptionService: CredentialEncryptionService
  ) {}

  async execute(request: UpdateAiConfigRequest): Promise<AiConfigDTO> {
    const current = await this.repository.getConfig();

    let newEncryptedApiKey = current.encryptedApiKey;
    if (request.apiKey && request.apiKey.trim().length > 0) {
      newEncryptedApiKey = this.encryptionService.encrypt(request.apiKey.trim());
    }

    const updated = new AiConfiguration({
      id: current.id,
      provider: request.provider,
      modelName: request.modelName,
      endpointUrl: request.endpointUrl !== undefined ? request.endpointUrl : current.endpointUrl,
      encryptedApiKey: newEncryptedApiKey,
      temperature: request.temperature,
      replenishmentOn: request.replenishmentOn ?? current.replenishmentOn,
      rescueRecipesOn: request.rescueRecipesOn ?? current.rescueRecipesOn,
      anomalyAuditOn: request.anomalyAuditOn ?? current.anomalyAuditOn,
      updatedAt: new Date(),
      updatedBy: request.updatedBy,
    });

    await this.repository.saveConfig(updated);

    return {
      id: updated.id,
      provider: updated.provider,
      modelName: updated.modelName,
      endpointUrl: updated.endpointUrl,
      temperature: updated.temperature,
      hasApiKey: updated.hasApiKey || Boolean(process.env.AI_API_KEY && process.env.AI_API_KEY.trim().length > 0),
      replenishmentOn: updated.replenishmentOn,
      rescueRecipesOn: updated.rescueRecipesOn,
      anomalyAuditOn: updated.anomalyAuditOn,
      updatedAt: updated.updatedAt,
    };
  }
}
