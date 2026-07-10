import { describe, it, expect, vi, beforeEach } from 'vitest';
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

describe('CheerioAdapter — headers', () => {
  beforeEach(() => {
    vi.mocked(fetch).mockReset();
    vi.mocked(isAllowedPortal).mockReturnValue(true);
  });

  it('envía los headers de navegador en la primera petición', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => '<html><body><div class="price">200.000 €</div></body></html>',
    } as unknown as Response);

    const adapter = new CheerioAdapter();
    await adapter.fetch('https://www.idealista.com/inmueble/123');

    expect(fetch).toHaveBeenCalledTimes(1);
    const callArgs = vi.mocked(fetch).mock.calls[0];
    const headers = callArgs[1]?.headers as Record<string, string>;
    expect(headers['User-Agent']).toContain('Chrome');
    expect(headers['Accept']).toContain('text/html');
    expect(headers['Accept-Language']).toContain('es');
    expect(headers['Accept-Encoding']).toContain('gzip');
    expect(headers['Sec-Fetch-Dest']).toBe('document');
  });
});
