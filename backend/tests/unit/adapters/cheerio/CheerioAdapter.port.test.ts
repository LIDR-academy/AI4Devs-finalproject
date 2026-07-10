import { describe, it, expect } from 'vitest';
import { CheerioAdapter } from '../../../../src/adapters/cheerio/CheerioAdapter';
import type { ListingFetchPort } from '../../../../src/domain/ports/ListingFetchPort';

describe('CheerioAdapter — port contract', () => {
  it('implements ListingFetchPort', () => {
    const adapter: ListingFetchPort = new CheerioAdapter();
    expect(typeof adapter.fetch).toBe('function');
  });
});
