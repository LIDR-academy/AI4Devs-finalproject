"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

/** Acción sobre la propia suscripción, con su error a la vista. */
function useSubscription() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(body: Record<string, string>) {
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/subscriptions/me", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const problem = await response.json().catch(() => null);
        setError(problem?.detail ?? "No se ha podido completar la acción.");
        return;
      }
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return { send, pending, error };
}

const EUR = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });

function ActionError({ error }: { error: string | null }) {
  if (!error) return null;
  return (
    <p role="alert" className="text-sm text-[var(--destructive)]">
      {error}
    </p>
  );
}

export interface PlanOption {
  code: string;
  name: string;
  monthlyPrice: string;
  maxSimultaneousSets: number;
  /** Por qué no se puede cambiar a este plan ahora mismo; `null` si sí se puede. */
  blocked: { mustReturn: number; detail: string } | null;
}

/**
 * Cambio de plan (`wireframes.md` §7.4).
 *
 * **El aviso del downgrade se enseña antes de pulsar, no después.** El servidor lo
 * calcula igual —`canSwitchToPlan` devuelve cuántos sets hay que devolver—, así que la
 * página lo pinta al renderizar y el `409 PLAN_DOWNGRADE_BLOCKED` queda para la
 * carrera. Un número es accionable; "tienes sets pendientes" no.
 *
 * El aviso sobre las colas tampoco es decorativo: el bono se congela al encolar (D11),
 * así que hacerse premium **no** adelanta una espera ya empezada. Descubrirlo después
 * de pagar sería la queja evitable más probable de este cambio.
 */
export function PlanSwitcher({ options }: { options: readonly PlanOption[] }) {
  const { send, pending, error } = useSubscription();
  if (options.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      {options.map((option) => (
        <div key={option.code} className="flex flex-col gap-2 rounded-md border p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm">
              <strong>{option.name}</strong> · {EUR.format(Number(option.monthlyPrice))}/mes ·{" "}
              {option.maxSimultaneousSets === 1
                ? "1 set a la vez"
                : `${option.maxSimultaneousSets} sets a la vez`}
            </p>
            <Button
              size="sm"
              disabled={pending || option.blocked !== null}
              onClick={() => send({ planCode: option.code })}
            >
              {pending ? "Cambiando…" : "Cambiar"}
            </Button>
          </div>
          {option.blocked ? (
            <p className="rounded-md border border-[var(--tone-warning-border)] bg-[var(--tone-warning)] p-3 text-sm text-[var(--tone-warning-foreground)]">
              {option.blocked.detail}
            </p>
          ) : null}
        </div>
      ))}
      <p className="text-sm text-[var(--muted-foreground)]">
        El cambio es inmediato. Las colas en las que ya estás no se reordenan: la ventaja
        del plan se aplica al entrar en la cola, no después.
      </p>
      <ActionError error={error} />
    </div>
  );
}

/**
 * Pausar, reactivar y cancelar (`wireframes.md` §7.4).
 *
 * Las tres comparten regla —`canEndSubscription`, que mide solo lo que el suscriptor
 * tiene **en su poder**— y esa regla **no** es la del cambio de plan, que mide lo que
 * ocupa plaza. Con una copia en inspección se puede pausar pero no bajar de plan: es
 * deliberado, porque retener la suscripción por nuestro proceso interno sería injusto.
 */
export function SubscriptionStatusActions({
  status,
  blocked,
}: {
  status: "ACTIVE" | "PAUSED";
  /** Motivo por el que ahora no puede pausar ni cancelar; `null` si puede. */
  blocked: string | null;
}) {
  const { send, pending, error } = useSubscription();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {status === "ACTIVE" ? (
          <Button
            variant="outline"
            disabled={pending || blocked !== null}
            onClick={() => send({ status: "PAUSED" })}
          >
            {pending ? "…" : "Pausar"}
          </Button>
        ) : (
          <Button disabled={pending} onClick={() => send({ status: "ACTIVE" })}>
            {pending ? "…" : "Reactivar"}
          </Button>
        )}

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" disabled={pending || blocked !== null}>
              Cancelar la suscripción
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Cancelar la suscripción?</AlertDialogTitle>
              <AlertDialogDescription>
                Dejarás de poder llevarte sets al momento, y en las colas en las que
                esperas dejarán de ofrecerte copias — aunque no pierdes el turno.{" "}
                <strong>Es definitivo desde el portal</strong>: para volver a tener plan
                habría que contratarlo de nuevo. Si solo quieres dejarlo aparcado una
                temporada, pausa en vez de cancelar.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Volver</AlertDialogCancel>
              <AlertDialogAction onClick={() => send({ status: "CANCELLED" })}>
                Sí, cancelar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {blocked ? (
        <p className="text-sm text-[var(--muted-foreground)]">{blocked}</p>
      ) : (
        <p className="text-sm text-[var(--muted-foreground)]">
          Mientras esté en pausa no podrás llevarte sets nuevos.
        </p>
      )}
      <ActionError error={error} />
    </div>
  );
}
