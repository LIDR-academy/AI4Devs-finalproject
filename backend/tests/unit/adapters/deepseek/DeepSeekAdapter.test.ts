import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('node-fetch', () => ({
  default: vi.fn(),
}));

import fetch from 'node-fetch';
const mockFetch = vi.mocked(fetch);

interface MockResponse {
  ok: boolean;
  status?: number;
  json: () => Promise<unknown>;
  text?: () => Promise<string>;
}

function successResponse(content: string): MockResponse {
  return { ok: true, json: async () => ({ choices: [{ message: { content } }] }) };
}

function errorResponse(status: number, body: string): MockResponse {
  return { ok: false, status, json: async () => ({}), text: async () => body };
}

const VALID_LLM_JSON = JSON.stringify({
  transparencyScore: 62,
  scoreLabel: 'media',
  redFlags: [
    { flag: 'vague_location', severity: 'medium', reasoning: 'Solo menciona "zona centro". Ubicación imprecisa.' },
  ],
  omissions: ['No menciona certificado energético'],
  positiveSignals: [],
  summary: 'Anuncio con poca información.',
});

describe('DeepSeekAdapter', () => {
  const origEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    mockFetch.mockReset();
    process.env = {
      ...origEnv,
      NODE_ENV: 'development',
      MOCK_OPENROUTER: '',
      DEEPSEEK_API_KEY: 'sk-test-key-deepseek-1234567890',
      DEEPSEEK_MODEL: 'deepseek-chat',
      LOG_LEVEL: 'error',
      DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
    };
  });

  afterEach(() => {
    process.env = { ...origEnv };
    vi.restoreAllMocks();
  });

  async function importAdapter() {
    const { DeepSeekAdapter } = await import(
      '../../../../src/adapters/deepseek/DeepSeekAdapter'
    );
    return new DeepSeekAdapter();
  }

  describe('canned response (mock mode)', () => {
    it('returns canned response when MOCK_OPENROUTER=true', async () => {
      process.env.MOCK_OPENROUTER = 'true';
      const adapter = await importAdapter();
      const result = await adapter.analyze('Piso acogedor', 'https://x.com');
      expect(result.transparencyScore.value).toBe(60);
      expect(result.redFlags.items.map((f: { flag: string }) => f.flag)).toContain('euphemistic_language');
    });
  });

  describe('real LLM flow (mocked fetch)', () => {
    it('envía request a api.deepseek.com con formato correcto', async () => {
      mockFetch.mockResolvedValue(successResponse(VALID_LLM_JSON) as never);
      const adapter = await importAdapter();
      await adapter.analyze('Piso en zona centro', 'https://x.com');

      const call = mockFetch.mock.calls[0]!;
      expect(call[0]).toBe('https://api.deepseek.com/v1/chat/completions');
      const init = call[1] as Record<string, Record<string, string>>;
      expect(init.headers?.Authorization).toMatch(/^Bearer /);
      expect(init.body).toContain('deepseek-chat');
    });

    it('parsea respuesta LLM válida correctamente', async () => {
      mockFetch.mockResolvedValue(successResponse(JSON.stringify({
        transparencyScore: 82,
        scoreLabel: 'alta',
        redFlags: [
          { flag: 'missing_energy_certificate', severity: 'high', reasoning: 'No hay certificado energético en el anuncio.' },
        ],
        omissions: ['Sin referencia al CEE'],
        positiveSignals: ['Incluye plano'],
        summary: 'Anuncio bastante completo pero sin CEE.',
      })) as never);

      const adapter = await importAdapter();
      const result = await adapter.analyze('Piso reformado, 90m², 3 hab', 'https://x.com');

      expect(result.transparencyScore.value).toBe(82);
      expect(result.redFlags.count).toBe(1);
      expect(result.redFlags.items[0].flag).toBe('missing_energy_certificate');
      expect(result.positiveSignals).toContain('Incluye plano');
    });

    it('lanza LlmMalformedResponseError tras agotar reintentos con respuesta inválida', async () => {
      mockFetch.mockResolvedValue(successResponse('esto no es json') as never);

      const adapter = await importAdapter();
      await expect(adapter.analyze('test', 'https://x.com')).rejects.toThrow('no devolvió una respuesta válida');
    });

    it('lanza error si DeepSeek devuelve HTTP error', async () => {
      mockFetch.mockResolvedValue(errorResponse(401, '{"error": "invalid api key"}') as never);

      const adapter = await importAdapter();
      await expect(adapter.analyze('test', 'https://x.com')).rejects.toThrow('no devolvió una respuesta válida');
    });

    it('strips markdown code blocks del LLM', async () => {
      const wrapped = '```json\n' + JSON.stringify({
        transparencyScore: 90, scoreLabel: 'excelente', redFlags: [], omissions: [], positiveSignals: [], summary: 'ok',
      }) + '\n```';
      mockFetch.mockResolvedValue(successResponse(wrapped) as never);

      const adapter = await importAdapter();
      const result = await adapter.analyze('Ático excelente', 'https://x.com');
      expect(result.transparencyScore.value).toBe(90);
    });
  });
});
