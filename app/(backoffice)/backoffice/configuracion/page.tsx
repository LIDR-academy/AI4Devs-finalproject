import { redirect } from "next/navigation";

import { can } from "@/domain/auth/permissions";
import { requireSurfacePage } from "@/http/auth-context";
import { prismaSettingsRepository } from "@/repositories/settings.repository.prisma";
import { prismaSubscriptionRepository } from "@/repositories/subscription.repository.prisma";

import { SettingsForm } from "./settings-form";

export const metadata = { title: "Configuración" };

const EUR = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });

/** Panel de admin: parámetros del sistema y planes (8.2). */
export default async function SettingsPage() {
  const { user } = await requireSurfacePage("backoffice");
  // El operador llega hasta el back-office, pero no hasta aquí: se le devuelve a su
  // cola de trabajo en vez de enseñarle un 403 sin salida.
  if (!can(user.role, "settings.manage")) redirect("/backoffice");

  const [settings, plans] = await Promise.all([
    prismaSettingsRepository.load(),
    prismaSubscriptionRepository.listPlans(),
  ]);

  return (
    <section className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configuración</h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Los cambios se aplican de inmediato y quedan registrados en la auditoría.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Reglas del sistema</h2>
        <SettingsForm settings={settings} />
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Planes</h2>
        <table className="w-full max-w-2xl text-sm">
          <thead className="text-left text-[var(--muted-foreground)]">
            <tr>
              <th className="py-2 font-medium">Plan</th>
              <th className="py-2 font-medium">Precio</th>
              <th className="py-2 font-medium">Sets a la vez</th>
              <th className="py-2 font-medium">Ventaja en cola</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((plan) => (
              <tr key={plan.code} className="border-t">
                <td className="py-2 pr-4">{plan.name}</td>
                <td className="py-2 pr-4">{EUR.format(Number(plan.monthlyPrice))}</td>
                <td className="py-2 pr-4">{plan.maxSimultaneousSets}</td>
                <td className="py-2">{plan.queueBonusDays} días</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-sm text-[var(--muted-foreground)]">
          Los planes se editan por API (<code>PATCH /api/plans/&#123;code&#125;</code>); su
          pantalla llega con el diseño de UX.
        </p>
      </div>
    </section>
  );
}
