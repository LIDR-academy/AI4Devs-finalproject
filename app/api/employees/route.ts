import { z } from "zod";

import { requireSession } from "@/http/auth-context";
import { parseJsonBody } from "@/http/parse-body";
import { toProblemResponse } from "@/http/problem";
import { prismaAuditRepository } from "@/repositories/audit.repository.prisma";
import { prismaBackofficeRepository } from "@/repositories/backoffice.repository.prisma";
import { createEmployee, listEmployees } from "@/use-cases/backoffice/manage-backoffice";

const CreateEmployeeSchema = z.object({
  email: z.email("Introduce un email válido."),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
  fullName: z.string().trim().min(2, "Indica nombre y apellidos."),
  role: z.enum(["OPERATOR", "ADMIN"]),
});

function deps() {
  return { backoffice: prismaBackofficeRepository, audit: prismaAuditRepository };
}

/** Personal del back-office — solo admin. */
export async function GET() {
  try {
    const { user } = await requireSession();
    const employees = await listEmployees(deps(), { id: user.id, role: user.role });
    return Response.json({ employees });
  } catch (error) {
    return toProblemResponse(error, "/api/employees");
  }
}

/** Alta de un empleado — solo admin. */
export async function POST(request: Request) {
  try {
    const { user } = await requireSession();
    const data = await parseJsonBody(request, CreateEmployeeSchema);

    const employee = await createEmployee(deps(), {
      ...data,
      actor: { id: user.id, role: user.role },
    });

    return Response.json({ employee }, { status: 201 });
  } catch (error) {
    return toProblemResponse(error, "/api/employees");
  }
}
