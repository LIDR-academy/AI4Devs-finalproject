import { z } from "zod";

import { requireSession } from "@/http/auth-context";
import { parseJsonBody } from "@/http/parse-body";
import { toProblemResponse } from "@/http/problem";
import { prismaAuditRepository } from "@/repositories/audit.repository.prisma";
import { prismaSetRepository } from "@/repositories/set.repository.prisma";
import { updateSet } from "@/use-cases/catalog/manage-sets";

const money = z.string().regex(/^\d+(\.\d{1,2})?$/, "Usa un importe como 149.99.");

const UpdateSetSchema = z
  .object({
    themeId: z.uuid().optional(),
    name: z.string().trim().min(1).optional(),
    pieceCount: z
      .number("Indica cuántas piezas tiene el set.")
      .int("El número de piezas es un número entero.")
      .positive("El número de piezas debe ser positivo.")
      .optional(),
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
    boxPhotoUrl: z.url().nullish(),
    restricted: z.boolean().optional(),
  })
  // Un PATCH vacío no es un no-op inofensivo: casi siempre es un error del cliente
  // que, sin este aviso, parecería haber funcionado.
  .refine((data) => Object.keys(data).length > 0, {
    message: "No has enviado ningún campo que actualizar.",
  });

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ setId: string }> }
) {
  const { setId } = await params;
  try {
    const { user } = await requireSession();
    const data = await parseJsonBody(request, UpdateSetSchema);

    const set = await updateSet(
      { repository: prismaSetRepository, audit: prismaAuditRepository },
      setId,
      { ...data, actor: { id: user.id, role: user.role } }
    );

    return Response.json({ set });
  } catch (error) {
    return toProblemResponse(error, `/api/sets/${setId}`);
  }
}
