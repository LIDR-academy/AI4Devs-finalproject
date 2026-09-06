"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CONDITION_CHECKLIST_ITEMS, emptyChecklist } from "@/domain/rentals/condition-checklist";

/**
 * Los tres resultados de `ConditionResult`, con lo que significa cada uno. La etiqueta
 * corta sola —"Incompleta"— no le dice al operador cuál elegir con el set delante.
 */
const RESULTS = [
  { value: "OK", label: "Correcta", hint: "completa y en buen estado" },
  { value: "INCOMPLETE", label: "Incompleta", hint: "faltan piezas" },
  { value: "DAMAGED", label: "Dañada", hint: "hay piezas rotas o deterioradas" },
] as const;

/**
 * Registro de entrega — W2 (`wireframes.md` §4.2).
 *
 * **El resultado va arriba y las comprobaciones debajo** porque el campo obligatorio es
 * `result` y el `checklist` es opcional: poner primero lo que la API exige evita el
 * formulario que se rellena entero y falla por lo primero.
 *
 * Las casillas salen del catálogo de dominio, no de una lista escrita aquí: la misma
 * que usa la inspección, que es lo que hace comparables los dos informes de un alquiler.
 */
export function DeliveryForm({
  rentalId,
  subscriberName,
  windowHours,
}: {
  rentalId: string;
  subscriberName: string;
  windowHours: number;
}) {
  const router = useRouter();
  const [result, setResult] = useState<string>("OK");
  const [checklist, setChecklist] = useState(emptyChecklist());
  const [notes, setNotes] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const response = await fetch(`/api/rentals/${rentalId}/delivery`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ result, checklist, notes: notes.trim() || null }),
      });
      if (!response.ok) {
        const problem = await response.json().catch(() => null);
        setError(problem?.detail ?? "No se ha podido guardar el registro.");
        return;
      }
      // De vuelta a la cola: la copia ya no está en ella —tiene envío preparado— y el
      // operador sigue con lo siguiente, que es el sitio donde estaba trabajando.
      router.push("/backoffice");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex max-w-2xl flex-col gap-6">
      <fieldset className="flex flex-col gap-2">
        {/* Tres radios sueltos sin agrupar no se anuncian como una elección (§4.5). */}
        <legend className="mb-2 text-sm font-semibold">Estado de la copia</legend>
        {RESULTS.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-start gap-3 rounded-md border p-3 text-sm has-checked:border-[var(--foreground)]"
          >
            <input
              type="radio"
              name="result"
              value={option.value}
              className="mt-0.5"
              checked={result === option.value}
              onChange={() => setResult(option.value)}
            />
            <span>
              <strong>{option.label}</strong>
              <span className="text-[var(--muted-foreground)]"> — {option.hint}</span>
            </span>
          </label>
        ))}
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-semibold">Comprobaciones</legend>
        {CONDITION_CHECKLIST_ITEMS.map((item) => (
          <label key={item.id} className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              className="mt-0.5"
              checked={checklist[item.id]}
              onChange={(event) =>
                setChecklist((current) => ({ ...current, [item.id]: event.target.checked }))
              }
            />
            <span>
              {item.label}
              <span className="block text-xs text-[var(--muted-foreground)]">{item.hint}</span>
            </span>
          </label>
        ))}
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">Observaciones (opcional)</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          maxLength={1000}
          placeholder="Qué pieza falta, qué está deteriorado…"
        />
      </div>

      {/* No es decorativo: guardar dispara el reloj de la discrepancia, y el operador
          tiene que saber que a partir de ahí la copia queda documentada. Las horas salen
          de la configuración, nunca escritas a mano. */}
      <p className="rounded-md border border-[var(--tone-warning-border)] bg-[var(--tone-warning)] p-3 text-sm text-[var(--tone-warning-foreground)]">
        Al guardar, el envío queda preparado y {subscriberName} tendrá {windowHours} h para
        revisar la entrega y reportar cualquier diferencia.
      </p>

      {error ? (
        <p role="alert" className="text-sm text-[var(--destructive)]">
          {error}{" "}
          <a href="/backoffice" className="underline">
            Volver a la cola de trabajo
          </a>
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Guardando…" : "Guardar y preparar envío"}
        </Button>
        <Button type="button" variant="outline" disabled={pending} onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
