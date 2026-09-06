"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { numericField } from "@/lib/form-values";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Recordatorios de retención de un Set (`PUT /api/sets/:id/retention-reminder`, solo
 * admin) — HU-16, segundo criterio.
 *
 * **Vive en la ficha del set y no en `/backoffice/configuracion`** porque se configura
 * por set: llevarlo al panel de configuración obligaría a inventar un selector de sets
 * ahí, y a decidir a mano un set que ya se está mirando aquí.
 *
 * Al operador se le enseña igual aunque el endpoint le conteste 403: es la regla de la
 * casa (`design-system.md` §7.2) y la misma que sigue `PublicationButton`.
 */
export function RetentionForm({
  setId,
  enabled,
  cadenceDays,
  defaultCadenceDays,
  queueLength,
}: {
  setId: string;
  enabled: boolean;
  cadenceDays: number;
  /** Cadencia del sistema, la que se propone cuando este set aún no tiene la suya. */
  defaultCadenceDays: number;
  /** Cuánta gente espera este set: sin cola no sale ningún recordatorio (D7). */
  queueLength: number;
}) {
  const router = useRouter();
  const [on, setOn] = useState(enabled);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const response = await fetch(`/api/sets/${setId}/retention-reminder`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        // Los dos campos van siempre juntos: el endpoint es un `PUT` y define la
        // configuración entera, no un parche de uno de sus campos.
        body: JSON.stringify({
          enabled: form.get("enabled") === "on",
          cadenceDays: numericField(form.get("cadenceDays")),
        }),
      });
      if (!response.ok) {
        const problem = await response.json().catch(() => null);
        setError(
          problem?.errors?.[0]?.issue ??
            problem?.detail ??
            "No se han podido guardar los recordatorios."
        );
        return;
      }
      setSaved(true);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex items-center gap-2 pb-2">
          <input
            id="retention-enabled"
            name="enabled"
            type="checkbox"
            defaultChecked={enabled}
            onChange={(event) => setOn(event.currentTarget.checked)}
            className="size-4 accent-[var(--primary)]"
          />
          <Label htmlFor="retention-enabled">Recordar a quien lo tenga</Label>
        </div>

        <div className="flex w-40 flex-col gap-1.5">
          <Label htmlFor="retention-cadence">Cadencia (días)</Label>
          <Input
            id="retention-cadence"
            name="cadenceDays"
            type="number"
            min={1}
            max={90}
            step={1}
            defaultValue={cadenceDays}
            aria-describedby="retention-hint"
          />
        </div>

        <Button type="submit" size="sm" variant="outline" disabled={saving}>
          {saving ? "Guardando…" : "Guardar"}
        </Button>
      </div>

      <p id="retention-hint" className="text-sm text-[var(--muted-foreground)]">
        {cadenceDays === defaultCadenceDays
          ? `Por defecto, cada ${defaultCadenceDays} días (regla del sistema).`
          : `El sistema recuerda cada ${defaultCadenceDays} días; este set usa su propia cadencia.`}{" "}
        {/* La condición que más sorprende, dicha antes de que sorprenda: activar los
            recordatorios de un set que nadie espera no envía nada. */}
        {on && queueLength === 0
          ? "Ahora mismo nadie espera este set, así que no se enviará ninguno hasta que haya cola."
          : "Solo se envían mientras haya alguien esperando el set."}
      </p>

      {error ? (
        <p role="alert" className="text-sm text-[var(--destructive)]">
          {error}
        </p>
      ) : saved ? (
        <p role="status" className="text-sm text-[var(--muted-foreground)]">
          Recordatorios guardados.
        </p>
      ) : null}
    </form>
  );
}
