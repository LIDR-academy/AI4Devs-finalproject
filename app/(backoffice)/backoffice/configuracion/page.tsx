import Link from "next/link";
import { redirect } from "next/navigation";

import { can } from "@/domain/auth/permissions";
import { requireSurfacePage } from "@/http/auth-context";
import { prismaSettingsRepository } from "@/repositories/settings.repository.prisma";
import { prismaSubscriptionRepository } from "@/repositories/subscription.repository.prisma";

import { PlansForm } from "./plans-form";
import { SettingsForm } from "./settings-form";

export const metadata = { title: "Configuración" };

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
        <p className="text-sm text-[var(--muted-foreground)]">
          Precio, sets simultáneos y ventaja en cola de cada plan. El cambio afecta a
          las suscripciones vigentes desde el momento en que se guarda.
        </p>
        {/* El precio llega ya como cadena ("24.99") desde el repositorio y así entra
            en el campo: formatearlo con `Intl` metería el símbolo de euro dentro del
            valor editable, y pasarlo por `Number` perdería el céntimo del `Decimal`. */}
        <PlansForm plans={plans} />
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Recordatorios de retención</h2>
        <p className="text-sm text-[var(--muted-foreground)]">
          Se activan <strong>set a set</strong>, desde la ficha de cada uno en el{" "}
          <Link href="/backoffice/catalogo" className="underline">
            catálogo
          </Link>
          . Aquí solo se fija la cadencia por defecto, arriba.
        </p>
      </div>
    </section>
  );
}
