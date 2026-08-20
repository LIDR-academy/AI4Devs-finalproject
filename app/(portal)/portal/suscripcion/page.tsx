import Link from "next/link";

import { StatusBadge } from "@/components/status-badge";
import { canEndSubscription, canSwitchToPlan } from "@/domain/subscriptions/eligibility";
import { requireSurfacePage } from "@/http/auth-context";
import { simultaneousSets, subscriptionStatus } from "@/lib/status";
import { prismaSubscriptionRepository } from "@/repositories/subscription.repository.prisma";

import { PlanSwitcher, SubscriptionStatusActions, type PlanOption } from "../subscription-actions";

export const metadata = { title: "Tu suscripción" };

const DATE = new Intl.DateTimeFormat("es-ES", { dateStyle: "long" });
const EUR = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });

/**
 * Tu suscripción — `wireframes.md` §7.4.
 *
 * La pantalla que da sitio a las tres acciones que la API tenía y la interfaz no:
 * pausar, cancelar y reactivar (`PUT /api/subscriptions/me`).
 *
 * **Los dos veredictos se calculan aquí, al pintar**, y no se esperan como error:
 * `canSwitchToPlan` dice cuántos sets habría que devolver para bajar de plan y
 * `canEndSubscription` si se puede pausar o cancelar. El suscriptor lo sabe antes de
 * pulsar; los 409 quedan para la carrera.
 *
 * Y **miden cosas distintas a propósito**: el cambio de plan cuenta lo que ocupa plaza
 * (`OCCUPYING_COPY_STATES`); pausar y cancelar, solo lo que está **en su poder**
 * (`HELD_COPY_STATES`). Con una copia en inspección se puede pausar pero no bajar de
 * plan, porque retener la suscripción por nuestro proceso interno sería injusto.
 */
export default async function PortalSuscripcionPage() {
  const { user } = await requireSurfacePage("portal");

  const [subscription, plans, copyStates] = await Promise.all([
    prismaSubscriptionRepository.findCurrentSubscription(user.id),
    prismaSubscriptionRepository.listPlans(),
    prismaSubscriptionRepository.currentCopyStates(user.id),
  ]);

  // Sin suscripción vigente no hay nada que gestionar: una cancelada ya no rige y el
  // repositorio la da por inexistente. Es un vacío de tipo "todavía no", con salida.
  if (!subscription) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold tracking-tight">Tu suscripción</h1>
        <div className="flex flex-col gap-2 rounded-md border p-4">
          <StatusBadge status={subscriptionStatus("CANCELLED")} />
          <p className="text-sm text-[var(--muted-foreground)]">
            No tienes ningún plan activo, así que no puedes llevarte sets.{" "}
            <Link href="/planes" className="underline">
              Ver los planes
            </Link>
          </p>
        </div>
      </div>
    );
  }

  const currentPlan = plans.find((plan) => plan.code === subscription.planCode);
  const endVerdict = canEndSubscription(copyStates);

  const options: PlanOption[] = plans
    .filter((plan) => plan.active && plan.code !== subscription.planCode)
    .map((plan) => {
      const verdict = canSwitchToPlan(copyStates, plan.maxSimultaneousSets);
      return {
        code: plan.code,
        name: plan.name,
        monthlyPrice: plan.monthlyPrice,
        maxSimultaneousSets: plan.maxSimultaneousSets,
        blocked: verdict.allowed ? null : { mustReturn: verdict.mustReturn, detail: verdict.detail },
      };
    });

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold tracking-tight">Tu suscripción</h1>

      <section className="flex flex-col gap-3" aria-labelledby="plan-actual">
        <h2 id="plan-actual" className="sr-only">
          Plan actual
        </h2>
        <div className="flex flex-col gap-2 rounded-md border p-4">
          <p className="flex flex-wrap items-center gap-2">
            <StatusBadge status={subscriptionStatus(subscription.status)} />
            <span className="text-sm">
              <strong>{currentPlan?.name ?? subscription.planCode}</strong>
              {currentPlan ? ` · ${EUR.format(Number(currentPlan.monthlyPrice))}/mes` : ""}
            </span>
          </p>
          <p className="text-sm text-[var(--muted-foreground)]">
            {simultaneousSets(subscription.maxSimultaneousSets)} · desde el{" "}
            {DATE.format(subscription.startedAt)}
          </p>
          {subscription.status === "PAUSED" ? (
            <p className="text-sm text-[var(--muted-foreground)]">
              En pausa no puedes llevarte sets nuevos. Reactívala cuando quieras.
            </p>
          ) : null}
        </div>
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="cambiar-plan">
        <h2 id="cambiar-plan" className="text-lg font-semibold">
          Cambiar de plan
        </h2>
        <PlanSwitcher options={options} />
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="pausar-cancelar">
        <h2 id="pausar-cancelar" className="text-lg font-semibold">
          Pausar o cancelar
        </h2>
        {subscription.status === "CANCELLED" ? null : (
          <SubscriptionStatusActions
            status={subscription.status}
            blocked={endVerdict.eligible ? null : endVerdict.detail}
          />
        )}
      </section>
    </div>
  );
}
