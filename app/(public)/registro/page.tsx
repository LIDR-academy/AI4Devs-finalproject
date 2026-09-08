import { redirect } from "next/navigation";

import { homeSurface, surfacePath } from "@/domain/auth/roles";
import { currentSession } from "@/http/auth-context";
import { prismaCatalogRepository } from "@/repositories/catalog.repository.prisma";
import { listMembershipPlans } from "@/use-cases/catalog/browse-public-catalog";

import { RegisterForm } from "./register-form";

export const metadata = {
  title: "Crear cuenta · Clickoteca",
};

/**
 * Igual que `/planes`: los precios y los límites de los planes son configurables por
 * el admin (D9), así que prerenderizar esta página congelaría en el build lo que el
 * formulario ofrece al alta.
 */
export const dynamic = "force-dynamic";

export default async function RegisterPage({
  searchParams,
}: {
  /** `?plan=PREMIUM` — el plan que el visitante eligió en `/planes`. */
  searchParams: Promise<{ plan?: string }>;
}) {
  // Con sesión abierta, darse de alta no tiene sentido: a su superficie.
  const session = await currentSession();
  if (session) redirect(surfacePath(homeSurface(session.user.role)));

  const [{ plan }, plans] = await Promise.all([
    searchParams,
    listMembershipPlans({ repository: prismaCatalogRepository }),
  ]);

  return (
    <section className="flex flex-col items-start gap-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Crear cuenta</h1>
        <p className="max-w-prose text-[var(--muted-foreground)]">
          Elige tu plan y déjanos una dirección de envío para mandarte los sets. La
          suscripción queda activa al terminar el alta; en este MVP el pago está
          simulado.
        </p>
      </div>
      <RegisterForm plans={plans} preselectedPlan={plan} />
    </section>
  );
}
