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
