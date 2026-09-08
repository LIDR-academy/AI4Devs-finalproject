/**
 * Errores de dominio, agnósticos del framework. La capa HTTP (`src/http/problem.ts`)
 * los traduce al contrato RFC 9457 de ADR-0002; el dominio nunca conoce HTTP.
 *
 * Los `code` son el **enum estable y cerrado** de ADR-0002 §2: los tests y el
 * frontend dependen de ellos, no del texto del mensaje.
 */

export const ERROR_CODES = [
  "VALIDATION_ERROR",
  "UNAUTHENTICATED",
  "FORBIDDEN",
  "NOT_FOUND",
  "COPY_STATE_CONFLICT",
  "QUEUE_LIMIT_EXCEEDED",
  "OFFER_EXPIRED",
  "NOT_ELIGIBLE",
  // Alquilar exige plan activo. Se separa de `NOT_ELIGIBLE` porque la acción que lo
  // resuelve es otra: contratar o reactivar la suscripción, no devolver un set.
  "NO_ACTIVE_SUBSCRIPTION",
  // Bajar de plan con más sets ocupando plaza de los que permitiría el plan nuevo.
  // Es un código propio, y no `NOT_ELIGIBLE`, porque lo que resuelve cada caso es
  // distinto: aquí hay que devolver sets, allí hace falta un plan activo.
  "PLAN_DOWNGRADE_BLOCKED",
  // Enlace de restablecimiento caducado, ya gastado o inexistente. Los tres casos
  // comparten código a propósito: distinguirlos convertiría el endpoint en un oráculo
  // de tokens, y a quien lo sufre le da igual — el enlace no vale y hay que pedir otro.
  "RESET_TOKEN_INVALID",
  "INTERNAL",
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

export abstract class DomainError extends Error {
  /** Código estable, legible por máquina (p. ej. "COPY_STATE_CONFLICT"). */
  abstract readonly code: ErrorCode;

  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

/** Se violó una invariante del dominio (estado ilegal, transición no permitida…). */
export class InvariantViolationError extends DomainError {
  readonly code: ErrorCode;

  constructor(code: ErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

/** Detalle de un campo que no pasó la validación (ADR-0002 §2: `errors[]`). */
export interface ValidationIssue {
  field: string;
  issue: string;
}

/** La petición está bien formada pero sus datos no son válidos → 422. */
export class ValidationError extends DomainError {
  readonly code = "VALIDATION_ERROR" as const;
  readonly issues: readonly ValidationIssue[];

  constructor(issues: readonly ValidationIssue[], message = "Datos no válidos.") {
    super(message);
    this.issues = issues;
  }
}

/**
 * No hay sesión válida, o las credenciales no son correctas → 401.
 *
 * El mensaje es deliberadamente vago ("credenciales no válidas") y **el mismo** tanto
 * si el email no existe como si la contraseña falla: distinguirlos convertiría el
 * login en un oráculo para enumerar cuentas.
 */
export class UnauthenticatedError extends DomainError {
  readonly code = "UNAUTHENTICATED" as const;

  constructor(message = "Credenciales no válidas.") {
    super(message);
  }
}

/** Hay sesión, pero el rol no alcanza para la acción o la superficie → 403. */
export class ForbiddenError extends DomainError {
  readonly code = "FORBIDDEN" as const;

  constructor(message = "No tienes permiso para realizar esta acción.") {
    super(message);
  }
}

/** El recurso no existe (o no es visible para quien pregunta) → 404. */
export class NotFoundError extends DomainError {
  readonly code = "NOT_FOUND" as const;

  constructor(message = "Recurso no encontrado.") {
    super(message);
  }
}

/**
 * El enlace de restablecimiento no sirve: caducado, ya usado o inventado → 410 Gone.
 *
 * El mensaje es **el mismo** para los tres casos, por lo mismo que el login no
 * distingue email desconocido de contraseña incorrecta.
 */
export class ResetTokenInvalidError extends DomainError {
  readonly code = "RESET_TOKEN_INVALID" as const;

  constructor(
    message = "Este enlace ya no sirve. Pide uno nuevo para restablecer tu contraseña."
  ) {
    super(message);
  }
}
