import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AiRecipeGenerationOptionsResolver } from './AiRecipeGenerationOptionsResolver.js';
import { InMemoryAiConfigurationRepository } from '../../settings/repositories/InMemoryAiConfigurationRepository.js';
import { CredentialEncryptionService } from '../../security/CredentialEncryptionService.js';
import { AiConfiguration, AiConfigurationProps } from '../../../domain/settings/entities/AiConfiguration.js';

const MASTER_SECRET = 'test-master-secret-for-ai-resolver-000';

function config(overrides: Partial<AiConfigurationProps> = {}): AiConfiguration {
  return new AiConfiguration({
    id: 'ai-1',
    provider: 'GEMINI',
    modelName: 'gemini-2.5-flash',
    endpointUrl: null,
    encryptedApiKey: null,
    temperature: 0.1,
    rescueRecipesOn: true,
    ...overrides,
  });
}

describe('TK-125: AiRecipeGenerationOptionsResolver', () => {
  let repo: InMemoryAiConfigurationRepository;
  let encryption: CredentialEncryptionService;
  let resolver: AiRecipeGenerationOptionsResolver;

  beforeEach(() => {
    repo = new InMemoryAiConfigurationRepository();
    encryption = new CredentialEncryptionService(MASTER_SECRET);
    resolver = new AiRecipeGenerationOptionsResolver(repo, encryption);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('con provider HEURISTIC devuelve opciones sin credencial ni endpoint (fuerza motor local)', async () => {
    await repo.saveConfig(config({ provider: 'HEURISTIC', modelName: 'rules-engine' }));

    const options = await resolver.resolve();

    expect(options).toEqual({ modelName: 'rules-engine', temperature: 0.1, apiKey: null, endpointUrl: null });
  });

  it('con rescueRecipesOn=false devuelve opciones sin credencial aunque el provider sea remoto', async () => {
    await repo.saveConfig(config({ provider: 'GEMINI', rescueRecipesOn: false }));

    const options = await resolver.resolve();

    expect(options.apiKey).toBeNull();
    expect(options.endpointUrl).toBeNull();
  });

  it('descifra la API key almacenada para un provider remoto', async () => {
    const encrypted = encryption.encrypt('sk-real-gemini-key');
    await repo.saveConfig(config({ provider: 'GEMINI', encryptedApiKey: encrypted }));

    const options = await resolver.resolve();

    expect(options.apiKey).toBe('sk-real-gemini-key');
  });

  it('cae a la variable de entorno y registra un warn si el descifrado falla', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.stubEnv('GEMINI_API_KEY', 'env-fallback-key');
    await repo.saveConfig(config({ provider: 'GEMINI', encryptedApiKey: 'texto::corrupto::invalido' }));

    const options = await resolver.resolve();

    expect(options.apiKey).toBe('env-fallback-key');
    expect(warn).toHaveBeenCalledWith(
      '[recipes:rescue]',
      expect.stringContaining('apikey_decrypt_failed'),
      expect.anything()
    );
  });

  it('propaga endpointUrl para un provider OpenAI compatible', async () => {
    vi.stubEnv('OPENAI_API_KEY', '');
    await repo.saveConfig(
      config({ provider: 'OPENAI_COMPATIBLE', endpointUrl: 'http://ollama.local:11434/v1' })
    );

    const options = await resolver.resolve();

    expect(options.endpointUrl).toBe('http://ollama.local:11434/v1');
    expect(options.apiKey).toBeNull();
  });
});
