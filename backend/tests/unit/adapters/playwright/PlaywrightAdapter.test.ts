import { describe, it, expect, vi } from 'vitest';
import { PlaywrightAdapter } from '../../../../src/adapters/playwright/PlaywrightAdapter';
import { BrowserPool } from '../../../../src/adapters/playwright/BrowserPool';
import { PortalBlockedError } from '../../../../src/domain/errors/DomainError';
import { isAllowedPortal } from '../../../../src/infrastructure/utils/urlValidator';
import type { BrowserContext, Page, Browser, BrowserLauncher } from '../../../../src/adapters/playwright/types';
import { systemClock } from '../../../../src/adapters/playwright/types';

vi.mock('../../../../src/infrastructure/utils/urlValidator', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../../../../src/infrastructure/utils/urlValidator')>();
  return { ...mod, isAllowedPortal: vi.fn(() => true) };
});

function makeFakeBrowser(html: string, networkIdle = true): { launcher: BrowserLauncher; page: Page; gotoCalls: string[] } {
  const gotoCalls: string[] = [];
  const page: Page = {
    async setExtraHTTPHeaders() {},
    async setUserAgent() {},
    async goto(url: string) { gotoCalls.push(url); if (!networkIdle) throw new Error('timeout'); return null; },
    async content() { return html; },
    async close() {},
  };
  const context: BrowserContext = {
    async newPage() { return page; },
    async close() {},
  };
  const browser: Browser = {
    async newContext() { return context; },
    async close() {},
  };
  const launcher: BrowserLauncher = { launch: async () => browser };
  return { launcher, page, gotoCalls };
}

describe('PlaywrightAdapter', () => {
  it('fetches HTML via real browser, returns parsed result', async () => {
    const html = '<html><body><div class="price">300.000 €</div><div class="m2">90 m²</div><div class="address">Calle Mayor 1</div></body></html>';
    const { launcher, gotoCalls } = makeFakeBrowser(html);
    const pool = new BrowserPool({ launcher, clock: systemClock, poolSize: 1, idleTimeoutMs: 1000 });
    const adapter = new PlaywrightAdapter({
      pool,
      userAgent: 'Realista/1.0',
      gotoTimeoutMs: 5000,
    });

    const result = await adapter.fetch('https://www.idealista.com/inmueble/1');
    expect(result.url).toBe('https://www.idealista.com/inmueble/1');
    expect(result.text).toContain('300.000');
    expect(result.price).toBe(300000);
    expect(result.squareMeters).toBe(90);
    expect(gotoCalls[0]).toBe('https://www.idealista.com/inmueble/1');
  });

  it('throws PortalBlockedError when navigation times out (still blocked)', async () => {
    const { launcher } = makeFakeBrowser('', false);
    const pool = new BrowserPool({ launcher, clock: systemClock, poolSize: 1, idleTimeoutMs: 1000 });
    const adapter = new PlaywrightAdapter({
      pool,
      userAgent: 'Realista/1.0',
      gotoTimeoutMs: 100,
    });
    await expect(adapter.fetch('https://www.idealista.com/inmueble/1')).rejects.toBeInstanceOf(PortalBlockedError);
  });

  it('rejects non-allowed portals', async () => {
    vi.mocked(isAllowedPortal).mockReturnValueOnce(false);
    const { launcher } = makeFakeBrowser('<html></html>');
    const pool = new BrowserPool({ launcher, clock: systemClock, poolSize: 1, idleTimeoutMs: 1000 });
    const adapter = new PlaywrightAdapter({
      pool,
      userAgent: 'Realista/1.0',
      gotoTimeoutMs: 5000,
    });
    await expect(adapter.fetch('https://evil.com/page')).rejects.toBeInstanceOf(PortalBlockedError);
  });
});
