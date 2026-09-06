import type { z } from "zod";

import { ValidationError } from "@/domain/errors";
// Importado por su efecto: instala los mensajes de validación en castellano como
// defecto de Zod. Va aquí porque por aquí pasa toda la validación de peticiones.
import "@/http/validation-messages";

/**
 * Lee y valida el cuerpo JSON de una petición contra un esquema Zod.
 *
 * Estaba copiado en cada Route Handler; centralizarlo garantiza que **todos** los
 * endpoints traduzcan los fallos de Zod al mismo `errors[]` del contrato RFC 9457
 * (ADR-0002 §2), en vez de depender de que cada uno lo recuerde.
 */
export async function parseJsonBody<T extends z.ZodType>(
  request: Request,
  schema: T
): Promise<z.infer<T>> {
  const raw: unknown = await request.json().catch(() => {
    throw new ValidationError(
      [{ field: "body", issue: "Se esperaba un cuerpo JSON." }],
      "Petición mal formada."
    );
  });

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.issues.map((issue) => ({
        field: issue.path.join(".") || "body",
        issue: issue.message,
      }))
    );
  }

  return parsed.data;
}
