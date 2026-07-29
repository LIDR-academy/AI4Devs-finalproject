import { describe, it, expect } from 'vitest';
import { ChainedFetchAdapter } from '../../../../src/adapters/fetch/ChainedFetchAdapter';
import { PortalBlockedError } from '../../../../src/domain/errors/DomainError';
import type { ListingFetchPort } from '../../../../src/domain/ports/ListingFetchPort';

function makeAdapter(behavior: 'ok' | 'throw' | 'slow', result?: unknown): { port: ListingFetchPort; calls: number } {
  const calls = { n: 0 };
  const port: ListingFetchPort = {
    async fetch(_url: string) {
      calls.n += 1;
      if (behavior === 'throw') throw new PortalBlockedError('example.com');
      if (behavior === 'slow') return new Promise((r) => setTimeout(() => r(result as never), 100));
      return result as never;
    },
  };
  return { port, get calls() { return calls.n; } } as never;
}

describe('ChainedFetchAdapter', () => {
  it('returns Cheerio result on success', async () => {
    const { port: cheerio } = makeAdapter('ok', { url: 'x', html: 'h', text: 't' });
    const { port: playwright } = makeAdapter('throw');
    const chain = new ChainedFetchAdapter([cheerio, playwright]);
    const result = await chain.fetch('https://example.com');
    expect(result).toEqual({ url: 'x', html: 'h', text: 't' });
  });

  it('falls back to Playwright when Cheerio throws PortalBlockedError', async () => {
    const { port: cheerio } = makeAdapter('throw');
    const { port: playwright } = makeAdapter('ok', { url: 'x', html: 'h', text: 't' });
    const chain = new ChainedFetchAdapter([cheerio, playwright]);
    const result = await chain.fetch('https://example.com');
    expect(result).toEqual({ url: 'x', html: 'h', text: 't' });
  });

  it('throws PortalBlockedError when all adapters fail', async () => {
    const cheerioErr = new PortalBlockedError('cheerio.com');
    const playwrightErr = new PortalBlockedError('playwright.com');
    const cheerioCalls = { n: 0 };
    const cheerio: ListingFetchPort = {
      async fetch() { cheerioCalls.n += 1; throw cheerioErr; },
    };
    const playwrightCalls = { n: 0 };
    const playwright: ListingFetchPort = {
      async fetch() { playwrightCalls.n += 1; throw playwrightErr; },
    };
    const chain = new ChainedFetchAdapter([cheerio, playwright]);
    await expect(chain.fetch('https://example.com')).rejects.toBe(playwrightErr);
    expect(cheerioCalls.n).toBe(1);
    expect(playwrightCalls.n).toBe(1);
  });

  it('propagates non-PortalBlockedError immediately and does not call next adapter', async () => {
    const { port: cheerio } = makeAdapter('throw');
    const networkErr = new Error('ECONNRESET');
    const playwrightCalls = { n: 0 };
    const playwright: ListingFetchPort = {
      async fetch() { playwrightCalls.n += 1; throw networkErr; },
    };
    const ok: ListingFetchPort = {
      async fetch() { return { url: 'x', html: 'h', text: 't' } as never; },
    };
    const chain = new ChainedFetchAdapter([cheerio, playwright, ok]);
    await expect(chain.fetch('https://example.com')).rejects.toBe(networkErr);
    expect(playwrightCalls.n).toBe(1);
  });
});
