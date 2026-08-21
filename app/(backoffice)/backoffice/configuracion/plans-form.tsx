"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Precio, sets simultáneos y ventaja en cola de un plan (`PATCH /api/plans/:code`,
 * solo admin) — HU-16.
 *
 * Un formulario por plan y **un solo botón por formulario**: los tres campos viajan
 * juntos en la misma llamada, así que subir el precio y bajar el bono es un cambio y
 * no dos, y la auditoría lo registra como tal. Es lo contrario de "Reglas del
 * sistema", donde cada parámetro es independiente y se guarda solo.
 *
 * **La ventaja en cola vive aquí y en ningún otro sitio.** Es el número que
 * `join-queue` congela al encolar (D11); antes había además un parámetro
 * `premiumQueueBonusDays` en las reglas del sistema que no leía nadie, y se ha
 * retirado para que no queden dos mandos y solo uno conectado.
 */

export interface EditablePlan {
  code: string;
  name: string;
  /** Cadena, no número: es un `Decimal` y redondearlo por el camino sería perder céntimos. */
  monthlyPrice: string;
  maxSimultaneousSets: number;
  queueBonusDays: number;
}

export function PlansForm({ plans }: { plans: readonly EditablePlan[] }) {
  return (
    <div className="flex flex-col gap-4">
      {plans.map((plan) => (
        <PlanCard key={plan.code} plan={plan} />
      ))}
    </div>
  );
}

function PlanCard({ plan }: { plan: EditablePlan }) {
  const router = useRouter();
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
      const response = await fetch(`/api/plans/${plan.code}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          // El precio va tal cual lo escribe el admin: el endpoint lo valida con la
          // forma "14.99" y convertirlo a número aquí introduciría binario flotante
          // en un importe.
          monthlyPrice: String(form.get("monthlyPrice") ?? "").replace(",", "."),
          maxSimultaneousSets: Number(form.get("maxSimultaneousSets")),
          queueBonusDays: Number(form.get("queueBonusDays")),
        }),
      });
      if (!response.ok) {
        const problem = await response.json().catch(() => null);
        // El error de campo primero: dice qué corregir, y el `detail` solo que no pudo.
        setError(
          problem?.errors?.[0]?.issue ?? problem?.detail ?? "No se ha podido guardar el plan."
        );
        return;
      }
      setSaved(true);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  const field = (name: string) => `plan-${plan.code}-${name}`;

  return (
    <form
      onSubmit={submit}
      aria-labelledby={`plan-${plan.code}`}
      className="flex flex-col gap-3 rounded-md border p-4"
    >
      <h3 id={`plan-${plan.code}`} className="font-medium">
        {plan.name}
      </h3>

      <div className="flex flex-wrap items-end gap-4">
        <div className="flex w-40 flex-col gap-1.5">
          <Label htmlFor={field("monthlyPrice")}>Precio mensual (€)</Label>
          <Input
            id={field("monthlyPrice")}
            name="monthlyPrice"
            type="text"
            inputMode="decimal"
            defaultValue={plan.monthlyPrice}
          />
        </div>

        <div className="flex w-40 flex-col gap-1.5">
          <Label htmlFor={field("maxSimultaneousSets")}>Sets a la vez</Label>
          <Input
            id={field("maxSimultaneousSets")}
            name="maxSimultaneousSets"
            type="number"
            min={1}
            max={10}
            step={1}
            defaultValue={plan.maxSimultaneousSets}
          />
        </div>

        <div className="flex w-40 flex-col gap-1.5">
          <Label htmlFor={field("queueBonusDays")}>Ventaja en cola (días)</Label>
          <Input
            id={field("queueBonusDays")}
            name="queueBonusDays"
            type="number"
            min={0}
            max={365}
            step={1}
            defaultValue={plan.queueBonusDays}
            aria-describedby={field("bonus-hint")}
          />
        </div>

        <Button type="submit" size="sm" variant="outline" disabled={saving}>
          {saving ? "Guardando…" : "Guardar plan"}
        </Button>
      </div>

      <p id={field("bonus-hint")} className="text-sm text-[var(--muted-foreground)]">
        La ventaja se congela al entrar en una cola: cambiarla no reordena las colas ya
        formadas, solo cuenta para quien se encole a partir de ahora.
      </p>

      {error ? (
        <p role="alert" className="text-sm text-[var(--destructive)]">
          {error}
        </p>
      ) : saved ? (
        <p role="status" className="text-sm text-[var(--muted-foreground)]">
          Plan guardado.
        </p>
      ) : null}
    </form>
  );
}
