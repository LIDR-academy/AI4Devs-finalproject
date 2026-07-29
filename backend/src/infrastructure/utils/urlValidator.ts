import { env } from '../config/env';

export class UrlValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UrlValidationError';
  }
}

/**
 * Validate that a URL is a real-estate portal in the allowlist.
 * FR-001, FR-012 (User-Agent).
 */
export function validateListingUrl(url: string): string {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new UrlValidationError('URL inválida: formato incorrecto');
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    throw new UrlValidationError(`URL inválida: protocolo ${parsed.protocol} no soportado`);
  }

  const allowed = env.ALLOWED_PORTALS.some((domain) => parsed.hostname.endsWith(domain));
  if (!allowed) {
    throw new UrlValidationError(
      `Dominio ${parsed.hostname} no está en la lista de portales permitidos`,
    );
  }

  return parsed.toString();
}

export function isAllowedPortal(hostname: string): boolean {
  return env.ALLOWED_PORTALS.some((d) => hostname.endsWith(d));
}

export const REALISTA_USER_AGENT = env.REALISTA_USER_AGENT;

export const CHROME_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export const BROWSER_HEADERS: Record<string, string> = {
  'User-Agent': CHROME_USER_AGENT,
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Encoding': 'gzip, deflate, br',
  'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
  'Upgrade-Insecure-Requests': '1',
};
