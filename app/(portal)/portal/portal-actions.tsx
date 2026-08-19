"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

/** Acción sobre un alquiler o una oferta, con su error a la vista. */
function useAction() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(url: string, body?: unknown, method: "POST" | "PUT" = "POST") {
    setPending(true);
    setError(null);
    try {
      const response = await fetch(url, {
        method,
        ...(body ? { headers: { "content-type": "application/json" }, body: JSON.stringify(body) } : {}),
      });
      if (!response.ok) {
        const problem = await response.json().catch(() => null);
        setError(problem?.detail ?? "No se ha podido completar la acción.");
        return false;
      }
      router.refresh();
      return true;
    } finally {
      setPending(false);
    }
  }

  return { run, pending, error };
}

function ActionError({ error }: { error: string | null }) {
  if (!error) return null;
  return (
    <p role="alert" className="text-sm text-[var(--destructive)]">
      {error}
    </p>
  );
}

export function ReturnButton({ rentalId }: { rentalId: string }) {
  const { run, pending, error } = useAction();
  return (
    <div className="flex flex-col gap-1">
      <Button size="sm" disabled={pending} onClick={() => run(`/api/rentals/${rentalId}/return`)}>
        {pending ? "Enviando…" : "Devolver"}
      </Button>
      <ActionError error={error} />
    </div>
  );
}

/**
 * Cambio de plan desde el portal.
 *
 * El aviso sobre las colas no es decorativo: el bono se congela al encolar (D11), así
 * que hacerse premium **no** adelanta una espera ya empezada. Descubrirlo después de
 * pagar sería la queja evitable más probable de este cambio, y por eso se dice aquí,
 * antes de confirmar, y no en una ayuda aparte.
 */
export function PlanSwitcher({
  options,
}: {
  options: ReadonlyArray<{ code: string; name: string; monthlyPrice: string }>;
}) {
  const { run, pending, error } = useAction();
  if (options.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-[var(--muted-foreground)]">
        Cambiar de plan es inmediato. Si bajas de plan, antes tendrás que devolver los
        sets que no quepan en el nuevo. Las colas en las que ya estás no se reordenan:
        la ventaja del plan se aplica al entrar en la cola, no después.
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <Button
            key={option.code}
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() => run("/api/subscriptions/me", { planCode: option.code }, "PUT")}
          >
            {pending ? "Cambiando…" : `Cambiar a ${option.name} (${option.monthlyPrice} €/mes)`}
          </Button>
        ))}
      </div>
      <ActionError error={error} />
    </div>
  );
}

export function OfferButtons({ offerId }: { offerId: string }) {
  const { run, pending, error } = useAction();
  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-2">
        <Button
          size="sm"
          disabled={pending}
          onClick={() => run(`/api/offers/${offerId}`, { response: "ACCEPT" })}
        >
          Aceptar
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={() => run(`/api/offers/${offerId}`, { response: "REJECT" })}
        >
          Rechazar
        </Button>
      </div>
      <ActionError error={error} />
    </div>
  );
}
