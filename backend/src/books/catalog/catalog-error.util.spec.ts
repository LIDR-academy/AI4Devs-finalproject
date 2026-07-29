import {
  isRateLimitError,
  isTransientCatalogError,
} from './catalog-error.util';

describe('catalog-error.util', () => {
  it.each([429, 502, 503, 504])(
    'treats HTTP %i as transient',
    (status) => {
      expect(
        isTransientCatalogError({ response: { status } }),
      ).toBe(true);
    },
  );

  it('detects transient errors from message text', () => {
    expect(
      isTransientCatalogError(new Error('Request failed with status code 503')),
    ).toBe(true);
  });

  it('does not retry permanent client errors', () => {
    expect(isTransientCatalogError({ response: { status: 404 } })).toBe(false);
  });

  it('keeps isRateLimitError as alias', () => {
    expect(isRateLimitError({ response: { status: 429 } })).toBe(true);
    expect(isRateLimitError({ response: { status: 503 } })).toBe(true);
  });
});
