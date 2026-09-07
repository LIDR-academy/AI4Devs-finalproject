import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { InMemoryAiConfigurationRepository } from '../../../infrastructure/settings/repositories/InMemoryAiConfigurationRepository.js';
import { CredentialEncryptionService } from '../../../infrastructure/security/CredentialEncryptionService.js';
import { GetAiConfigUseCase } from './GetAiConfigUseCase.js';
import { UpdateAiConfigUseCase } from './UpdateAiConfigUseCase.js';
import { AiConfiguration } from '../../../domain/settings/entities/AiConfiguration.js';

describe('TK-129: AI Settings Use Cases (Get / Update)', () => {
  let repo: InMemoryAiConfigurationRepository;
  let cipher: CredentialEncryptionService;
  let getUseCase: GetAiConfigUseCase;
  let updateUseCase: UpdateAiConfigUseCase;

  beforeEach(() => {
    repo = new InMemoryAiConfigurationRepository();
    cipher = new CredentialEncryptionService('test-secret-key-32-chars-long!!!');
    getUseCase = new GetAiConfigUseCase(repo);
    updateUseCase = new UpdateAiConfigUseCase(repo, cipher);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('Get: configuración por defecto — HEURISTIC, sin API key', async () => {
    vi.stubEnv('OPENAI_API_KEY', '');
    const config = await getUseCase.execute();
    expect(config.provider).toBe('HEURISTIC');
    expect(config.temperature).toBe(0.0);
    expect(config.hasApiKey).toBe(false);
    expect(config.rescueRecipesOn).toBe(true);
  });

  it('Get: hasApiKey true si hay clave cifrada almacenada', async () => {
    await repo.saveConfig(
      new AiConfiguration({
        id: 'default',
        provider: 'GEMINI',
        modelName: 'gemini-2.5-flash',
        encryptedApiKey: cipher.encrypt('sk-stored'),
        temperature: 0.0,
        rescueRecipesOn: true,
      })
    );
    expect((await getUseCase.execute()).hasApiKey).toBe(true);
  });

  it('Get: hasApiKey true si no hay clave almacenada pero sí en la env var del proveedor', async () => {
    vi.stubEnv('GEMINI_API_KEY', 'sk-env');
    await repo.saveConfig(
      new AiConfiguration({
        id: 'default',
        provider: 'GEMINI',
        modelName: 'gemini-2.5-flash',
        encryptedApiKey: null,
        temperature: 0.0,
        rescueRecipesOn: true,
      })
    );
    expect((await getUseCase.execute()).hasApiKey).toBe(true);
  });

  it('Update: cifra la nueva API key y nunca devuelve el texto plano', async () => {
    vi.stubEnv('GEMINI_API_KEY', '');
    const updated = await updateUseCase.execute({
      provider: 'GEMINI',
      modelName: 'gemini-2.5-flash',
      apiKey: 'test-gemini-key',
      temperature: 0.1,
      rescueRecipesOn: false,
    });

    expect(updated.provider).toBe('GEMINI');
    expect(updated.hasApiKey).toBe(true);
    expect(updated.rescueRecipesOn).toBe(false);
    expect('apiKey' in updated).toBe(false);

    const raw = await repo.getConfig();
    expect(raw.encryptedApiKey).not.toBe('test-gemini-key');
    expect(cipher.decrypt(raw.encryptedApiKey!)).toBe('test-gemini-key');
  });

  it('Update: conserva la clave existente si no se envía apiKey', async () => {
    const encrypted = cipher.encrypt('sk-keep');
    await repo.saveConfig(
      new AiConfiguration({ id: 'default', provider: 'GEMINI', modelName: 'm', encryptedApiKey: encrypted, temperature: 0.0, rescueRecipesOn: true })
    );

    await updateUseCase.execute({ provider: 'GEMINI', modelName: 'gemini-3', temperature: 0.2 });

    const raw = await repo.getConfig();
    expect(raw.encryptedApiKey).toBe(encrypted);
    expect(raw.modelName).toBe('gemini-3');
  });

  it('Update: aplica endpointUrl y conserva rescueRecipesOn actual cuando no se envía', async () => {
    await repo.saveConfig(
      new AiConfiguration({ id: 'default', provider: 'HEURISTIC', modelName: 'm', temperature: 0.0, rescueRecipesOn: false })
    );

    const updated = await updateUseCase.execute({
      provider: 'OPENAI_COMPATIBLE',
      modelName: 'llama3:8b',
      endpointUrl: 'http://ollama:11434/v1',
      temperature: 0.0,
    });

    expect(updated.rescueRecipesOn).toBe(false);
    expect((await repo.getConfig()).endpointUrl).toBe('http://ollama:11434/v1');
  });

  it('Update: conserva el endpointUrl actual si el request no lo trae (undefined)', async () => {
    await repo.saveConfig(
      new AiConfiguration({
        id: 'default',
        provider: 'OPENAI_COMPATIBLE',
        modelName: 'm',
        endpointUrl: 'http://previo:11434/v1',
        temperature: 0.0,
        rescueRecipesOn: true,
      })
    );

    await updateUseCase.execute({ provider: 'OPENAI_COMPATIBLE', modelName: 'm2', temperature: 0.1 });

    expect((await repo.getConfig()).endpointUrl).toBe('http://previo:11434/v1');
  });

  it('Update: endpointUrl null explícito borra el valor previo', async () => {
    await repo.saveConfig(
      new AiConfiguration({
        id: 'default',
        provider: 'OPENAI_COMPATIBLE',
        modelName: 'm',
        endpointUrl: 'http://previo:11434/v1',
        temperature: 0.0,
        rescueRecipesOn: true,
      })
    );

    await updateUseCase.execute({ provider: 'GEMINI', modelName: 'g', endpointUrl: null, temperature: 0.1 });

    expect((await repo.getConfig()).endpointUrl).toBeNull();
  });

  it('Update: rescueRecipesOn=true explícito sobrescribe el false actual', async () => {
    await repo.saveConfig(
      new AiConfiguration({ id: 'default', provider: 'HEURISTIC', modelName: 'm', temperature: 0.0, rescueRecipesOn: false })
    );

    const updated = await updateUseCase.execute({
      provider: 'HEURISTIC',
      modelName: 'm',
      temperature: 0.0,
      rescueRecipesOn: true,
    });

    expect(updated.rescueRecipesOn).toBe(true);
  });

  it('Update: hasApiKey refleja la env var cuando no hay clave almacenada', async () => {
    vi.stubEnv('GEMINI_API_KEY', 'sk-env-present');
    const updated = await updateUseCase.execute({
      provider: 'GEMINI',
      modelName: 'gemini-2.5-flash',
      temperature: 0.1,
    });
    expect(updated.hasApiKey).toBe(true);
  });

  it('Update: devuelve updatedAt como fecha reciente', async () => {
    const before = Date.now();
    const updated = await updateUseCase.execute({ provider: 'HEURISTIC', modelName: 'm', temperature: 0.0 });
    expect(updated.updatedAt).toBeInstanceOf(Date);
    expect(updated.updatedAt!.getTime()).toBeGreaterThanOrEqual(before);
  });
});
