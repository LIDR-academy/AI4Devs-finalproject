"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

/** Qué se puede hacer con una copia según el estado en que esté (PRD §15.5). */
const ACTIONS: Record<string, Array<{ to: string; label: string }>> = {
  INTAKE: [{ to: "DISPONIBLE", label: "Catalogar" }],
  EN_DEVOLUCION: [{ to: "EN_INSPECCION", label: "Recepcionar" }],
  EN_INSPECCION: [
    { to: "EN_HIGIENIZACION", label: "Inspección OK" },
    { to: "INCOMPLETA", label: "Faltan piezas" },
    { to: "BAJA", label: "Dar de baja" },
  ],
  EN_HIGIENIZACION: [{ to: "DISPONIBLE", label: "Higienizada" }],
  INCOMPLETA: [
    { to: "EN_HIGIENIZACION", label: "Piezas repuestas" },
    { to: "BAJA", label: "Dar de baja" },
  ],
};

export function WorkQueueActions({ copyId, state }: { copyId: string; state: string }) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function move(to: string) {
    setPending(to);
    setError(null);
    try {
      const response = await fetch(`/api/copies/${copyId}/transitions`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ to, reason: `Acción desde la cola de trabajo` }),
      });
      if (!response.ok) {
        const problem = await response.json().catch(() => null);
        // El servidor decide qué puede hacer cada rol; aquí solo se muestra. Un
        // operador verá el botón de baja y recibirá un 403 si lo pulsa, que es
        // preferible a esconder acciones y dejarle sin saber por qué no están.
        setError(problem?.detail ?? "No se ha podido completar la acción.");
        return;
      }
      router.refresh();
    } finally {
      setPending(null);
    }
  }

  const actions = ACTIONS[state] ?? [];

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <Button
            key={action.to}
            size="sm"
            variant={action.to === "BAJA" ? "outline" : "default"}
            disabled={pending !== null}
            onClick={() => move(action.to)}
          >
            {pending === action.to ? "…" : action.label}
          </Button>
        ))}
      </div>
      {error ? (
        <p role="alert" className="text-sm text-[var(--destructive)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
