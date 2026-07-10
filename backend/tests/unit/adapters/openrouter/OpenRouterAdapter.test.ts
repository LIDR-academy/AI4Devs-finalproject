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

function slowResponse(content: string, delayMs: number, signal: AbortSignal | undefined): Promise<MockResponse> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('The operation was aborted.', 'AbortError'));
      return;
    }
    const t = setTimeout(() => resolve(successResponse(content)), delayMs);
    signal?.addEventListener('abort', () => {
      clearTimeout(t);
      reject(new DOMException('The operation was aborted.', 'AbortError'));
    });
  });
}

const VALID_LLM_JSON = JSON.stringify({
  transparencyScore: 65,
  scoreLabel: 'media',
  redFlags: [
    {
      flag: 'euphemistic_language',
      severity: 'medium',
      reasoning: 'El anuncio usa "acogedor" sin describir el espacio real del piso.',
    },
  ],
  omissions: ['Certificado energético no mencionado'],
  positiveSignals: [],
  summary: 'Anuncio con lenguaje eufemístico y omisiones relevantes.',
});

describe('OpenRouterAdapter', () => {
  const origEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    mockFetch.mockReset();
    process.env = {
      ...origEnv,
      NODE_ENV: 'development',
      MOCK_OPENROUTER: '',
      OPENROUTER_API_KEY: 'sk-or-v1-test-key-1234567890',
      OPENROUTER_MODEL: 'anthropic/claude-3.5-sonnet',
      FRONTEND_URL: 'http://localhost:5173',
      LOG_LEVEL: 'error',
      DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
    };
  });

  afterEach(() => {
    process.env = { ...origEnv };
    vi.restoreAllMocks();
  });

  async function importAdapter() {
    const { OpenRouterAdapter } = await import(
      '../../../../src/adapters/openrouter/OpenRouterAdapter'
    );
    return new OpenRouterAdapter();
  }

  describe('canned response (test/mock mode)', () => {
    it('returns canned response when MOCK_OPENROUTER=true', async () => {
      process.env.MOCK_OPENROUTER = 'true';
      const adapter = await importAdapter();
      const result = await adapter.analyze('Piso acogedor sin ascensor', 'https://idealista.com/123');
      expect(result.transparencyScore.value).toBe(60);
      expect(result.redFlags.items).toHaveLength(2);
      expect(result.redFlags.items[0].flag).toBe('euphemistic_language');
    });

    it('canned response detects missing energy certificate', async () => {
      process.env.MOCK_OPENROUTER = 'true';
      const adapter = await importAdapter();
      const result = await adapter.analyze('Piso acogedor', 'https://idealista.com/123');
      const energyFlag = result.redFlags.items.find((f) => f.flag === 'missing_energy_certificate');
      expect(energyFlag).toBeDefined();
    });
  });

  describe('real LLM flow (mocked node-fetch)', () => {
    it('parses valid JSON from LLM', async () => {
      mockFetch.mockResolvedValue(successResponse(VALID_LLM_JSON) as never);
      const adapter = await importAdapter();
      const result = await adapter.analyze('Piso acogedor', 'https://idealista.com/123');
      expect(result.transparencyScore.value).toBe(65);
      expect(result.redFlags.items).toHaveLength(1);
      expect(result.summary).toContain('eufemístico');
    });

    it('strips markdown code blocks before parsing', async () => {
      const wrapped = '```json\n' + VALID_LLM_JSON + '\n```';
      mockFetch.mockResolvedValue(successResponse(wrapped) as never);
      const adapter = await importAdapter();
      const result = await adapter.analyze('Piso acogedor', 'https://idealista.com/123');
      expect(result.transparencyScore.value).toBe(65);
    });

    it('strips bare code blocks (no language tag)', async () => {
      const wrapped = '```\n' + VALID_LLM_JSON + '\n```';
      mockFetch.mockResolvedValue(successResponse(wrapped) as never);
      const adapter = await importAdapter();
      const result = await adapter.analyze('Piso acogedor', 'https://idealista.com/123');
      expect(result.transparencyScore.value).toBe(65);
    });

    it('retries on malformed JSON and succeeds on second attempt', async () => {
      let callCount = 0;
      mockFetch.mockImplementation(async () => {
        callCount++;
        return successResponse(callCount === 1 ? 'not json' : VALID_LLM_JSON) as never;
      });
      const adapter = await importAdapter();
      const result = await adapter.analyze('Piso acogedor', 'https://idealista.com/123');
      expect(result.transparencyScore.value).toBe(65);
      expect(callCount).toBe(2);
    });

    it('throws LlmMalformedResponseError after all retries fail', async () => {
      mockFetch.mockResolvedValue(successResponse('totally invalid') as never);
      const adapter = await importAdapter();
      const { LlmMalformedResponseError } = await import(
        '../../../../src/domain/errors/DomainError'
      );
      await expect(adapter.analyze('test', 'https://idealista.com/123')).rejects.toThrow(
        LlmMalformedResponseError,
      );
    });

    it('throws LlmMalformedResponseError when JSON does not match schema', async () => {
      const badSchema = JSON.stringify({ transparencyScore: 'not_a_number' });
      mockFetch.mockResolvedValue(successResponse(badSchema) as never);
      const adapter = await importAdapter();
      const { LlmMalformedResponseError } = await import(
        '../../../../src/domain/errors/DomainError'
      );
      await expect(adapter.analyze('test', 'https://idealista.com/123')).rejects.toThrow(
        LlmMalformedResponseError,
      );
    });

    it('retries on HTTP error and throws after exhausting retries', async () => {
      mockFetch.mockResolvedValue(errorResponse(500, 'Internal Server Error') as never);
      const adapter = await importAdapter();
      const { LlmMalformedResponseError } = await import(
        '../../../../src/domain/errors/DomainError'
      );
      await expect(adapter.analyze('test', 'https://idealista.com/123')).rejects.toThrow(
        LlmMalformedResponseError,
      );
    });

    it('handles empty content from OpenRouter gracefully', async () => {
      mockFetch.mockResolvedValue(successResponse('') as never);
      const adapter = await importAdapter();
      const { LlmMalformedResponseError } = await import(
        '../../../../src/domain/errors/DomainError'
      );
      await expect(adapter.analyze('test', 'https://idealista.com/123')).rejects.toThrow(
        LlmMalformedResponseError,
      );
    });

    it('waits for slow LLM response (does not abort before body arrives)', async () => {
      // Simulates a slow LLM (reasoning model, large response) that takes 15s
      // to deliver the body. The adapter must wait — not abort at the old 12s
      // timeout. With RED (12s): all 3 retries abort → 36s → throws. With
      // GREEN (30s): first attempt succeeds in 15s.
      mockFetch.mockImplementation((async (_url: unknown, opts: { signal?: AbortSignal } = {}) =>
        slowResponse(VALID_LLM_JSON, 15_000, opts.signal)) as never);
      const adapter = await importAdapter();
      const result = await adapter.analyze('Piso test', 'https://idealista.com/123');
      expect(result.transparencyScore.value).toBe(65);
    }, 45_000);

    it('sends reasoning: { effort: "none" } to disable costly reasoning mode', async () => {
      // deepseek/deepseek-v4-flash auto-enables reasoning (700+ tokens before
      // JSON) which inflates cost and aborts the timeout. The adapter must
      // explicitly disable reasoning on every request.
      let sentBody: Record<string, unknown> | null = null;
      mockFetch.mockImplementation((async (_url: unknown, opts: { body?: string; signal?: AbortSignal } = {}) => {
        const body = JSON.parse(opts.body ?? '{}') as Record<string, unknown>;
        sentBody = body;
        return slowResponse(VALID_LLM_JSON, 0, opts.signal);
      }) as never);
      const adapter = await importAdapter();
      await adapter.analyze('Piso test', 'https://idealista.com/123');
      expect(sentBody).not.toBeNull();
      expect(sentBody!.reasoning).toEqual({ effort: 'none' });
    });
  });
});
