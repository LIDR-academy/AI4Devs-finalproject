import { IAiConfigurationRepository } from '../../../domain/settings/repositories/IAiConfigurationRepository.js';
import { IAiRecipeGenerationOptionsResolver } from '../../../domain/recipes/gateways/IAiRecipeGenerationOptionsResolver.js';
import { RecipeGenerationOptions } from '../../../domain/recipes/gateways/IAiRecipeGeneratorGateway.js';
import { CredentialEncryptionService } from '../../security/CredentialEncryptionService.js';

/**
 * Resuelve `RecipeGenerationOptions` desde la `AiConfiguration` persistida
 * (TK-125 / AUDIT-DEV-007 F-2/F-13). Dueño del descifrado de la API key, del
 * fallback a variable de entorno y del logging estructurado de un fallo de
 * descifrado — todo lo que antes vivía dentro del caso de uso de aplicación.
 */
export class AiRecipeGenerationOptionsResolver implements IAiRecipeGenerationOptionsResolver {
  constructor(
    private readonly aiConfigRepo: IAiConfigurationRepository,
    private readonly encryptionService: CredentialEncryptionService = new CredentialEncryptionService()
  ) {}

  async resolve(): Promise<RecipeGenerationOptions> {
    const config = await this.aiConfigRepo.getConfig();
    const base = { modelName: config.modelName, temperature: config.temperature };

    // Proveedor heurístico o rescate desactivado ⇒ sin credencial ni endpoint: el
    // gateway de generación caerá al motor heurístico local.
    if (config.provider === 'HEURISTIC' || !config.rescueRecipesOn) {
      return { ...base, apiKey: null, endpointUrl: null };
    }

    return {
      ...base,
      apiKey: this.resolveApiKey(config.encryptedApiKey ?? null, config.provider),
      endpointUrl: config.endpointUrl ?? null,
    };
  }

  private resolveApiKey(encryptedKey: string | null, provider: string): string | null {
    if (encryptedKey) {
      try {
        return this.encryptionService.decrypt(encryptedKey);
      } catch (err) {
        console.warn(
          '[recipes:rescue]',
          JSON.stringify({ event: 'apikey_decrypt_failed', provider }),
          err instanceof Error ? err.message : String(err)
        );
      }
    }
    return provider === 'GEMINI'
      ? process.env.GEMINI_API_KEY || null
      : process.env.OPENAI_API_KEY || null;
  }
}
