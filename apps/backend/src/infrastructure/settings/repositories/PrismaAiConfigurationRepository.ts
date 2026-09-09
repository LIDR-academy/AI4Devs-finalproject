import { PrismaClient } from '../../../generated/prisma/client.js';
import { IAiConfigurationRepository } from '../../../domain/settings/repositories/IAiConfigurationRepository.js';
import { AiConfiguration } from '../../../domain/settings/entities/AiConfiguration.js';
import { AiProviderType } from '../../../domain/settings/value-objects/AiProvider.js';

interface AiConfigurationRecord {
  id: string;
  provider: string;
  modelName: string;
  endpointUrl?: string | null;
  encryptedApiKey?: string | null;
  temperature: number | { toString(): string };
  rescueRecipesOn: boolean;
  updatedAt?: Date;
  updatedBy?: string | null;
}

interface AiConfigurationDelegate {
  findUnique(args: { where: { id: string } }): Promise<AiConfigurationRecord | null>;
  create(args: { data: Record<string, unknown> }): Promise<AiConfigurationRecord>;
  upsert(args: { where: { id: string }; create: Record<string, unknown>; update: Record<string, unknown> }): Promise<AiConfigurationRecord>;
}

export class PrismaAiConfigurationRepository implements IAiConfigurationRepository {
  private readonly delegate: AiConfigurationDelegate;

  constructor(prisma: PrismaClient) {
    this.delegate = (prisma as unknown as { aiConfiguration: AiConfigurationDelegate }).aiConfiguration;
  }

  async getConfig(): Promise<AiConfiguration> {
    let c = await this.delegate.findUnique({ where: { id: 'default' } });
    if (!c) {
      c = await this.delegate.create({
        data: {
          id: 'default',
          provider: 'HEURISTIC',
          modelName: 'gemini-2.5-flash',
          endpointUrl: null,
          encryptedApiKey: null,
          temperature: 0.0,
          rescueRecipesOn: true,
        },
      });
    }

    return new AiConfiguration({
      id: c.id,
      provider: c.provider as AiProviderType,
      modelName: c.modelName,
      endpointUrl: c.endpointUrl,
      encryptedApiKey: c.encryptedApiKey,
      temperature: Number(c.temperature),
      rescueRecipesOn: c.rescueRecipesOn,
      updatedAt: c.updatedAt,
      updatedBy: c.updatedBy,
    });
  }

  async saveConfig(config: AiConfiguration): Promise<void> {
    const fields = {
      provider: config.provider,
      modelName: config.modelName,
      endpointUrl: config.endpointUrl,
      encryptedApiKey: config.encryptedApiKey,
      temperature: config.temperature,
      rescueRecipesOn: config.rescueRecipesOn,
      updatedBy: config.updatedBy,
    };

    await this.delegate.upsert({
      where: { id: 'default' },
      create: { id: 'default', ...fields },
      update: fields,
    });
  }
}
