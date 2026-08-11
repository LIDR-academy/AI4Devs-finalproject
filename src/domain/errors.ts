/**
 * Errores de dominio, agnósticos del framework. La capa HTTP (Route Handlers) los
 * traduce al contrato de errores RFC 9457 (ADR-0002); el dominio nunca conoce HTTP.
 */
export abstract class DomainError extends Error {
  /** Código estable, legible por máquina (p. ej. "queue.not_eligible"). */
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

/** Se violó una invariante del dominio (estado ilegal, transición no permitida…). */
export class InvariantViolationError extends DomainError {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}
