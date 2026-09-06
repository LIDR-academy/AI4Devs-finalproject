import { z } from "zod";

import { requireSession } from "@/http/auth-context";
import { parseJsonBody } from "@/http/parse-body";
import { toProblemResponse } from "@/http/problem";
import { prismaAuditRepository } from "@/repositories/audit.repository.prisma";
import { prismaBackofficeRepository } from "@/repositories/backoffice.repository.prisma";
import { updateEmployee } from "@/use-cases/backoffice/manage-backoffice";

const UpdateEmployeeSchema = z
  .object({
    role: z.enum(["OPERATOR", "ADMIN"]).optional(),
    status: z.enum(["ACTIVE", "SUSPENDED"]).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "No has enviado ningún cambio.",
  });

/** Cambia el rol o suspende a un empleado — solo admin. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  try {
    const { user } = await requireSession();
    const data = await parseJsonBody(request, UpdateEmployeeSchema);

    const employee = await updateEmployee(
      { backoffice: prismaBackofficeRepository, audit: prismaAuditRepository },
      { userId, ...data, actor: { id: user.id, role: user.role } }
    );

    return Response.json({ employee });
  } catch (error) {
    return toProblemResponse(error, `/api/employees/${userId}`);
  }
}
