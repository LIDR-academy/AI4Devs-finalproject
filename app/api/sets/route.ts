import { z } from "zod";

import { requireSession } from "@/http/auth-context";
import { parseJsonBody } from "@/http/parse-body";
import { toProblemResponse } from "@/http/problem";
import { prismaAuditRepository } from "@/repositories/audit.repository.prisma";
import { prismaSetRepository } from "@/repositories/set.repository.prisma";
import { createSet } from "@/use-cases/catalog/manage-sets";

const INSTANCE = "/api/sets";

/** Importe con dos decimales como cadena: el decimal exacto no cabe en un `number`. */
const money = z.string().regex(/^\d+(\.\d{1,2})?$/, "Usa un importe como 149.99.");

const CreateSetSchema = z.object({
  themeId: z.uuid("Indica el tema del set."),
  name: z.string().trim().min(1, "El nombre es obligatorio."),
  pieceCount: z
    .number("Indica cuántas piezas tiene el set.")
    .int("El número de piezas es un número entero.")
    .positive("El número de piezas debe ser positivo."),
  setNum: z.string().trim().min(1).nullish(),
  year: z
    .number("El año es un número, como 1999.")
    .int("Escribe el año con cuatro cifras, como 1999.")
    .min(1949, "LEGO no fabricaba sets antes de 1949.")
    .max(2100, "Ese año todavía no ha llegado.")
    .nullish(),
  recommendedAge: z.string().trim().min(1).nullish(),
  difficulty: z.string().trim().min(1).nullish(),
  referenceValue: money.nullish(),
  boxPhotoUrl: z.url("La foto debe ser una URL válida.").nullish(),
  restricted: z.boolean().optional(),
});

/** Alta de un Set. El permiso lo comprueba el caso de uso, que es quien conoce la regla. */
export async function POST(request: Request) {
  try {
    const { user } = await requireSession();
    const data = await parseJsonBody(request, CreateSetSchema);

    const set = await createSet(
      { repository: prismaSetRepository, audit: prismaAuditRepository },
      { ...data, actor: { id: user.id, role: user.role } }
    );

    return Response.json({ set }, { status: 201 });
  } catch (error) {
    return toProblemResponse(error, INSTANCE);
  }
}
