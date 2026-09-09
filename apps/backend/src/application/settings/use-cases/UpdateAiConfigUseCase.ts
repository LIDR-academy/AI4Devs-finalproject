import { IAiConfigurationRepository } from '../../../domain/settings/repositories/IAiConfigurationRepository.js';
import { AiConfiguration } from '../../../domain/settings/entities/AiConfiguration.js';
import { AiProviderType } from '../../../domain/settings/value-objects/AiProvider.js';
import { ICredentialCipher } from '../../../domain/settings/gateways/ICredentialCipher.js';
import { AiConfigDTO } from './GetAiConfigUseCase.js';
import { resolveProviderApiKey } from '../resolveProviderApiKey.js';

export interface UpdateAiConfigRequest {
  provider: AiProviderType;
  modelName: string;
  apiKey?: string | null;
  endpointUrl?: string | null;
  temperature: number;
  rescueRecipesOn?: boolean;
  updatedBy?: string | null;
}

export class UpdateAiConfigUseCase {
  constructor(
    private readonly repository: IAiConfigurationRepository,
    private readonly cipher: ICredentialCipher
  ) {}

  async execute(request: UpdateAiConfigRequest): Promise<AiConfigDTO> {
    const current = await this.repository.getConfig();

    let newEncryptedApiKey = current.encryptedApiKey;
    if (request.apiKey && request.apiKey.trim().length > 0) {
      newEncryptedApiKey = this.cipher.encrypt(request.apiKey.trim());
    }

    const updated = new AiConfiguration({
      id: current.id,
      provider: request.provider,
      modelName: request.modelName,
      endpointUrl: request.endpointUrl !== undefined ? request.endpointUrl : current.endpointUrl,
      encryptedApiKey: newEncryptedApiKey,
      temperature: request.temperature,
      rescueRecipesOn: request.rescueRecipesOn ?? current.rescueRecipesOn,
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
      hasApiKey: updated.hasApiKey || resolveProviderApiKey(updated.provider) !== null,
      rescueRecipesOn: updated.rescueRecipesOn,
      updatedAt: updated.updatedAt,
    };
  }
}
