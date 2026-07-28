import { buildCatalogUserAgent } from './catalog-http.constants';

describe('buildCatalogUserAgent', () => {
  it('includes contact email when provided', () => {
    expect(buildCatalogUserAgent('dev@example.com')).toBe(
      'ReadingAnalyticsPlatform/1.0 (educational; contact: dev@example.com)',
    );
  });

  it('falls back to GitHub repo when contact is empty', () => {
    expect(buildCatalogUserAgent('')).toBe(
      'ReadingAnalyticsPlatform/1.0 (educational; contact: github.com/CeliaMerino/AI4Devs-finalproject)',
    );
  });
});
