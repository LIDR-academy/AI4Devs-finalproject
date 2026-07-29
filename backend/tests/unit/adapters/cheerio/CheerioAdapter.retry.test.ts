import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fetch, { Response } from 'node-fetch';
import { CheerioAdapter } from '../../../../src/adapters/cheerio/CheerioAdapter';
import { isAllowedPortal } from '../../../../src/infrastructure/utils/urlValidator';

vi.mock('node-fetch');
vi.mock('../../../../src/infrastructure/utils/urlValidator', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../../../../src/infrastructure/utils/urlValidator')>();
  return {
    ...mod,
    isAllowedPortal: vi.fn(() => true),
  };
});

describe('CheerioAdapter — retry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(fetch).mockReset();
    vi.mocked(isAllowedPortal).mockReturnValue(true);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('reintenta ante error de red hasta 4 veces', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('network'));

    const adapter = new CheerioAdapter();
    const promise = adapter.fetch('https://www.idealista.com/inmueble/123').catch(() => null);
    await vi.runAllTimersAsync().catch(() => {});
    await promise;
    // 4 fetches to www (1 + 3 retries) + 1 fallback to m. = 5
    expect(vi.mocked(fetch).mock.calls.length).toBeGreaterThanOrEqual(4);
  });

  it('NO reintenta ante 4xx (403)', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 403,
      text: async () => '',
    } as unknown as Response);

    const adapter = new CheerioAdapter();
    await expect(adapter.fetch('https://www.idealista.com/inmueble/123')).rejects.toThrow();
    // 1 fetch to www + 1 fallback to m. = 2 (no retries)
    expect(vi.mocked(fetch).mock.calls.length).toBeLessThanOrEqual(2);
  });
});
