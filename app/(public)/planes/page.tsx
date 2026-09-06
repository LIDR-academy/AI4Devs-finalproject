import Link from "next/link";

import { Terms } from "@/components/terms";
import { Button } from "@/components/ui/button";
import { currentSession } from "@/http/auth-context";
import { simultaneousSets } from "@/lib/status";
import { prismaCatalogRepository } from "@/repositories/catalog.repository.prisma";
import { listMembershipPlans } from "@/use-cases/catalog/browse-public-catalog";

export const metadata = {
  title: "Planes · Clickoteca",
};

/**
 * Se renderiza en cada petición. Sin esto Next la prerenderiza en el build y
 * congelaría los precios: los planes son **configurables por el admin** (D9), así que
 * un cambio de precio no aparecería hasta el siguiente despliegue. De paso, evita que
 * `next build` necesite una base de datos accesible.
 *
 * Cuando exista el panel de admin (8.2) se puede volver a cachear con revalidación
 * disparada por el propio cambio de plan.
 */
export const dynamic = "force-dynamic";

const EUR = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });

/**
 * Planes de membresía y sus condiciones. Accesible **sin sesión** (D13): es una de
 * las tres cosas que el visitante puede consultar, junto con el catálogo y el alta.
 */
export default async function PlansPage() {
  const [plans, session] = await Promise.all([
    listMembershipPlans({ repository: prismaCatalogRepository }),
    currentSession(),
  ]);

  // El destino del botón depende de quién mire. Enviar a todo el mundo al alta era el
  // callejón que se comía la pulsación de quien ya tenía sesión: la página de alta
  // redirige al portal, así que "Empezar con Basic" no hacía nada visible.
  const subscriber = session?.user.role === "SUBSCRIBER";
  const staff = session !== null && !subscriber;

  return (
    <section className="flex flex-col gap-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Planes de membresía</h1>
        <p className="max-w-prose text-[var(--muted-foreground)]">
          Elige cuántos sets quieres tener en casa a la vez. Cambia de set tantas veces
          como quieras: solo necesitas devolver el anterior.
        </p>
      </div>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {plans.map((plan) => (
          <li key={plan.code} className="flex flex-col gap-4 rounded-md border p-6">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">{plan.name}</h2>
              <p className="text-2xl font-bold">
                {EUR.format(Number(plan.monthlyPrice))}
                <span className="text-base font-normal text-[var(--muted-foreground)]">
                  {" "}
                  / mes
                </span>
              </p>
            </div>
            <ul className="space-y-1 text-sm text-[var(--muted-foreground)]">
              <li>{simultaneousSets(plan.maxSimultaneousSets)}</li>
              <li>Cambios ilimitados mientras no tengas devoluciones pendientes</li>
              <li>
                {plan.queueBonusDays > 0
                  ? `${plan.queueBonusDays} días de ventaja en las colas de reserva`
                  : "Orden de cola por tiempo de espera"}
              </li>
            </ul>
            {staff ? (
              // Operadores y admins no contratan planes: el botón les mentiría.
              <p className="mt-auto text-sm text-[var(--muted-foreground)]">
                Los planes se contratan desde una cuenta de suscriptor.
              </p>
            ) : (
              <Button asChild className="mt-auto">
                {/* El plan viaja en la URL: quien lo eligió aquí no debería tener que
                    volver a elegirlo en el destino. Se puede cambiar allí igualmente. */}
                <Link
                  href={
                    subscriber
                      ? `/portal/suscripcion?plan=${plan.code}`
                      : `/registro?plan=${plan.code}`
                  }
                >
                  Empezar con {plan.name}
                </Link>
              </Button>
            )}
          </li>
        ))}
      </ul>

      <div className="max-w-prose space-y-3">
        <h2 className="text-lg font-semibold">Cómo funciona la cola</h2>
        <p className="text-sm text-[var(--muted-foreground)]">
          Cuando un set está prestado puedes ponerte en su cola. El orden lo marca el
          tiempo que llevas esperando, y el plan Premium entra con unos días de
          ventaja. Como esa ventaja es fija, la espera siempre acaba pesando más: con
          el tiempo suficiente, un Basic adelanta a un Premium que llegó después.
        </p>
      </div>

      <div className="max-w-prose">
        <Terms />
      </div>
    </section>
  );
}
