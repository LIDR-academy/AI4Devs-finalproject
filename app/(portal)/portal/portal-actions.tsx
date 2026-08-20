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
