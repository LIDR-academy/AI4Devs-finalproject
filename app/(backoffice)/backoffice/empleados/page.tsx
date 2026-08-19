import Link from "next/link";
import { redirect } from "next/navigation";

import { StatusBadge } from "@/components/status-badge";
import { roleLabel, userStatus } from "@/lib/status";
import { can } from "@/domain/auth/permissions";
import { requireSurfacePage } from "@/http/auth-context";
import { prismaAuditRepository } from "@/repositories/audit.repository.prisma";
import { prismaBackofficeRepository } from "@/repositories/backoffice.repository.prisma";
import { listEmployees } from "@/use-cases/backoffice/manage-backoffice";

import { EmployeeControls } from "./employee-controls";

export const metadata = { title: "Personal · Clickoteca" };

/** Gestión de empleados — solo admin (8.2). */
export default async function EmployeesPage() {
  const { user } = await requireSurfacePage("backoffice");
  if (!can(user.role, "employee.manage")) redirect("/backoffice");

  const employees = await listEmployees(
    { backoffice: prismaBackofficeRepository, audit: prismaAuditRepository },
    { id: user.id, role: user.role }
  );

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Personal</h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Operadores y administradores con acceso al back-office.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[36rem] text-sm">
          <thead className="text-left text-[var(--muted-foreground)]">
            <tr>
              <th className="py-2 font-medium">Nombre</th>
              <th className="py-2 font-medium">Email</th>
              <th className="py-2 font-medium">Rol</th>
              <th className="py-2 font-medium">Estado</th>
              <th className="py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id} className="border-t">
                <td className="py-2 pr-4">{employee.fullName}</td>
                <td className="py-2 pr-4 text-[var(--muted-foreground)]">{employee.email}</td>
                <td className="py-2 pr-4">{roleLabel(employee.role)}</td>
                <td className="py-2 pr-4">
                  <StatusBadge status={userStatus(employee.status)} />
                </td>
                <td className="py-2">
                  {employee.id === user.id ? (
                    // Cambiarse el rol a uno mismo dejaría el sistema sin quien pueda
                    // deshacerlo; el servidor también lo rechaza.
                    <span className="text-[var(--muted-foreground)]">Tú</span>
                  ) : (
                    <EmployeeControls
                      userId={employee.id}
                      role={employee.role}
                      status={employee.status}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Link href="/backoffice" className="text-sm hover:underline">
        ← Volver a la cola de trabajo
      </Link>
    </section>
  );
}
