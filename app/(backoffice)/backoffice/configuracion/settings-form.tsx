"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { numericField } from "@/lib/form-values";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** Etiquetas legibles de cada parámetro; la clave técnica no se enseña sola. */
const LABELS: Record<string, string> = {
  offerConfirmationWindowHours: "Ventana para confirmar una oferta (horas)",
  expiredOfferPenaltyDays: "Penalización al dejar caducar una oferta (días)",
  maxQueuesPerUser: "Colas simultáneas por usuario",
  restrictedSetMinMonths: "Antigüedad mínima para sets restringidos (meses)",
  retentionReminderCadenceDays: "Cadencia de los recordatorios de retención (días)",
};

/**
 * Lo que el número no dice de sí mismo. Solo donde hace falta: una aclaración en cada
 * campo se lee como ruido y deja de leerse.
 */
const HINTS: Record<string, string> = {
  // `wireframes.md` §8.3: el mismo ajuste gobierna dos plazos con motivos distintos.
  // Mientras compartan valor, decirlo aquí es lo que evita que un admin acorte sin
  // saberlo el plazo para reclamar una entrega.
  offerConfirmationWindowHours:
    "Este mismo plazo es el que tiene el suscriptor para reportar una discrepancia en la entrega recibida.",
  retentionReminderCadenceDays:
    "Valor por defecto: cada set puede fijar el suyo desde su ficha del catálogo.",
};

export function SettingsForm({ settings }: { settings: Record<string, number> }) {
  const router = useRouter();
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function save(key: string, value: number | string | null) {
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
          className="flex flex-col gap-1.5"
          onSubmit={(event) => {
            event.preventDefault();
            save(key, numericField(new FormData(event.currentTarget).get("value")));
          }}
        >
          {/* La aclaración va **debajo** de la fila y no dentro de la columna del
              campo: si no, el botón —alineado al final— bajaría a su altura y cada
              parámetro tendría el «Guardar» en un sitio distinto. */}
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex min-w-[18rem] flex-1 flex-col gap-1.5">
              <Label htmlFor={key}>{LABELS[key] ?? key}</Label>
              <Input
                id={key}
                name="value"
                type="number"
                step="0.01"
                min={0}
                defaultValue={value}
                aria-describedby={HINTS[key] ? `${key}-hint` : undefined}
              />
            </div>
            <Button type="submit" size="sm" variant="outline" disabled={saving !== null}>
              {saving === key ? "Guardando…" : "Guardar"}
            </Button>
          </div>
          {HINTS[key] ? (
            <p id={`${key}-hint`} className="text-sm text-[var(--muted-foreground)]">
              {HINTS[key]}
            </p>
          ) : null}
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
