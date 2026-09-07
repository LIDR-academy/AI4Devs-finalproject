import { AiProviderType, isValidAiProvider } from '../value-objects/AiProvider.js';

export interface AiConfigurationProps {
  id: string;
  provider: AiProviderType;
  modelName: string;
  endpointUrl?: string | null;
  encryptedApiKey?: string | null;
  temperature: number;
  /** Único módulo cognitivo implementado (TK-129 quitó replenishmentOn / anomalyAuditOn, inertes). */
  rescueRecipesOn: boolean;
  updatedAt?: Date;
  updatedBy?: string | null;
}

export class AiConfiguration {
  constructor(private readonly props: AiConfigurationProps) {
    if (!isValidAiProvider(props.provider)) {
      throw new Error(`Proveedor de IA no válido: ${props.provider}`);
    }
    if (props.temperature < 0 || props.temperature > 0.2) {
      throw new Error(`La temperatura de inferencia debe estar entre 0.0 y 0.2 para garantizar determinismo (Guard 9). Valor recibido: ${props.temperature}`);
    }
  }

  static createDefault(): AiConfiguration {
    return new AiConfiguration({
      id: 'default',
      provider: 'HEURISTIC',
      modelName: 'gemini-2.5-flash',
      endpointUrl: null,
      encryptedApiKey: null,
      temperature: 0.0,
      rescueRecipesOn: true,
    });
  }

  get id(): string {
    return this.props.id;
  }

  get provider(): AiProviderType {
    return this.props.provider;
  }

  get modelName(): string {
    return this.props.modelName;
  }

  get endpointUrl(): string | null | undefined {
    return this.props.endpointUrl;
  }

  get encryptedApiKey(): string | null | undefined {
    return this.props.encryptedApiKey;
  }

  get temperature(): number {
    return this.props.temperature;
  }

  get rescueRecipesOn(): boolean {
    return this.props.rescueRecipesOn;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  get updatedBy(): string | null | undefined {
    return this.props.updatedBy;
  }

  get hasApiKey(): boolean {
    return Boolean(this.props.encryptedApiKey && this.props.encryptedApiKey.trim().length > 0);
  }
}
