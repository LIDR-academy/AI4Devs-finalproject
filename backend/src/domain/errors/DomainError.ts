/**
 * Domain-level errors. Each error carries an HTTP status and a stable error code.
 * The error handler middleware maps these to API responses.
 */

export abstract class DomainError extends Error {
  abstract readonly code: string;
  abstract readonly httpStatus: number;
}

export const BAD_REQUEST_STATUS = 400;
export const NOT_FOUND_STATUS = 404;
export const CONFLICT_STATUS = 409;
export const RATE_LIMITED_STATUS = 429;
export const UPSTREAM_ERROR_STATUS = 502;
export const UNAVAILABLE_STATUS = 503;

export class ValidationError extends DomainError {
  readonly code = 'VALIDATION_ERROR';
  readonly httpStatus = BAD_REQUEST_STATUS;
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends DomainError {
  readonly code = 'NOT_FOUND';
  readonly httpStatus = NOT_FOUND_STATUS;
  constructor(resource: string) {
    super(`${resource} no encontrado`);
    this.name = 'NotFoundError';
  }
}

export class PortalBlockedError extends DomainError {
  readonly code = 'PORTAL_BLOCKED';
  readonly httpStatus = UNAVAILABLE_STATUS;
  constructor(domain: string) {
    super(`Portal ${domain} está bloqueando peticiones. Pega el texto del anuncio manualmente.`);
    this.name = 'PortalBlockedError';
  }
}

export class LlmMalformedResponseError extends DomainError {
  readonly code = 'LLM_MALFORMED_RESPONSE';
  readonly httpStatus = UPSTREAM_ERROR_STATUS;
  constructor() {
    super('El modelo no devolvió una respuesta válida. Pega el texto del anuncio manualmente.');
    this.name = 'LlmMalformedResponseError';
  }
}

export class CatastroUnavailableError extends DomainError {
  readonly code = 'CADASTRO_UNAVAILABLE';
  readonly httpStatus = UNAVAILABLE_STATUS;
  constructor() {
    super('La verificación catastral no está disponible. El análisis del anuncio sigue siendo válido.');
    this.name = 'CatastroUnavailableError';
  }
}

export class InvalidUrlError extends DomainError {
  readonly code = 'INVALID_URL';
  readonly httpStatus = BAD_REQUEST_STATUS;
  constructor(message: string) {
    super(message);
    this.name = 'InvalidUrlError';
  }
}
