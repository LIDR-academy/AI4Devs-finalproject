import { afterEach, describe, expect, it, vi } from 'vitest';

describe('commercial OpenAI agent', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('uses deterministic fallback when OPENAI_API_KEY is not configured', async () => {
    vi.stubEnv('OPENAI_API_KEY', '');
    vi.resetModules();

    const { decideCommercialAction } = await import('../src/ai/commercialAgent.js');
    const decision = await decideCommercialAction({
      incomingMessage: 'Quiero comprar AUD-BT-001',
      conversation: {
        id: 1,
        status: 'open',
        leadName: 'Jean Forero',
        leadPhone: '+573132556327',
        currentProductSku: 'AUD-BT-001',
        currentProductName: 'Audifonos bluetooth',
        latestNegotiation: null,
        latestOrder: null,
        recentMessages: []
      },
      products: []
    });

    expect(decision).toBeNull();
  });
});
