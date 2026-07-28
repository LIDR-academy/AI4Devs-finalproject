import { buildGoodreadsDedupKey, normalizeImportText } from './goodreads-dedup.util';

describe('normalizeImportText', () => {
  it('lowercases and collapses whitespace', () => {
    expect(normalizeImportText('  Laura   Díaz ')).toBe('laura díaz');
  });
});

describe('buildGoodreadsDedupKey', () => {
  it('prefers isbn13 when present', () => {
    expect(
      buildGoodreadsDedupKey({
        title: 'Dune',
        authors: 'Frank Herbert',
        isbn10: null,
        isbn13: '9780441172719',
        page_count: null,
        publication_year: null,
        series_name: null,
        data_source: 'goodreads',
        external_provider_id: null,
      }),
    ).toBe('isbn13:9780441172719');
  });

  it('falls back to normalized title and authors', () => {
    expect(
      buildGoodreadsDedupKey({
        title: 'No ISBN Book',
        authors: 'Jane Doe',
        isbn10: null,
        isbn13: null,
        page_count: null,
        publication_year: null,
        series_name: null,
        data_source: 'goodreads',
        external_provider_id: null,
      }),
    ).toBe('title:no isbn book|authors:jane doe');
  });
});
