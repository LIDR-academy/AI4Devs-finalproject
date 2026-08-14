import {
  MOBILE_CLIENT_HEADER,
  MOBILE_CLIENT_VALUE,
} from '../../../common/constants/auth.constants';

export { MOBILE_CLIENT_HEADER, MOBILE_CLIENT_VALUE };

export function isMobileClient(
  headers: Record<string, unknown>,
): boolean {
  const raw = headers[MOBILE_CLIENT_HEADER];
  const value = Array.isArray(raw) ? raw[0] : raw;
  return typeof value === 'string' && value.toLowerCase() === MOBILE_CLIENT_VALUE;
}

export function resolveRefreshToken(
  cookieToken: string | undefined,
  bodyToken: string | undefined,
): string | undefined {
  const fromBody = bodyToken?.trim();
  if (fromBody) {
    return fromBody;
  }

  const fromCookie = cookieToken?.trim();
  return fromCookie || undefined;
}
