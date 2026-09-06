import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryAiConfigurationRepository } from '../../../infrastructure/settings/repositories/InMemoryAiConfigurationRepository.js';
import { CredentialEncryptionService } from '../../../infrastructure/security/CredentialEncryptionService.js';
import { GetAiConfigUseCase } from './GetAiConfigUseCase.js';
import { UpdateAiConfigUseCase } from './UpdateAiConfigUseCase.js';
import { TestAiConnectionUseCase } from './TestAiConnectionUseCase.js';
import { AiConfiguration } from '../../../domain/settings/entities/AiConfiguration.js';

describe('AI Settings Use Cases', () => {
  let repo: InMemoryAiConfigurationRepository;
  let encryptionService: CredentialEncryptionService;
  let getUseCase: GetAiConfigUseCase;
  let updateUseCase: UpdateAiConfigUseCase;
  let testUseCase: TestAiConnectionUseCase;

  beforeEach(() => {
    repo = new InMemoryAiConfigurationRepository();
    encryptionService = new CredentialEncryptionService('test-secret-key-32-chars-long!!!');
    getUseCase = new GetAiConfigUseCase(repo);
    updateUseCase = new UpdateAiConfigUseCase(repo, encryptionService);
    testUseCase = new TestAiConnectionUseCase(repo, encryptionService);
  });

  it('GetAiConfigUseCase returns default configuration with masked key', async () => {
    const config = await getUseCase.execute();

    expect(config.provider).toBe('HEURISTIC');
    expect(config.temperature).toBe(0.0);
    expect(config.hasApiKey).toBe(false);
  });

  it('UpdateAiConfigUseCase encrypts API key and updates configuration', async () => {
    const updated = await updateUseCase.execute({
      provider: 'GEMINI',
      modelName: 'gemini-2.5-flash',
      apiKey: 'test-gemini-key',
      temperature: 0.1,
      replenishmentOn: true,
      rescueRecipesOn: true,
      anomalyAuditOn: true,
    });

    expect(updated.provider).toBe('GEMINI');
    expect(updated.hasApiKey).toBe(true);
    expect(updated.anomalyAuditOn).toBe(true);
    expect('apiKey' in updated).toBe(false); // Should not return plaintext key

    const rawStored = await repo.getConfig();
    expect(rawStored.encryptedApiKey).not.toBe('test-gemini-key');
    expect(rawStored.encryptedApiKey).toContain(':');
    expect(encryptionService.decrypt(rawStored.encryptedApiKey!)).toBe('test-gemini-key');
  });

  it('TestAiConnectionUseCase handles HEURISTIC provider without network', async () => {
    const result = await testUseCase.execute();

    expect(result.success).toBe(true);
    expect(result.message).toContain('Motor Heurístico Local');
    expect(result.latencyMs).toBeGreaterThanOrEqual(0);
  });

  it('TestAiConnectionUseCase reports missing API key when GEMINI has no key', async () => {
    await repo.saveConfig(
      new AiConfiguration({
        id: 'default',
        provider: 'GEMINI',
        modelName: 'gemini-2.5-flash',
        temperature: 0.0,
        replenishmentOn: true,
        rescueRecipesOn: true,
        anomalyAuditOn: false,
      })
    );

    const result = await testUseCase.execute();
    expect(result.success).toBe(false);
    expect(result.message).toContain('No hay ninguna API Key configurada');
  });
});
