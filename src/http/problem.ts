import {
  DomainError,
  ValidationError,
  type ErrorCode,
  type ValidationIssue,
} from "@/domain/errors";

/**
 * Contrato de errores RFC 9457 (`application/problem+json`) — ADR-0002 §2.
 *
 * Aquí está el **mapa dominio → HTTP centralizado** que pide el ADR: los casos de uso
 * lanzan errores de dominio con su `code`, y este módulo es el único sitio que decide
 * el `status`. `status` es el eje del transporte; `code`, el del dominio.
 *
 * Usa `Response` del estándar web en vez de `NextResponse`: así se puede testear sin
 * levantar Next.
 */

export interface Problem {
  type: string;
  title: string;
  status: number;
  code: ErrorCode;
  detail?: string;
  instance?: string;
  errors?: readonly ValidationIssue[];
}

const STATUS_BY_CODE: Record<ErrorCode, number> = {
  VALIDATION_ERROR: 422,
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  // Conflictos con el estado actual del recurso, incluidos los CAS de D12.
  COPY_STATE_CONFLICT: 409,
  QUEUE_LIMIT_EXCEEDED: 409,
  OFFER_EXPIRED: 409,
  NOT_ELIGIBLE: 409,
  NO_ACTIVE_SUBSCRIPTION: 409,
  PLAN_DOWNGRADE_BLOCKED: 409,
  INTERNAL: 500,
};

/** Texto humano de respaldo. El cliente localiza por `code`; esto es solo *fallback*. */
const TITLE_BY_CODE: Record<ErrorCode, string> = {
  VALIDATION_ERROR: "Datos no válidos",
  UNAUTHENTICATED: "No autenticado",
  FORBIDDEN: "Acceso denegado",
  NOT_FOUND: "Recurso no encontrado",
  COPY_STATE_CONFLICT: "Transición de estado no válida",
  QUEUE_LIMIT_EXCEEDED: "Límite de colas superado",
  OFFER_EXPIRED: "La oferta ha caducado",
  NOT_ELIGIBLE: "No cumples los requisitos",
  NO_ACTIVE_SUBSCRIPTION: "Necesitas un plan activo",
  PLAN_DOWNGRADE_BLOCKED: "Tienes más sets de los que permite ese plan",
  INTERNAL: "Error interno",
};

export function statusForCode(code: ErrorCode): number {
  return STATUS_BY_CODE[code];
}

function typeUri(code: ErrorCode): string {
  return `https://clickoteca/errors/${code.toLowerCase().replaceAll("_", "-")}`;
}

export function problem(
  code: ErrorCode,
  detail?: string,
  options: { instance?: string; errors?: readonly ValidationIssue[] } = {}
): Problem {
  return {
    type: typeUri(code),
    title: TITLE_BY_CODE[code],
    status: STATUS_BY_CODE[code],
    code,
    ...(detail ? { detail } : {}),
    ...(options.instance ? { instance: options.instance } : {}),
    ...(options.errors ? { errors: options.errors } : {}),
  };
}

export function problemResponse(body: Problem): Response {
  return new Response(JSON.stringify(body), {
    status: body.status,
    headers: { "content-type": "application/problem+json; charset=utf-8" },
  });
}

/**
 * Traduce cualquier excepción a su respuesta. Lo que no sea un `DomainError` es un
 * fallo nuestro: se registra entero en el log y al cliente solo le llega `INTERNAL`,
 * nunca el mensaje ni la traza (ADR-0002 §2).
 */
export function toProblemResponse(error: unknown, instance?: string): Response {
  if (error instanceof ValidationError) {
    return problemResponse(
      problem(error.code, error.message, { instance, errors: error.issues })
    );
  }
  if (error instanceof DomainError) {
    return problemResponse(problem(error.code, error.message, { instance }));
  }

  console.error("[api] Error no controlado:", error);
  return problemResponse(
    problem("INTERNAL", "Se ha producido un error inesperado.", { instance })
  );
}
