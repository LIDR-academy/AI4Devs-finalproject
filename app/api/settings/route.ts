import { z } from "zod";

import { requireSession } from "@/http/auth-context";
import { parseJsonBody } from "@/http/parse-body";
import { toProblemResponse } from "@/http/problem";
import { prismaAuditRepository } from "@/repositories/audit.repository.prisma";
import { prismaBackofficeRepository } from "@/repositories/backoffice.repository.prisma";
import { prismaSettingsRepository } from "@/repositories/settings.repository.prisma";
import { updateSetting } from "@/use-cases/backoffice/manage-backoffice";

const SettingSchema = z.object({
  key: z.string().min(1, "Indica el parámetro."),
  value: z.number().min(0, "Debe ser un número no negativo."),
});

/** Parámetros vigentes, ya resueltos con sus valores por defecto. */
export async function GET() {
  try {
    await requireSession();
    return Response.json({ settings: await prismaSettingsRepository.load() });
  } catch (error) {
    return toProblemResponse(error, "/api/settings");
  }
}

/** Cambia un parámetro configurable — solo admin. */
export async function PUT(request: Request) {
  try {
    const { user } = await requireSession();
    const { key, value } = await parseJsonBody(request, SettingSchema);

    const result = await updateSetting(
      { backoffice: prismaBackofficeRepository, audit: prismaAuditRepository },
      { key, value, actor: { id: user.id, role: user.role } }
    );

    return Response.json(result);
  } catch (error) {
    return toProblemResponse(error, "/api/settings");
  }
}
