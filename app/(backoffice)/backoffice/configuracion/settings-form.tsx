"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

/** Etiquetas legibles de cada parámetro; la clave técnica no se enseña sola. */
const LABELS: Record<string, string> = {
  offerConfirmationWindowHours: "Ventana para confirmar una oferta (horas)",
  expiredOfferPenaltyDays: "Penalización al dejar caducar una oferta (días)",
  premiumQueueBonusDays: "Ventaja del plan Premium en la cola (días)",
  maxQueuesPerUser: "Colas simultáneas por usuario",
  restrictedSetMinMonths: "Antigüedad mínima para sets restringidos (meses)",
  retentionReminderCadenceDays: "Cadencia de los recordatorios de retención (días)",
  oneOffRentalPricePercent: "Alquiler puntual (% del valor de referencia)",
  oneOffRentalMinPrice: "Importe mínimo del alquiler puntual (€)",
};

export function SettingsForm({ settings }: { settings: Record<string, number> }) {
  const router = useRouter();
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function save(key: string, value: number) {
    setSaving(key);
    setMessage(null);
    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      if (!response.ok) {
        const problem = await response.json().catch(() => null);
        setMessage(problem?.detail ?? "No se ha podido guardar.");
        return;
      }
      setMessage(`Guardado: ${LABELS[key] ?? key}`);
      router.refresh();
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {Object.entries(settings).map(([key, value]) => (
        <form
          key={key}
          className="flex flex-wrap items-end gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            const input = new FormData(event.currentTarget).get("value");
            save(key, Number(input));
          }}
        >
          <div className="flex min-w-[18rem] flex-1 flex-col gap-1.5">
            <label htmlFor={key} className="text-sm font-medium">
              {LABELS[key] ?? key}
            </label>
            <input
              id={key}
              name="value"
              type="number"
              step="0.01"
              min={0}
              defaultValue={value}
              className="h-9 rounded-md border px-3 text-sm"
            />
          </div>
          <Button type="submit" size="sm" variant="outline" disabled={saving !== null}>
            {saving === key ? "Guardando…" : "Guardar"}
          </Button>
        </form>
      ))}
      {message ? (
        <p role="status" className="text-sm text-[var(--muted-foreground)]">
          {message}
        </p>
      ) : null}
    </div>
  );
}
