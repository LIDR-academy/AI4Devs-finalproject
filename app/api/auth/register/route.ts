import { z } from "zod";

import { ValidationError } from "@/domain/errors";
import { toProblemResponse } from "@/http/problem";
import { prismaAuthRepository } from "@/repositories/auth.repository.prisma";
import { prismaSubscriberRepository } from "@/repositories/subscriber.repository.prisma";
import { prismaSubscriptionRepository } from "@/repositories/subscription.repository.prisma";
import { registerSubscriber } from "@/use-cases/accounts/register-subscriber";

const INSTANCE = "/api/auth/register";

const RegisterSchema = z.object({
  email: z.email("Introduce un email válido."),
  // 8 caracteres es el mínimo que recomienda OWASP; no se exigen clases de
  // caracteres, que empeoran la usabilidad sin aportar entropía real.
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
  fullName: z.string().trim().min(2, "Indica tu nombre y apellidos."),

  isAdult: z.literal(true, "Debes declarar que eres mayor de edad."),
  acceptsTerms: z.literal(true, "Debes aceptar las condiciones."),

  address: z.object({
    line1: z.string().trim().min(1, "La dirección de envío es obligatoria."),
    city: z.string().trim().min(1, "Indica la localidad."),
    postalCode: z.string().trim().min(1, "Indica el código postal."),
    country: z.string().trim().length(2, "Usa el código de país de dos letras.").optional(),
  }),

  // Tarjeta simulada (PRD §5): **nunca** se pide el número completo. Con una pasarela
  // real llegaría ya tokenizada; guardar el PAN sería un problema de cumplimiento
  // que este MVP no tiene por qué crearse.
  card: z.object({
    brand: z.string().trim().min(2, "Indica la marca de la tarjeta."),
    last4: z.string().regex(/^\d{4}$/, "Deben ser los 4 últimos dígitos."),
    expMonth: z.number().int().min(1).max(12),
    expYear: z.number().int().min(2026).max(2100),
  }),

  // El plan es obligatorio: el alta deja la cuenta operativa o no es un alta (spec
  // `subscriptions` → "Suscripción activa desde el alta").
  //
  // Aquí solo se exige que sea texto. **Qué planes son contratables lo decide la tabla
  // de planes**, no una lista repetida en el borde: con un `z.enum` fijo, un plan
  // retirado por el admin seguiría pasando la validación, y "no has elegido plan" y
  // "ese plan ya no se ofrece" acabarían dando el mismo mensaje.
  // El `min(1)` es lo que hace que "no has elegido plan" salga **junto** al resto de
  // errores del formulario: sin él, un `planCode` vacío pasaría el esquema del borde y
  // el fallo llegaría solo, en una segunda vuelta, cuando el caso de uso lo mirara.
  planCode: z.string("Debes elegir un plan de suscripción.").trim().min(1, "Debes elegir un plan de suscripción."),
});

export async function POST(request: Request) {
  try {
    const raw: unknown = await request.json().catch(() => {
      throw new ValidationError(
        [{ field: "body", issue: "Se esperaba un cuerpo JSON." }],
        "Petición mal formada."
      );
    });

    const parsed = RegisterSchema.safeParse(raw);
    if (!parsed.success) {
      throw new ValidationError(
        parsed.error.issues.map((issue) => ({
          field: issue.path.join(".") || "body",
          issue: issue.message,
        }))
      );
    }

    const { userId, planCode } = await registerSubscriber(
      {
        repository: prismaSubscriberRepository,
        subscriptions: prismaSubscriptionRepository,
        auth: prismaAuthRepository,
      },
      parsed.data
    );

    // 201 con el destino: no se abre sesión automáticamente, el alta y el acceso son
    // dos pasos distintos.
    return Response.json({ userId, planCode, redirectTo: "/login" }, { status: 201 });
  } catch (error) {
    return toProblemResponse(error, INSTANCE);
  }
}
