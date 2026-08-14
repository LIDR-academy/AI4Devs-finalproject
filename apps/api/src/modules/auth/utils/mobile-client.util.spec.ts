import {
  isMobileClient,
  MOBILE_CLIENT_HEADER,
  resolveRefreshToken,
} from './mobile-client.util';

describe('isMobileClient', () => {
  it('returns true for the mobile client header', () => {
    expect(
      isMobileClient({ [MOBILE_CLIENT_HEADER]: 'mobile' }),
    ).toBe(true);
  });

  it('is case-insensitive', () => {
    expect(
      isMobileClient({ [MOBILE_CLIENT_HEADER]: 'Mobile' }),
    ).toBe(true);
  });

  it('returns false when the header is missing or different', () => {
    expect(isMobileClient({})).toBe(false);
    expect(isMobileClient({ [MOBILE_CLIENT_HEADER]: 'web' })).toBe(false);
  });

  it('uses the first value when the header is an array', () => {
    expect(
      isMobileClient({ [MOBILE_CLIENT_HEADER]: ['mobile', 'web'] }),
    ).toBe(true);
  });
});

describe('resolveRefreshToken', () => {
  it('prefers a non-empty body token over the cookie', () => {
    expect(resolveRefreshToken('cookie-token', ' body-token ')).toBe(
      'body-token',
    );
  });

  it('falls back to the cookie when the body is empty', () => {
    expect(resolveRefreshToken('cookie-token', '  ')).toBe('cookie-token');
    expect(resolveRefreshToken('cookie-token', undefined)).toBe('cookie-token');
  });

  it('returns undefined when neither source has a token', () => {
    expect(resolveRefreshToken(undefined, undefined)).toBeUndefined();
    expect(resolveRefreshToken('  ', '')).toBeUndefined();
  });
});
