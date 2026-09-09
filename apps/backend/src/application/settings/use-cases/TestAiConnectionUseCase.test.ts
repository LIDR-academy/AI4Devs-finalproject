import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestAiConnectionUseCase } from './TestAiConnectionUseCase.js';
import { InMemoryAiConfigurationRepository } from '../../../infrastructure/settings/repositories/InMemoryAiConfigurationRepository.js';
import { CredentialEncryptionService } from '../../../infrastructure/security/CredentialEncryptionService.js';
import { AiConfiguration, AiConfigurationProps } from '../../../domain/settings/entities/AiConfiguration.js';

const SECRET = 'test-secret-key-32-chars-long!!!!';

function config(overrides: Partial<AiConfigurationProps> = {}): AiConfiguration {
  return new AiConfiguration({
    id: 'default',
    provider: 'GEMINI',
    modelName: 'gemini-2.5-flash',
    endpointUrl: null,
    encryptedApiKey: null,
    temperature: 0.0,
    rescueRecipesOn: true,
    ...overrides,
  });
}

describe('TK-129: TestAiConnectionUseCase', () => {
  let repo: InMemoryAiConfigurationRepository;
  let cipher: CredentialEncryptionService;
  let useCase: TestAiConnectionUseCase;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    repo = new InMemoryAiConfigurationRepository();
    cipher = new CredentialEncryptionService(SECRET);
    useCase = new TestAiConnectionUseCase(repo, cipher);
    fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, statusText: 'OK' } as Response);
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('HEURISTIC responde éxito sin tocar la red', async () => {
    await repo.saveConfig(config({ provider: 'HEURISTIC' }));
    const res = await useCase.execute();
    expect(res.success).toBe(true);
    expect(res.message).toContain('Motor Heurístico Local');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('GEMINI sin clave (ni config ni env) reporta falta de API key sin llamar a la red', async () => {
    vi.stubEnv('GEMINI_API_KEY', '');
    await repo.saveConfig(config({ provider: 'GEMINI', encryptedApiKey: null }));
    const res = await useCase.execute();
    expect(res.success).toBe(false);
    expect(res.message).toContain('No hay ninguna API Key');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('GEMINI con clave cifrada: sonda con header x-goog-api-key y URL sin key=', async () => {
    await repo.saveConfig(config({ provider: 'GEMINI', encryptedApiKey: cipher.encrypt('sk-real') }));
    const res = await useCase.execute();

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://generativelanguage.googleapis.com/v1beta/models');
    expect(url).not.toContain('key=');
    expect((init.headers as Record<string, string>)['x-goog-api-key']).toBe('sk-real');
    expect(init.method).toBe('GET');
    expect(res.success).toBe(true);
    expect(res.message).toContain('Conexión exitosa');
  });

  it('GEMINI toma la clave de GEMINI_API_KEY si la config no la tiene', async () => {
    vi.stubEnv('GEMINI_API_KEY', 'sk-from-env');
    await repo.saveConfig(config({ provider: 'GEMINI', encryptedApiKey: null }));
    await useCase.execute();
    expect((fetchMock.mock.calls[0][1].headers as Record<string, string>)['x-goog-api-key']).toBe('sk-from-env');
  });

  it('GEMINI con texto cifrado corrupto: el descifrado falla, la clave queda vacía y se reporta falta de API key', async () => {
    // Comportamiento preexistente: resolveApiKey solo consulta la env var cuando NO hay
    // encryptedApiKey; un descifrado fallido devuelve '' (no cae a env). El recipe
    // resolver sí cae a env — inconsistencia documentada en AUDIT-DEV-013 O-1.
    vi.stubEnv('GEMINI_API_KEY', 'sk-fallback');
    await repo.saveConfig(config({ provider: 'GEMINI', encryptedApiKey: 'basura::no::valida' }));
    const res = await useCase.execute();
    expect(res.success).toBe(false);
    expect(res.message).toContain('No hay ninguna API Key');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('OPENAI_COMPATIBLE usa Authorization Bearer y el endpointUrl configurado (normaliza barra final)', async () => {
    vi.stubEnv('OPENAI_API_KEY', 'sk-openai');
    await repo.saveConfig(config({ provider: 'OPENAI_COMPATIBLE', endpointUrl: 'https://ollama.local/v1/', encryptedApiKey: null }));
    await useCase.execute();

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://ollama.local/v1/models');
    expect((init.headers as Record<string, string>)['Authorization']).toBe('Bearer sk-openai');
  });

  it('OPENAI_COMPATIBLE sin clave igualmente sondea (no hay early-return de "sin key" para no-GEMINI)', async () => {
    vi.stubEnv('OPENAI_API_KEY', '');
    await repo.saveConfig(config({ provider: 'OPENAI_COMPATIBLE', endpointUrl: null, encryptedApiKey: null }));
    await useCase.execute();
    expect(fetchMock.mock.calls[0][0]).toBe('http://localhost:11434/v1/models');
    expect((fetchMock.mock.calls[0][1].headers as Record<string, string>)['Authorization']).toBeUndefined();
  });

  it('respuesta HTTP no-ok reporta el código', async () => {
    await repo.saveConfig(config({ provider: 'GEMINI', encryptedApiKey: cipher.encrypt('k') }));
    fetchMock.mockResolvedValueOnce({ ok: false, status: 401, statusText: 'Unauthorized' } as Response);
    const res = await useCase.execute();
    expect(res.success).toBe(false);
    expect(res.message).toContain('HTTP 401');
  });

  it('error de red genérico', async () => {
    await repo.saveConfig(config({ provider: 'GEMINI', encryptedApiKey: cipher.encrypt('k') }));
    fetchMock.mockRejectedValueOnce(new Error('ECONNREFUSED'));
    const res = await useCase.execute();
    expect(res.success).toBe(false);
    expect(res.message).toContain('Error de red al conectar');
  });

  it('timeout (AbortError) devuelve el mensaje de tiempo agotado', async () => {
    await repo.saveConfig(config({ provider: 'GEMINI', encryptedApiKey: cipher.encrypt('k') }));
    const abort = new Error('aborted');
    abort.name = 'AbortError';
    fetchMock.mockRejectedValueOnce(abort);
    const res = await useCase.execute();
    expect(res.success).toBe(false);
    expect(res.message).toContain('Tiempo de espera agotado');
  });
});
